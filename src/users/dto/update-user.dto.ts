import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { UserDto } from 'src/auth/dto/user.dto'
export class updateUserDto extends PartialType(UserDto) {
  @ApiPropertyOptional({
    description: 'User email',
    example: 'mugaboshafidanny@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'MUGABO Shafi Danny',
  })
  @IsString()
  @IsOptional()
  username?: string;
}