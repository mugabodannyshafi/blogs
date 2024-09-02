import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthPayloadDto {
  @ApiProperty({
    description: "User's email",
    example: 'mugabodannyshafi@gmail.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: "User's password",
    example: 'password123',
  })
  @IsString()
  password: string;
}
