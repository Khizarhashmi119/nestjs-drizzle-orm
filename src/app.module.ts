import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { validateEnv } from './config/validate-env';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: validateEnv,
    }),
    CommonModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    CoursesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
