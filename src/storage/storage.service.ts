import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { FileUploadService } from 'src/upload/fileUpload.service';
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly CHUNK_SIZE = 8 * 1024 * 1024;
  private readonly uploadsDir = path.join(__dirname, '../uploads');


  private readonly dropbox = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  });

  constructor(
   @Inject() private readonly dropboxService: DropboxService,
   @Inject() private readonly fileUploadService: FileUploadService,
  ) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async handleFileUpload(
    file: Express.Multer.File,
    storageType: string,
  ): Promise<any> {
    if (file === undefined || storageType === undefined) {
      throw new BadRequestException('Both file and storage type are required');
    }
    const sanitizedFileName = file.originalname.replace(
      /[^a-zA-Z0-9.\-_]/g,
      '',
    );
    const destinationPath = `/${Date.now()}_${sanitizedFileName}`;
    const filePath = path.join(this.uploadsDir, sanitizedFileName);

    try {
      this.logger.log(
        `Received file upload: ${file.originalname}, size: ${file.size}`,
      );
      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`File saved locally at: ${filePath}`);

      if (storageType === 'local') {
        await this.fileUploadService.uploadLargeFileLocallyWithResuming(
          filePath,
          destinationPath,
        );
      } else if (storageType === 'dropbox') {
        await this.dropboxService.uploadLargeFileToDropboxWithResuming(
          filePath,
          destinationPath,
        );
      } else {
        throw new BadRequestException('Unsupported storage type');
      }

      fs.unlinkSync(filePath);
      this.logger.log(`Local file deleted: ${filePath}`);

      return {
        message: 'File uploaded successfully',
        destination: destinationPath,
      };
    } catch (error) {
      this.logger.error('Error during file upload', error.stack);
      throw new BadRequestException('File upload failed: ' + error.message);
    }
  }
  async handleRetrieveFile(fileName: string, type: string) {
    if (fileName === undefined || type === undefined)
      throw new BadRequestException({
        timestamp: new Date(),
        message: 'Missing required parameters',
      });

    if (type === 'dropbox') {
      const result = await this.retrieveDropboxFile(fileName);
      return result;
    } else if (type === 'local') {
      const result = await this.retrieveLocalFile(fileName);
      console.log('<<<Result>>>', result);
      return result;
    } else {
      throw new BadRequestException('Unsupported storage type');
    }
  }
  async handleDeleteFile(fileName: string, type: string) {
    if (fileName === undefined || type === undefined)
      throw new BadRequestException({
        timestamp: new Date(),
        message: 'Missing required parameters',
      });

    if (type === 'dropbox') {
      const result = await this.deleteDropboxFile(fileName);
      return result;
    } else if (type === 'local') {
      const result = await this.deleteLocalFile(fileName);
      return result;
    } else {
      throw new BadRequestException('Unsupported storage type');
    }
  }
  async retrieveLocalFile(fileName: string): Promise<string> {
    try {
      const filePath = path.join(this.uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        this.logger.log(`File found locally: ${fileName}`);
        return filePath;
      } else {
        throw new NotFoundException({
          timestamp: new Date(),
          message: `File not found: ${fileName}`,
        });
      }
    } catch (error) {
      this.logger.error(`Error retrieving file: ${fileName}`, error.stack);
      throw new BadRequestException(`Error retrieving file: ${error.message}`);
    }
  }
  async retrieveDropboxFile(fileName: string): Promise<string> {
    try {
      const response = await this.dropbox.filesGetTemporaryLink({
        path: `/${fileName}`,
      });
      return response.result.link;
    } catch (error) {
      this.logger.error(`Error retrieving file: ${fileName}`, error.stack);
      throw new BadRequestException(`Error retrieving file: ${error.message}`);
    }
  }
  async deleteLocalFile(fileName: string): Promise<any> {
    try {
      const filePath = path.join(this.uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`File deleted: ${fileName}`);
        return { message: 'File deleted successfully' };
      } else {
        throw new NotFoundException({
          timestamp: new Date(),
          message: `File not found: ${fileName}`,
        });
      }
    } catch (error) {
      this.logger.error(`Error deleting file: ${fileName}`, error.stack);
      throw new BadRequestException(`Error deleting file: ${error.message}`);
    }
  }

  async deleteDropboxFile(fileName: string): Promise<any> {
    try {
      const response = await this.dropbox.filesDeleteV2({
        path: `/${fileName}`,
      });
      return response;
    } catch (error) {
      this.logger.error(`Error deleting file: ${fileName}`, error.stack);
      throw new BadRequestException(`Error deleting file: ${error.message}`);
    }
  }
}
