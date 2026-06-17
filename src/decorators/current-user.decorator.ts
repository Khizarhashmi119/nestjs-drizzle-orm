import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { TCurrentUser } from '../auth/types/current-user.type';

export const CurrentUser = createParamDecorator(
  (field: keyof TCurrentUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request.user as TCurrentUser;
    return field ? user[field] : user;
  },
);
