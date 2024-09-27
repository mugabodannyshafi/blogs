import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: "User's comment",
    example: 'This is good !',
  })
  @IsString()
  comment: string;
}
