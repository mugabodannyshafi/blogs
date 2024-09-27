import { Test, TestingModule } from '@nestjs/testing';
import { DropboxService } from './dropbox.service';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

jest.mock('fs');

describe('DropboxService', () => {
  let service: DropboxService;
  let dropboxMock: Dropbox;

  const mockFilePath = 'test-image.jpg';
  const mockDestinationPath = '/dropbox/path/test-image.jpg';
  const mockSessionId = 'mockSessionId123';
  const mockSharedLink = {
    result: { url: 'https://dropbox.com/somefile&dl=0' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DropboxService,
        {
          provide: Dropbox,
          useValue: {
            filesUploadSessionStart: jest
              .fn()
              .mockResolvedValue({ result: { session_id: mockSessionId } }),
            filesUploadSessionAppendV2: jest.fn().mockResolvedValue({}),
            filesUploadSessionFinish: jest.fn().mockResolvedValue({}),
            sharingCreateSharedLinkWithSettings: jest
              .fn()
              .mockResolvedValue(mockSharedLink),
          },
        },
      ],
    }).compile();

    service = module.get<DropboxService>(DropboxService);
    dropboxMock = module.get<Dropbox>(Dropbox);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have uploadImage method', () => {
    expect(service.uploadImage).toBeDefined();
  });

  it('should successfully upload an image to Dropbox', async () => {
    (fs.statSync as jest.Mock).mockReturnValue({ size: 10000 });

    const mockStream = {
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        next: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(5000) })
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(5000) })
          .mockResolvedValueOnce({ done: true }),
      }),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

    const result = await service.uploadImage(mockFilePath, mockDestinationPath);

    expect(dropboxMock.filesUploadSessionStart).toHaveBeenCalled();
    expect(dropboxMock.filesUploadSessionAppendV2).toHaveBeenCalledTimes(1);
    expect(dropboxMock.filesUploadSessionFinish).toHaveBeenCalled();
    expect(
      dropboxMock.sharingCreateSharedLinkWithSettings,
    ).toHaveBeenCalledWith({
      path: mockDestinationPath,
    });

    expect(result).toEqual(
      `${mockSharedLink.result.url.replace('&dl=0', '')}&raw=1`,
    );
  });

  it('should successfully upload a large file to Dropbox with resuming', async () => {
    (fs.statSync as jest.Mock).mockReturnValue({ size: 20000 });

    const mockStream = {
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        next: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: true }),
      }),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

    await service.uploadLargeFileToDropboxWithResuming(
      mockFilePath,
      mockDestinationPath,
    );

    expect(dropboxMock.filesUploadSessionStart).toHaveBeenCalled();
    expect(dropboxMock.filesUploadSessionAppendV2).toHaveBeenCalledTimes(1);
    expect(dropboxMock.filesUploadSessionFinish).toHaveBeenCalled();
  });

  it('should retry if upload fails and succeed after retries', async () => {
    (fs.statSync as jest.Mock).mockReturnValue({ size: 20000 });

    const mockStream = {
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        next: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: false, value: Buffer.alloc(8000) })
          .mockResolvedValueOnce({ done: true }),
      }),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

    dropboxMock.filesUploadSessionAppendV2 = jest
      .fn()
      .mockRejectedValueOnce(new Error('Simulated upload error'))
      .mockResolvedValueOnce({});

    await service.uploadLargeFileToDropboxWithResuming(
      mockFilePath,
      mockDestinationPath,
    );

    expect(dropboxMock.filesUploadSessionStart).toHaveBeenCalled();
    expect(dropboxMock.filesUploadSessionAppendV2).toHaveBeenCalledTimes(2);
    expect(dropboxMock.filesUploadSessionFinish).toHaveBeenCalled();
  });

  it('should correctly update the offset during large file upload', async () => {
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

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

    await service.uploadLargeFileToDropboxWithResuming(
      mockFilePath,
      mockDestinationPath,
    );

    expect(dropboxMock.filesUploadSessionStart).toHaveBeenCalled();
    expect(dropboxMock.filesUploadSessionAppendV2).toHaveBeenCalledWith({
      cursor: {
        session_id: mockSessionId,
        offset: 8000,
      },
      contents: Buffer.alloc(8000),
    });
    expect(dropboxMock.filesUploadSessionFinish).toHaveBeenCalledWith({
      cursor: {
        session_id: mockSessionId,
        offset: 16000,
      },
      commit: {
        path: mockDestinationPath,
        mode: { '.tag': 'overwrite' },
      },
    });
  });
});
