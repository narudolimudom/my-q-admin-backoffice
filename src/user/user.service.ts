// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register.dto';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) { }

    public async getUserDetailByEmail(email: string) {
        console.log("Eemail", email)
        return  await this.prismaService.user.findUnique({
            where: { email }
        });
    }

    public async registerUser(registerUserRequest: RegisterUserDto) {
        const { password } = registerUserRequest
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds)
        return await this.prismaService.user.create({
            data: {
                ...registerUserRequest,
                password: hashedPassword
            }
        })
    }

    async findAllUsers() {
        return await this.prismaService.user.findMany({
            select: { id: true, email: true, role: true, createdAt: true } // ไม่ควรดึง password มา
        });
    }

    async updateUserRole(id: string, role: Role) {
        return this.prismaService.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, role: true, createdAt: true }
        });
    }

    async deleteUser(id: string): Promise<void> {
        await this.prismaService.user.delete({ where: { id } });
    }
}