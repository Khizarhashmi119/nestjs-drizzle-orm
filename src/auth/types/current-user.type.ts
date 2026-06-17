import { UserRoles } from 'src/constants';

export type TCurrentUser<TUserSessionId extends string | null = string> = {
  id: string;
  email: string;
  role: UserRoles;
  userSessionId: TUserSessionId;
};
