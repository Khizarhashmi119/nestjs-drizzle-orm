import { MongoAbility } from '@casl/ability';
import { Action } from 'src/constants';
import { Subjects } from './subjects.type';

export type AppAbility = MongoAbility<[Action, Subjects]>;
