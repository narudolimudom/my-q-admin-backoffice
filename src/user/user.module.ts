// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // ต้อง Export เพื่อให้ AuthModule สามารถ Inject UserService ได้
})
export class UserModule {}