import { InferSubjects } from '@casl/ability';

export type Subjects = InferSubjects<'all' | 'Course' | 'User'>;
