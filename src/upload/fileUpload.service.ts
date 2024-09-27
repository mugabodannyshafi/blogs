import { BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { createReadStream, createWriteStream } from 'fs';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly CHUNK_SIZE = 8 * 1024 * 1024;
  private readonly uploadsDir = path.join(__dirname, '../uploads');

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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
