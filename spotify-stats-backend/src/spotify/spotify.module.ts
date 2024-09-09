import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { AppService } from 'src/app.service';

@Module({
  imports: [],
  controllers: [SpotifyController],
  providers: [SpotifyService, AppService],
  exports: [SpotifyService],
})
export class SpotifyModule {}
