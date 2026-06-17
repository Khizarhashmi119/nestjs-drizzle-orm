import {
  decimal,
  index,
  pgTable,
  text,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { commonFields } from './common-fields';
import { users } from './users.schema';

export const courses = pgTable('courses', {
  ...commonFields,
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: decimal('duration', { precision: 6, scale: 2 }).notNull(),
  instructorId: varchar('instructor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const courseStudentEnrollments = pgTable(
  'course_enrollments',
  {
    ...commonFields,
    courseId: varchar('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    studentId: varchar('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [
    unique('unique_course_student').on(t.courseId, t.studentId),
    index('course_student_course_id_idx').on(t.courseId),
    index('course_student_student_id_idx').on(t.studentId),
  ],
);
