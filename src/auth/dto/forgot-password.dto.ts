import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'mugabodannyshafi250@gmail.com',
  })
  @IsEmail()
  email: string;
}