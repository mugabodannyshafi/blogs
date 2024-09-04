import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UserDto {
  @ApiProperty({
    description: 'User email',
    example: 'mugaboshafidanny@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'MUGABO Shafi Danny',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @MinLength(5)
  password: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @MinLength(5)
  password_confirmation: string;

  @ApiPropertyOptional({
    description: 'User password',
    example: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
  })
  @IsOptional()
  profile?: string;
}
