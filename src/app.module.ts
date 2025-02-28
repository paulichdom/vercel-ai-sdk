import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [ConfigModule.forRoot(), StreamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
