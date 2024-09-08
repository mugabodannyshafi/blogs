import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";



export class ResetPasswordDto{
    @ApiProperty({
        description: 'this is reset token',
        example: '1234567890'
    })
    @IsString()
    resetToken: string;

    @ApiProperty({
        description: 'this is new password',
        example: 'danny12345'
    })
    @IsString()
    newPassword: string;
}