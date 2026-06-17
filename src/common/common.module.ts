import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { CookieService } from './cookie.service';
import { loggerConfig } from './logger.config';

@Global()
@Module({
  imports: [PinoLoggerModule.forRoot(loggerConfig)],
  providers: [CookieService],
  exports: [CookieService],
})
export class CommonModule {}
