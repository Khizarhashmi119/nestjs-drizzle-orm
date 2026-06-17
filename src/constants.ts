export const DB_PROVIDER = 'DRIZZLE';

export const ADMIN_ROLE = 'admin' as const;
export const TEACHER_ROLE = 'teacher' as const;
export const STUDENT_ROLE = 'student' as const;

export const USER_ROLES = [ADMIN_ROLE, TEACHER_ROLE, STUDENT_ROLE] as const;
export type UserRoles = (typeof USER_ROLES)[number];

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
