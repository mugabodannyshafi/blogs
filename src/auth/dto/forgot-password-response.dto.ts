import { ApiProperty } from "@nestjs/swagger"

export class ForgotResponse {
    @ApiProperty({
        example: 'if user exists will receive an email to reset password',
        description: 'Response'
    })
    message: string
}