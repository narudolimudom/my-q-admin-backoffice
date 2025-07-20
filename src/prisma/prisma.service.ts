import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public onModuleInit() {
    this.$connect()
      .then(() => console.log('Connected to DB'))
      .catch((err) => {
        console.log(err);
      });
  }

  public enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
