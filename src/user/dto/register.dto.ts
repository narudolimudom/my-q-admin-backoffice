import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
