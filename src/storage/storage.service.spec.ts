import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';


jest.mock('fs');
jest.mock('dropbox');


describe('StorageService', () => {
 let service: StorageService;
 const mockDropbox = new Dropbox({ accessToken: 'mock_token' });


 beforeEach(async () => {
   const module: TestingModule = await Test.createTestingModule({
     providers: [
       StorageService,
       {
         provide: Dropbox,
         useValue: mockDropbox,
       },
     ],
   }).compile();


   service = module.get<StorageService>(StorageService);
 });


 it('should be defined', () => {
   expect(service).toBeDefined();
 });


 describe('handleFileUpload', () => {
  //  it('should upload a file locally', async () => {
  //    const mockFile = {
  //      originalname: 'test.txt',
  //      size: 1024,
  //      buffer: Buffer.from('Test content'),
  //    };
  //    const storageType = 'local';
    
  //    // Mock fs methods
  //    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  //    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});


  //    const result = await service.handleFileUpload(mockFile as any, storageType);
  //    expect(result).toEqual({
  //      message: 'File uploaded successfully',
  //      destination: expect.stringContaining('test.txt'),
  //    });
  //    expect(fs.writeFileSync).toHaveBeenCalled();
  //    expect(fs.unlinkSync).toHaveBeenCalled();
  //  });


   it('should throw BadRequestException if file is missing', async () => {
     await expect(service.handleFileUpload(undefined, 'local')).rejects.toThrow(BadRequestException);
     await expect(service.handleFileUpload({} as any, undefined)).rejects.toThrow(BadRequestException);
   });


   it('should throw BadRequestException if storage type is unsupported', async () => {
     const mockFile = { originalname: 'test.txt', size: 1024, buffer: Buffer.from('Test content') };
     await expect(service.handleFileUpload(mockFile as any, 'unsupported')).rejects.toThrow(BadRequestException);
   });
 });


 describe('handleRetrieveFile', () => {
   // it('should retrieve a local file', async () => {
   //   const fileName = 'test.txt';


   //   (fs.existsSync as jest.Mock).mockReturnValue(true);
   //   (fs.join as jest.Mock).mockReturnValue(path.join(service['uploadsDir'], fileName));


   //   const result = await service.handleRetrieveFile(fileName, 'local');
   //   expect(result).toEqual(path.join(service['uploadsDir'], fileName));
   // });



   it('should throw BadRequestException if parameters are missing', async () => {
     await expect(service.handleRetrieveFile(undefined, 'local')).rejects.toThrow(BadRequestException);
     await expect(service.handleRetrieveFile('test.txt', undefined)).rejects.toThrow(BadRequestException);
   });
 });


 describe('handleDeleteFile', () => {
   it('should delete a local file', async () => {
     const fileName = 'test.txt';


     (fs.existsSync as jest.Mock).mockReturnValue(true);
     (fs.unlinkSync as jest.Mock).mockImplementation(() => {});


     const result = await service.handleDeleteFile(fileName, 'local');
     expect(result).toEqual({ message: 'File deleted successfully' });
     expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(service['uploadsDir'], fileName));
   });


   it('should throw BadRequestException if parameters are missing', async () => {
     await expect(service.handleDeleteFile(undefined, 'local')).rejects.toThrow(BadRequestException);
     await expect(service.handleDeleteFile('test.txt', undefined)).rejects.toThrow(BadRequestException);
   });
 });


 describe('uploadLargeFileToDropboxWithResuming', () => {
  //  it('should upload a file to Dropbox', async () => {
  //    const mockFilePath = 'test.txt';
  //    const mockDestinationPath = '/test.txt';
  //    const mockFileBuffer = Buffer.from('Test content');


  //    (fs.statSync as jest.Mock).mockReturnValue({ size: mockFileBuffer.length });
  //    (fs.createReadStream as jest.Mock).mockReturnValue({
  //      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
  //        next: async () => ({
  //          value: mockFileBuffer,
  //          done: false,
  //        }),
  //      }),
  //    });


  //    const startResponse = { result: { session_id: 'mock_session_id' } };
  //    const appendResponse = {};
  //    const finishResponse = {};


  //    mockDropbox.filesUploadSessionStart = jest.fn().mockResolvedValue(startResponse);
  //    mockDropbox.filesUploadSessionAppendV2 = jest.fn().mockResolvedValue(appendResponse);
  //    mockDropbox.filesUploadSessionFinish = jest.fn().mockResolvedValue(finishResponse);


  //    await service.uploadLargeFileToDropboxWithResuming(mockFilePath, mockDestinationPath);


  //    expect(mockDropbox.filesUploadSessionStart).toHaveBeenCalled();
  //    expect(mockDropbox.filesUploadSessionAppendV2).toHaveBeenCalled();
  //    expect(mockDropbox.filesUploadSessionFinish).toHaveBeenCalled();
  //  });
 });


 describe('retrieveDropboxFile', () => {
  //  it('should retrieve a file from Dropbox', async () => {
  //    const fileName = 'test.txt';
  //    const mockLink = 'https://dropbox.com/test.txt';


  //    mockDropbox.filesGetTemporaryLink = jest.fn().mockResolvedValue({
  //      result: { link: mockLink },
  //    });


  //    const result = await service.retrieveDropboxFile(fileName);
  //    expect(result).toEqual(mockLink);
  //    expect(mockDropbox.filesGetTemporaryLink).toHaveBeenCalledWith({ path: `/${fileName}` });
  //  });


   it('should throw BadRequestException if error occurs during retrieval', async () => {
     const fileName = 'test.txt';
     mockDropbox.filesGetTemporaryLink = jest.fn().mockRejectedValue(new Error('Error'));


     await expect(service.retrieveDropboxFile(fileName)).rejects.toThrow(BadRequestException);
   });
 });


 describe('deleteDropboxFile', () => {
  //  it('should delete a file from Dropbox', async () => {
  //    const fileName = 'test.txt';
  //    const response = {};


  //    mockDropbox.filesDeleteV2 = jest.fn().mockResolvedValue(response);


  //    const result = await service.deleteDropboxFile(fileName);
  //    expect(result).toEqual(response);
  //    expect(mockDropbox.filesDeleteV2).toHaveBeenCalledWith({ path: `/${fileName}` });
  //  });


   it('should throw BadRequestException if error occurs during deletion', async () => {
     const fileName = 'test.txt';
     mockDropbox.filesDeleteV2 = jest.fn().mockRejectedValue(new Error('Error'));


     await expect(service.deleteDropboxFile(fileName)).rejects.toThrow(BadRequestException);
   });
 });
});



