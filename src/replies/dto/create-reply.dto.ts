import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({
    description: 'Reply',
    example: 'Absolutely',
  })
  @IsString()
  reply: string;
}
