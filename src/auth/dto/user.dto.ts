import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'Username',
    example: 'MUGABO Shafi Danny',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User email',
    example: 'mugaboshafidanny@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @MinLength(5)
  password: string;
}
