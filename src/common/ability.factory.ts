import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { TCurrentUser } from 'src/auth/types/current-user.type';
import { Action, ADMIN_ROLE, TEACHER_ROLE } from 'src/constants';
import { AppAbility } from './types/app-ability.type';

export class AbilityFactory {
  createUserAbility(currentUser: TCurrentUser) {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (currentUser.role === ADMIN_ROLE) {
      builder.can(Action.Manage, 'all');
    } else if (currentUser.role === TEACHER_ROLE) {
      builder.can(Action.Manage, 'Course', {
        instructorId: currentUser.id,
      });
    } else {
      builder.can(Action.Read, 'all');
    }

    return builder.build();
  }
}
