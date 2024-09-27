import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly CHUNK_SIZE = 8 * 1024 * 1024;
  private readonly uploadsDir = path.join(__dirname, '../uploads');

  private readonly dropbox = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  });

  constructor() {
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
        await this.uploadLargeFileLocallyWithResuming(
          filePath,
          destinationPath,
        );
      } else if (storageType === 'dropbox') {
        await this.uploadLargeFileToDropboxWithResuming(
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
  async uploadLargeFileLocallyWithResuming(
    filePath: string,
    destinationPath: string,
  ): Promise<void> {
    const fileSize = fs.statSync(filePath).size;
    const fileStream = createReadStream(filePath, {
      highWaterMark: this.CHUNK_SIZE,
    });
    const destinationFilePath = path.join(this.uploadsDir, destinationPath);
    let uploadedBytes = 0;

    this.logger.log(
      `Starting resumable upload for local storage: ${filePath}, size: ${fileSize} bytes`,
    );

    const writeStream = createWriteStream(destinationFilePath, { flags: 'a' });

    try {
      for await (const chunk of fileStream) {
        writeStream.write(chunk);
        uploadedBytes += chunk.length;
        this.logger.log(
          `Appended ${chunk.length} bytes, total uploaded: ${uploadedBytes} bytes`,
        );

        await this.delay(500);
      }

      writeStream.end();
      this.logger.log(`Upload complete for local file: ${destinationFilePath}`);
    } catch (error) {
      this.logger.error(
        `Error during resumable local upload: ${error.message}`,
      );
      throw new BadRequestException(
        'Local file upload failed: ' + error.message,
      );
    }
  }

  async uploadLargeFileToDropboxWithResuming(
    filePath: string,
    destinationPath: string,
  ): Promise<void> {
    const fileSize = fs.statSync(filePath).size;
    const fileStream = createReadStream(filePath, {
      highWaterMark: this.CHUNK_SIZE,
    });
    let sessionId: string | null = null;
    let uploadedBytes = 0;
    const maxRetries = 5;
    const baseDelay = 1000;

    this.logger.log(
      `Starting resumable upload for Dropbox: ${filePath}, size: ${fileSize} bytes`,
    );

    try {
      for await (const chunk of fileStream) {
        let attempt = 0;
        let success = false;

        while (attempt <= maxRetries && !success) {
          try {
            if (!sessionId) {
              const startResponse = await this.dropbox.filesUploadSessionStart({
                close: false,
                contents: chunk,
              });
              sessionId = startResponse.result.session_id;
              this.logger.log(`Started upload session with ID: ${sessionId}`);
            } else {
              await this.dropbox.filesUploadSessionAppendV2({
                cursor: {
                  session_id: sessionId,
                  offset: uploadedBytes,
                },
                contents: chunk,
              });
              this.logger.log(
                `Appended ${chunk.length} bytes, total uploaded: ${uploadedBytes + chunk.length} bytes`,
              );
            }

            uploadedBytes += chunk.length;
            success = true;
          } catch (error) {
            attempt++;
            this.logger.error(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt > maxRetries) {
              this.logger.error('Max retries reached. Aborting upload.');
              throw new BadRequestException(
                'File upload failed after multiple retries: ' + error.message,
              );
            }
            const delay = baseDelay * Math.pow(2, attempt);
            this.logger.log(`Retrying in ${delay}ms...`);
            await this.delay(delay);
          }
        }
      }

      await this.dropbox.filesUploadSessionFinish({
        cursor: {
          session_id: sessionId,
          offset: uploadedBytes,
        },
        commit: {
          path: destinationPath,
          mode: { '.tag': 'overwrite' },
        },
      });
      8;
      this.logger.log(`Upload complete: ${destinationPath}`);
    } catch (error) {
      this.logger.error(
        `Error during Dropbox upload: ${destinationPath}, ${error.message}`,
      );
      throw new BadRequestException('Dropbox upload failed: ' + error.message);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
