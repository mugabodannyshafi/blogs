import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Post } from 'src/database/models/post.model';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

const testPost = {
  postId: '8cb85070-65af-437a-9811-95d4aace9403',
  userId: '837634d8-d6f3-459a-a04b-d4469474f330',
  title: 'Rwanda is beautiful country',
  content:
    'Rwanda, officially the Republic of Rwanda, is a landlocked country in the Great Rift Valley of East Africa, where the African Great Lakes region and Southeast Africa converge. Located a few degrees south of the Equator, Rwanda is bordered by Uganda, Tanzania, Burundi, and the Democratic Republic of the Congo.',
  author: 'MUGISHA John',
  image:
    'https://res.cloudinary.com/dxizjtfpd/image/upload/v1725788213/aticbk41cqnnya8tmte4.webp',
  updatedAt: new Date(),
  createdAt: new Date(),
};

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        CloudinaryService,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PostsService,
          useValue: {
            findAllPosts: jest.fn(() => Promise.resolve([testPost])),
            create: jest.fn(() => Promise.resolve(testPost)),
            findOne: jest
              .fn()
              .mockImplementation((id: string) =>
                Promise.resolve({ ...testPost, id }),
              ),
            remove: jest.fn().mockResolvedValue(undefined),
            update: jest
              .fn()
              .mockImplementation(
                (postId: string, post: Partial<Post>, imageUrl?: string) =>
                  Promise.resolve({
                    ...testPost,
                    id: postId,
                    ...post,
                    image: imageUrl || testPost.image,
                  }),
              ),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(() =>
              Promise.resolve({ secure_url: 'http://example.com/image.jpg' }),
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all posts', async () => {
    expect(await controller.findAllPosts(5)).toEqual([testPost]);
  });

  it('should get a single post', async () => {
    const postId = '8cb85070-65af-437a-9811-95d4aace9403';
    const result = await controller.findOne(postId);
    expect(result).toEqual({ ...testPost, id: postId });
    expect(service.findOne).toBeCalledWith(postId);
  });

  it('should remove the post', async () => {
    await controller.remove('8cb85070-65af-437a-9811-95d4aace9403');
    expect(service.remove).toHaveBeenCalledWith(
      '8cb85070-65af-437a-9811-95d4aace9403',
    );
  });
});
