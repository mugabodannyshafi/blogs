import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

@ApiTags('reports')
@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOkResponse({
    description: 'All reports sent to users',
  })
  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'PDF report generated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Ending date cannot be in the future',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        startingDate: { type: 'date', example: '2024-09-20 00:42:37' },
        endingDate: { type: 'date', example: '2024-09-27 17:14:08' },
      },
    },
  })
  findOne(@Req() request: Request, @Body() createReportDto: CreateReportDto) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.reportService.findOne(createReportDto, json.userId);
  }
}
