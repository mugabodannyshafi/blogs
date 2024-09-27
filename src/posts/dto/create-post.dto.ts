import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'Rwanda',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Post content',
    example: 'Rwanda is a country in East Africa',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Post author',
    example: 'MUGABO Shafi Danny',
  })
  @IsString()
  author: string;

  @ApiPropertyOptional({
    description: 'Post author',
    example:
      'https://centrichotel.rw/wp-content/uploads/2023/01/cityscape-things-to-do-in-kigali-rwanda_44e57bd0bf.jpeg',
  })
  @IsOptional()
  image: string;
}
