import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsEmail } from 'class-validator';

export class AuthPayloadDto {
  @ApiProperty({
    description: "User's email",
    example: 'mugabodannyshafi@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User's password",
    example: 'password123',
  })
  @IsString()
  password: string;
}