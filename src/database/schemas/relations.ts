import { relations } from 'drizzle-orm';
import { courses, courseStudentEnrollments } from './courses.schema';
import { permissions, rolePermissions } from './permissions.schema';
import { userSessions } from './user-sessions.schema';
import { roles } from './roles.schema';
import { users } from './users.schema';

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  courseStudentEnrollments: many(courseStudentEnrollments),
}));

export const courseStudentsRelations = relations(
  courseStudentEnrollments,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseStudentEnrollments.courseId],
      references: [courses.id],
    }),
    student: one(users, {
      fields: [courseStudentEnrollments.studentId],
      references: [users.id],
    }),
  }),
);

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const sessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  userSessions: many(userSessions),
  instructedCourses: many(courses),
  courseStudentEnrollments: many(courseStudentEnrollments),
}));
