import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { PostsService } from './posts.service';
import { Post } from 'src/database/models/post.model';

const testPost = {
  id: 'id',
  title: 'The Benefits of Daily Exercises',
  content:
    "Regular exercise is crucial for maintaining overall health and well-being. Engaging in physical activity daily can help improve cardiovascular health, increase muscle strength, and boost mental clarity. Whether it's a brisk walk, a run, or a yoga session, finding an activity you enjoy can make exercise a sustainable part of your routine. Additionally, exercise is known to release endorphins, which can enhance mood and reduce stress levels. Make time for daily exercise and reap the numerous benefits it offers for both body and mind.",
  author: 'MUGABO Shafi Danny',
};

const updatedPost = {
  ...testPost,
  title: 'Updated Title',
  content: 'Updated content',
};

const testComments = [
  { id: 'c1', postId: 'id', comment: 'Great post!', },
  { id: 'c2', postId: 'id', comment: 'Very informative.' },
];

describe('PostsService', () => {
  let service: PostsService;
  let model: typeof Post;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post),
          useValue: {
            findAll: jest.fn().mockResolvedValue([testPost]),
            findOne: jest.fn().mockImplementation(({ where: { postId } }) => {
              if (postId === 'id') return Promise.resolve(testPost);
              return Promise.reject(new Error('Post not found'));
            }),
            create: jest.fn().mockResolvedValue(testPost),
            remove: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockImplementation((postId, updatePostDto) => {
              if (postId === 'id') {
                return Promise.resolve({ ...testPost, ...updatePostDto });
              }
              return Promise.reject(new Error('Post not found'));
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    model = module.get<typeof Post>(getModelToken(Post));
  });

  it('should get all posts', async () => {
    expect(await service.findAllPosts()).toEqual([testPost]);
  });

  it('should get a single post', async () => {
    const findOneSpy = jest.spyOn(model, 'findOne');
    const result = await service.findOne('id');
    expect(result).toEqual(testPost);
    expect(findOneSpy).toBeCalledWith({ where: { postId: 'id' } });
  });

  it('should throw an error if postId is invalid', async () => {
    await expect(service.findOne('invalid-id')).rejects.toThrow(
      'Post not found',
    );
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

  it('should update a post', async () => {
    const postId = 'id';
    const updatePostDto = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    // Declare and initialize existingPost first
    const existingPost = {
      id: 'id',
      title: 'Original Title',
      content: 'Original content',
      author: 'Original Author',
      save: jest.fn().mockResolvedValue({
        id: 'id',
        title: 'Updated Title',
        content: 'Updated content',
        author: 'Original Author',
      }),
    } as unknown as Post;

    const findOneSpy = jest
      .spyOn(model, 'findOne')
      .mockResolvedValue(existingPost);

    const updatePostSpy = jest.spyOn(model, 'update').mockResolvedValue([1]);

    const result = await service.update(postId, updatePostDto);

    expect(result).toEqual({ ...existingPost, ...updatePostDto });
    expect(findOneSpy).toBeCalledWith({ where: { postId } });
    expect(existingPost.save).toBeCalled();
  });

  it('should throw an error if postId is invalid during update', async () => {
    await expect(service.update('invalid-id', {})).rejects.toThrow(
      'Post not found',
    );
  });

  it('should throw an error if postId is missing during update', async () => {
    await expect(service.update('', {})).rejects.toThrow('Invalid postId');
  });

  it('should remove a post', async () => {
    const postId = 'id';

    // Create a mock post instance
    const existingPost = {
      postId, // Ensure this matches your schema
      title: 'Original Title',
      content: 'Original content',
      author: 'Original Author',
      destroy: jest.fn().mockResolvedValue(null), // Mock destroy method
    } as unknown as Post;

    // Spy on model's findOne method
    const findOneSpy = jest
      .spyOn(model, 'findOne')
      .mockResolvedValue(existingPost);

    // Spy on post instance's destroy method
    const destroySpy = jest.spyOn(existingPost, 'destroy');

    const result = await service.remove(postId);

    expect(result).toEqual({ message: 'Post successfully deleted!' });
    expect(findOneSpy).toBeCalledWith({ where: { postId } }); // Match the field name used in your service
    expect(destroySpy).toBeCalled();
  });

  it('should throw an error if postId is invalid', async () => {
    await expect(service.remove('')).rejects.toThrow('Invalid postId');
  });

  it('should throw an error if post is not found', async () => {
    const postId = 'non-existing-id';
    const findOneSpy = jest.spyOn(model, 'findOne').mockResolvedValue(null);

    await expect(service.remove(postId)).rejects.toThrow(
      `Post with id ${postId} not found`,
    );

    expect(findOneSpy).toBeCalledWith({ where: { postId } });
  });
});
