import { Body, Controller, Post } from '@nestjs/common';
import { ADMIN_ROLE, STUDENT_ROLE } from 'src/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password } = createUserDto;

    return this.usersService.create(
      firstName,
      lastName,
      email,
      password,
      STUDENT_ROLE,
    );
  }

  @Post('admin')
  createAdmin(@Body() createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password } = createUserDto;

    return this.usersService.create(
      firstName,
      lastName,
      email,
      password,
      ADMIN_ROLE,
    );
  }
}
