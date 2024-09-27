import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';
import { DropboxService } from 'src/dropbox/dropbox.service';
import { FileUploadService } from 'src/upload/fileUpload.service';

jest.mock('fs');
jest.mock('dropbox');

describe('StorageService', () => {
  let service: StorageService;
  let dropboxMock: Dropbox;
  let dropboxService: DropboxService;
  const mockDropbox = new Dropbox({ accessToken: 'mock_token' });
  const mockSessionId = 'mockSessionId123';
  const mockSharedLink = {
    result: { url: 'https://dropbox.com/somefile&dl=0' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: DropboxService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: FileUploadService,
          useValue: {
            uploadImage: jest.fn(),
          }
        },
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
    dropboxService = module.get<DropboxService>(DropboxService);
    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFileUpload', () => {
    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        service.handleFileUpload(undefined, 'local'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.handleFileUpload({} as any, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if storage type is unsupported', async () => {
      const mockFile = {
        originalname: 'test.txt',
        size: 1024,
        buffer: Buffer.from('Test content'),
      };
      await expect(
        service.handleFileUpload(mockFile as any, 'unsupported'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleRetrieveFile', () => {
    it('should throw BadRequestException if parameters are missing', async () => {
      await expect(
        service.handleRetrieveFile(undefined, 'local'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.handleRetrieveFile('test.txt', undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleDeleteFile', () => {
    it('should delete a local file', async () => {
      const fileName = 'test.txt';

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      const result = await service.handleDeleteFile(fileName, 'local');
      expect(result).toEqual({ message: 'File deleted successfully' });
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        path.join(service['uploadsDir'], fileName),
      );
    });

    it('should throw BadRequestException if parameters are missing', async () => {
      await expect(
        service.handleDeleteFile(undefined, 'local'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.handleDeleteFile('test.txt', undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('retrieveDropboxFile', () => {
    it('should throw BadRequestException if error occurs during retrieval', async () => {
      const fileName = 'test.txt';
      mockDropbox.filesGetTemporaryLink = jest
        .fn()
        .mockRejectedValue(new Error('Error'));

      await expect(service.retrieveDropboxFile(fileName)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteDropboxFile', () => {
    it('should throw BadRequestException if error occurs during deletion', async () => {
      const fileName = 'test.txt';
      mockDropbox.filesDeleteV2 = jest
        .fn()
        .mockRejectedValue(new Error('Error'));

      await expect(service.deleteDropboxFile(fileName)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
