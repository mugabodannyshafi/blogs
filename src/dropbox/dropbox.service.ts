import { Injectable, BadRequestException } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';

@Injectable()
export class DropboxService {
  private readonly logger = new Logger(DropboxService.name);
  private readonly CHUNK_SIZE = 8 * 1024 * 1024;
  private readonly uploadsDir = path.join(__dirname, '../uploads');

  constructor(private readonly dropbox: Dropbox) {}

  async uploadImage(
    filePath: string,
    destinationPath: string,
  ): Promise<string> {
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

      this.logger.log(`Upload complete: ${destinationPath}`);

      const sharedLinkResponse =
        await this.dropbox.sharingCreateSharedLinkWithSettings({
          path: destinationPath,
        });
      const rawImageLink = `${sharedLinkResponse.result.url.replace('&dl=0', '')}&raw=1`;

      return rawImageLink;
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
}
