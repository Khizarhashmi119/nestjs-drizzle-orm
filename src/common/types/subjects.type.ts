import { InferSubjects } from '@casl/ability';
import { InferSelectModel } from 'drizzle-orm';
import { courses, users } from 'src/database/schemas';

export type User = InferSelectModel<typeof users> & { kind: 'User' };
export type Course = InferSelectModel<typeof courses> & { kind: 'Course' };
export type Subjects = InferSubjects<User | Course> | 'all';
