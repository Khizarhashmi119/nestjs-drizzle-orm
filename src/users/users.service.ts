import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { DB_PROVIDER, STUDENT_ROLE, UserRoles } from 'src/constants';
import * as schemas from 'src/database/schemas';
import type { Database } from 'src/database/types/database';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_PROVIDER)
    private readonly db: Database,
  ) {}

  async create(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    roleName: UserRoles = STUDENT_ROLE,
  ) {
    const hashedPassword = await argon2.hash(password);

    const users = await this.db
      .select()
      .from(schemas.users)
      .where(eq(schemas.users.email, email))
      .limit(1);

    if (users.length > 0) {
      throw new BadRequestException('Email already exists');
    }

    const roles = await this.db
      .select({
        id: schemas.roles.id,
      })
      .from(schemas.roles)
      .where(eq(schemas.roles.role, roleName))
      .limit(1);

    if (roles.length === 0) {
      throw new BadRequestException('User role not found');
    }

    const role = roles[0];

    return this.db
      .insert(schemas.users)
      .values({
        firstName,
        lastName,
        email,
        roleId: role.id,
        password: hashedPassword,
      })
      .returning({
        id: schemas.users.id,
        firstName: schemas.users.firstName,
        lastName: schemas.users.lastName,
        roleId: schemas.users.roleId,
        email: schemas.users.email,
      });
  }
}
