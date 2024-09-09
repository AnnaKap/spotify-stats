import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private configService: ConfigService,
  ) {}

  async getRedisData(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  async setRedisData(key: string, value: string): Promise<string> {
    const result = await this.redisClient.set(key, value);
    return result;
  }

  getRedisPort(): string {
    return this.configService.get<string>('REDIS_PORT');
  }

  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST');
  }

  getSpotifyClientId(): string {
    return this.configService.get<string>('SPOTIFY_CLIENT_ID');
  }

  getSpotifyClientSecret(): string {
    return this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
  }

  getSpotifyRedirectURI(): string {
    return this.configService.get<string>('SPOTIFY_REDIRECT_URI');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
