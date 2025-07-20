// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { LoginAdminDto } from './dto/login-admin.dto';

@Controller('admin/auth') // Prefix สำหรับ Admin Auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginAdminDto: any) {
    return this.authService.login(loginAdminDto);
  }

  // (Optional) สำหรับทดสอบว่า Token ใช้ได้
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user; // จะได้ข้อมูล user จาก JWT payload (userId, username, role)
  }

  // (Optional) API สำหรับลงทะเบียน Admin ครั้งแรก (ควรมีแค่ครั้งเดียว)
  // อาจจะปิดใน Production หรือใช้ Seed data แทน
  // @Post('register-admin')
  // async registerAdmin(@Body() body: { username: string; password: string }) {
  //     return this.authService.registerAdmin(body.username, body.password);
  // }
}