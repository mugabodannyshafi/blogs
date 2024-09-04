import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from 'src/database/models/post.model';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/database/models/user.model';

const testPost = {
  id: 'id',
  title: 'The Benefits of Daily Exercises',
  content:
    "Regular exercise is crucial for maintaining overall health and well-being. Engaging in physical activity daily can help improve cardiovascular health, increase muscle strength, and boost mental clarity. Whether it's a brisk walk, a run, or a yoga session, finding an activity you enjoy can make exercise a sustainable part of your routine. Additionally, exercise is known to release endorphins, which can enhance mood and reduce stress levels. Make time for daily exercise and reap the numerous benefits it offers for both body and mind.",
  author: 'MUGABO Shafi Danny',
};

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const modRef = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PostsService,
          useValue: {
            findAllPosts: jest.fn(() => [testPost]),
            create: jest.fn(() => testPost),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                title: 'The Benefits of Daily Exercises',
                content:
                  "Regular exercise is crucial for maintaining overall health and well-being. Engaging in physical activity daily can help improve cardiovascular health, increase muscle strength, and boost mental clarity. Whether it's a brisk walk, a run, or a yoga session, finding an activity you enjoy can make exercise a sustainable part of your routine. Additionally, exercise is known to release endorphins, which can enhance mood and reduce stress levels. Make time for daily exercise and reap the numerous benefits it offers for both body and mind.",
                author: 'MUGABO Shafi Danny',
                id,
              }),
            ),
            remove: jest.fn(),
            update: jest
              .fn()
              .mockImplementation((postId: string, post: Partial<Post>) =>
                Promise.resolve({
                  title: 'The Benefits of Daily Exercises',
                  content:
                    "Regular exercise is crucial for maintaining overall health and well-being. Engaging in physical activity daily can help improve cardiovascular health, increase muscle strength, and boost mental clarity. Whether it's a brisk walk, a run, or a yoga session, finding an activity you enjoy can make exercise a sustainable part of your routine. Additionally, exercise is known to release endorphins, which can enhance mood and reduce stress levels. Make time for daily exercise and reap the numerous benefits it offers for both body and mind.",
                  author: 'MUGABO Shafi Danny',
                  postId,
                  ...post,
                }),
              ),
          },
        },
      ],
    }).compile();

    controller = modRef.get<PostsController>(PostsController);
    service = modRef.get<PostsService>(PostsService);
    jwtService = modRef.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all posts', async () => {
    expect(await controller.findAllPosts()).toEqual([testPost]);
  });

  it('should add a post', async () => {
    const createPostDto = {
      title: 'The Benefits of Daily Exercises',
      content:
        "Regular exercise is crucial for maintaining overall health and well-being. Engaging in physical activity daily can help improve cardiovascular health, increase muscle strength, and boost mental clarity. Whether it's a brisk walk, a run, or a yoga session, finding an activity you enjoy can make exercise a sustainable part of your routine. Additionally, exercise is known to release endorphins, which can enhance mood and reduce stress levels. Make time for daily exercise and reap the numerous benefits it offers for both body and mind.",
      author: 'MUGABO Shafi Danny',
    };
    expect(await service.create(createPostDto, 'userId')).toEqual(testPost);
  });

  it('should get a single post', async () => {
    const postId = 'id';
    const findOneSpy = jest.spyOn(service, 'findOne');
    const result = await controller.findOne(postId);
    expect(result).toEqual(testPost);
    expect(findOneSpy).toBeCalledWith(postId);
  });

  it('should update the post', async () => {
    const postId = '1';
    const updatePostDto = {
      title: 'Siemans',
      content: 'hello',
    };
  
    const updatedPost: Post = {
      postId,
      title: updatePostDto.title,
      content: updatePostDto.content,
      author: 'MUGABO Shafi Danny',
      userId: 'userId',
      user: {} as User,
      comments: [],
    } as Post;
  
    jest.spyOn(service, 'update').mockResolvedValue(updatedPost);
  
    const result = await controller.update(postId, updatePostDto);
  
    expect(result).toEqual(updatedPost); // Check the result
    expect(service.update).toHaveBeenCalledWith(postId, updatePostDto); // Verify the service call
  });
  
  
  it('should remove the post', async () => {
    await controller.remove('anyid');
    expect(service.remove).toHaveBeenCalled();
  });
});
