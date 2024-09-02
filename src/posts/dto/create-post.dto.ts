import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class CreatePostDto {
    @ApiProperty({
        description: 'Post title',
        example: 'Rwanda'
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Post content',
        example: 'Rwanda is a country in East Africa'
    })
    @IsString()
    content: string

    @ApiProperty({
        description: 'Post author',
        example: 'MUGABO Shafi Danny'
    })
    @IsString()
    author: string
}
