import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";



export class ChangePasswordDto{
    @ApiProperty({
        description: 'Old password',
        example: 'oldpassword'
    })
    @IsString()
    oldPassword: string;

    @ApiProperty({
        description: 'New password',
        example: 'newpassword'
    })
    @IsString()
    newPassword: string;
}