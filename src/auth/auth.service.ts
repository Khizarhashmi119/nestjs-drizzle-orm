import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import ms, { StringValue } from 'ms';
import { v7 as uuidV7 } from 'uuid';
import { EnvSchema } from '../config/env.schema';
import { DB_PROVIDER } from '../constants';
import * as schemas from '../database/schemas';
import type { Database } from '../database/types/database';
import { TCurrentUser } from './types/current-user.type';
import { TokenPayload } from './types/token-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<EnvSchema, true>,
    private readonly jwtService: JwtService,
    @Inject(DB_PROVIDER)
    private readonly db: Database,
  ) {}

  async login(
    currentUser: TCurrentUser<null>,
    ipAddress: string,
    userAgent: string,
  ) {
    const sessionId = uuidV7();
    const access = this.signAccessToken(currentUser.id, sessionId);

    const { token: refreshToken, expiresAt: refreshExpiresAt } =
      this.signRefreshToken(currentUser.id, sessionId);

    await this.db.insert(schemas.userSessions).values({
      id: sessionId,
      ipAddress,
      lastUsedAt: new Date(),
      refreshToken: await argon2.hash(refreshToken),
      expiresAt: refreshExpiresAt,
      userAgent,
      userId: currentUser.id,
    });

    return {
      access,
      refresh: {
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    };
  }

  async refreshToken(currentUser: TCurrentUser) {
    const { userSessionId: sessionId } = currentUser;

    const access = this.signAccessToken(currentUser.id, sessionId);

    const { token: refreshToken, expiresAt: refreshExpiresAt } =
      this.signRefreshToken(currentUser.id, sessionId);

    await this.db
      .update(schemas.userSessions)
      .set({
        expiresAt: refreshExpiresAt,
        refreshToken: await argon2.hash(refreshToken),
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schemas.userSessions.id, sessionId))
      .returning();

    return {
      access,
      refresh: {
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<TCurrentUser<null>> {
    const users = await this.db
      .select({
        id: schemas.users.id,
        email: schemas.users.email,
        role: schemas.roles.role,
        password: schemas.users.password,
      })
      .from(schemas.users)
      .innerJoin(schemas.roles, eq(schemas.users.roleId, schemas.roles.id))
      .where(eq(schemas.users.email, email))
      .limit(1);

    if (!users.length) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = users[0];
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      userSessionId: null,
    };
  }

  async validateAccessToken(token: TokenPayload): Promise<TCurrentUser> {
    const { sessionId, sub, type } = token;

    if (type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const userSessions = await this.db
      .select()
      .from(schemas.userSessions)
      .where(eq(schemas.userSessions.id, sessionId))
      .limit(1);

    if (!userSessions.length) {
      throw new UnauthorizedException('Invalid user session');
    }

    const userSession = userSessions[0];

    if (userSession.expiresAt < new Date()) {
      throw new UnauthorizedException('User session expired');
    }

    if (userSession.isRevoked) {
      throw new UnauthorizedException('User session revoked');
    }

    const users = await this.db
      .select({
        email: schemas.users.email,
        role: schemas.roles.role,
      })
      .from(schemas.users)
      .innerJoin(schemas.roles, eq(schemas.users.roleId, schemas.roles.id))
      .where(eq(schemas.users.id, sub))
      .limit(1);

    if (!users.length) {
      throw new UnauthorizedException('User not found');
    }

    const user = users[0];

    return {
      id: sub,
      email: user.email,
      role: user.role,
      userSessionId: sessionId,
    };
  }

  async validateRefreshToken(token: TokenPayload): Promise<TCurrentUser> {
    const { sessionId, sub, type } = token;

    if (type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const userSessions = await this.db
      .select()
      .from(schemas.userSessions)
      .where(eq(schemas.userSessions.id, sessionId))
      .limit(1);

    if (!userSessions.length) {
      throw new UnauthorizedException('Invalid user session');
    }

    const userSession = userSessions[0];

    if (userSession.expiresAt < new Date()) {
      throw new UnauthorizedException('User session expired');
    }

    if (userSession.isRevoked) {
      throw new UnauthorizedException('User session revoked');
    }

    const users = await this.db
      .select({
        email: schemas.users.email,
        role: schemas.roles.role,
      })
      .from(schemas.users)
      .innerJoin(schemas.roles, eq(schemas.users.roleId, schemas.roles.id))
      .where(eq(schemas.users.id, sub))
      .limit(1);

    if (!users.length) {
      throw new UnauthorizedException('User not found');
    }

    const user = users[0];

    return {
      id: sub,
      email: user.email,
      role: user.role,
      userSessionId: sessionId,
    };
  }

  signAccessToken(userId: string, sessionId: string) {
    const payload: TokenPayload = {
      sub: userId,
      sessionId,
      type: 'access',
    };

    const secret = this.configService.get('JWT_ACCESS_SECRET', { infer: true });
    const expiresIn = this.configService.get<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
    );

    const expiresAt = this.getExpiresAt(expiresIn);

    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    return { token, expiresAt };
  }

  signRefreshToken(userId: string, sessionId: string) {
    const payload: TokenPayload = {
      sub: userId,
      sessionId,
      type: 'refresh',
    };

    const secret = this.configService.get('JWT_REFRESH_SECRET', {
      infer: true,
    });

    const expiresIn = this.configService.get<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const expiresAt = this.getExpiresAt(expiresIn);

    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    return { token, expiresAt };
  }

  private getExpiresAt(expiresIn: StringValue) {
    return new Date(Date.now() + ms(expiresIn));
  }
}
