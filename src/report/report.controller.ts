import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Request } from 'express';
import { AuthenticatedGuard } from 'src/auth/guards/local.guard';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  @UseGuards(AuthenticatedGuard)
  @Post()
  findOne(@Req() request: Request ,@Body() createReportDto: CreateReportDto) {
    const userId = request.session.userId
    return this.reportService.findOne(createReportDto, userId)
  }

}
