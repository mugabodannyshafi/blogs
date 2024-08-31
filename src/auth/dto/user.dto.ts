import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class UserDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(5)
    @Matches(/^(?=.*[0-9])/, { message: 'password must contain any number' })
    password: string;
}
