import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisHost = process.env.REDIS_HOSt || 'localhost';
        const redisPort = process.env.REDIS_PORT
          ? parseInt(process.env.REDIS_PORT, 10)
          : 6379;
        return new Redis({ host: redisHost, port: redisPort });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
