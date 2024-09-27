import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('file')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') storageType: string,
  ) {
    return this.storageService.handleFileUpload(file, storageType);
  }

  @Get('retrieve/:fileName')
  async retrieveFile(
    @Param('fileName') fileName: string,
    @Query('type') storageType: string,
  ): Promise<string> {
    return this.storageService.handleRetrieveFile(fileName, storageType);
  }

  @Delete('delete/:fileName')
  async deleteFile(
    @Param('fileName') fileName: string,
    @Query('type') storageType: string,
  ): Promise<any> {
    return this.storageService.handleDeleteFile(fileName, storageType);
  }
}
