import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './fileUpload.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('FileUploadService', () => {
  let service: FileUploadService;

  const mockFilePath = 'test-large-file.txt';
  const mockDestinationPath = 'uploaded-large-file.txt';
  const mockUploadsDir = path.join(__dirname, '../uploads')

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should have uploadLargeFileLocallyWithResuming method', () => {
    expect(service.uploadLargeFileLocallyWithResuming).toBeDefined();
  });

  it('should successfully upload a large file locally with resuming', async () => {
    (fs.statSync as jest.Mock).mockReturnValue({ size: 16000 });

    const mockStream = {
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        next: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: true }),
      }),
    };

    const mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

    await service.uploadLargeFileLocallyWithResuming(
      mockFilePath,
      mockDestinationPath,
    );

    expect(fs.statSync).toHaveBeenCalledWith(mockFilePath);
    expect(fs.createReadStream).toHaveBeenCalledWith(mockFilePath, {
      highWaterMark: service['CHUNK_SIZE'],
    });
    expect(fs.createWriteStream).toHaveBeenCalledWith(
      path.join(mockUploadsDir, mockDestinationPath),
      { flags: 'a' },
    );
    expect(mockWriteStream.write).toHaveBeenCalledTimes(2);
    expect(mockWriteStream.end).toHaveBeenCalled();
  });

  it('should correctly wait between chunk uploads', async () => {
    jest.spyOn(service as any, 'delay').mockResolvedValue(undefined);
    (fs.statSync as jest.Mock).mockReturnValue({ size: 16000 });

    const mockStream = {
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        next: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: true }),
      }),
    };

    const mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

    await service.uploadLargeFileLocallyWithResuming(
      mockFilePath,
      mockDestinationPath,
    );

    expect(service['delay']).toHaveBeenCalledTimes(2);
    expect(mockWriteStream.write).toHaveBeenCalledTimes(2);
  });

  it('should correctly wait between chunk uploads', async () => {
    jest.spyOn(service as any, 'delay').mockResolvedValue(undefined);
    (fs.statSync as jest.Mock).mockReturnValue({ size: 16000 });

    const mockStream = {
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        next: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: true }),
      }),
    };

    const mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

    await service.uploadLargeFileLocallyWithResuming(
      mockFilePath,
      mockDestinationPath,
    );

    expect(service['delay']).toHaveBeenCalledTimes(2);
    expect(mockWriteStream.write).toHaveBeenCalledTimes(2);
  });

})