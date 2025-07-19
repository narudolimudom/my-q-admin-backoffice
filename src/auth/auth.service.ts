import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
// import { LoginAdminDto } from './dto/login-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log("AAAAAAAAAA")
    const user = await this.userService.getUserDetailByEmail(email);
    console.log("BBBBBBBBB")
    if (user && (await bcrypt.compare(pass, user.password))) {
      if (user.role !== Role.ADMIN) {
          throw new UnauthorizedException();
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginAdminDto: any) {
    console.log("TRIGGER")
    const user = await this.validateUser(loginAdminDto.email, loginAdminDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // (Optional) เมธอดสำหรับ Register Admin ครั้งแรก (ควรทำด้วยมือหรือผ่าน Seed ข้อมูล)
  // ไม่ควรมี API ให้ Register Admin ผ่านหน้า Frontend โดยตรง
  async registerAdmin(email: string, passwordPlain: string) {
      const existingUser = await this.userService.getUserDetailByEmail(email);
      if (existingUser) {
          throw new BadRequestException();
      }
      const hashedPassword = await bcrypt.hash(passwordPlain, 10);
      return this.userService.registerUser({
          email,
          password: hashedPassword,
          role: Role.ADMIN
      } as any);
  }
}