import { IsDate, IsDateString } from "class-validator";

export class CreateReportDto {
    @IsDateString()
    startingDate: Date

    @IsDateString()
    endingDate: Date
}
