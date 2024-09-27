import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('StorageController', () => {
  let controller: StorageController;
  let service: StorageService;

  const mockStorageService = {
    handleFileUpload: jest.fn(),
    handleRetrieveFile: jest.fn(),
    handleDeleteFile: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        user: {},
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
    service = module.get<StorageService>(StorageService);
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = { originalname: 'test.txt' } as Express.Multer.File;
      const mockStorageType = 'local';
      const mockResponse = { url: 'http://localhost/test.txt' };

      jest.spyOn(service, 'handleFileUpload').mockResolvedValue(mockResponse);

      const result = await controller.uploadFile(mockFile, mockStorageType);

      expect(result).toEqual(mockResponse);
      expect(service.handleFileUpload).toHaveBeenCalledWith(
        mockFile,
        mockStorageType,
      );
    });
  });

  describe('retrieveFile', () => {
    it('should retrieve a file successfully', async () => {
      const mockFileName = 'test.txt';
      const mockStorageType = 'local';
      const mockResponse = 'http://localhost/test.txt';

      jest.spyOn(service, 'handleRetrieveFile').mockResolvedValue(mockResponse);

      const result = await controller.retrieveFile(
        mockFileName,
        mockStorageType,
      );

      expect(result).toEqual(mockResponse);
      expect(service.handleRetrieveFile).toHaveBeenCalledWith(
        mockFileName,
        mockStorageType,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const mockFileName = 'test.txt';
      const mockStorageType = 'local';
      const mockResponse = { success: true };

      jest.spyOn(service, 'handleDeleteFile').mockResolvedValue(mockResponse);

      const result = await controller.deleteFile(mockFileName, mockStorageType);

      expect(result).toEqual(mockResponse);
      expect(service.handleDeleteFile).toHaveBeenCalledWith(
        mockFileName,
        mockStorageType,
      );
    });
  });
});
