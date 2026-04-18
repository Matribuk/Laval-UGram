export const createMockUsersService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  searchByUsername: jest.fn(),
  getRecommendedUsers: jest.fn(),
  update: jest.fn(),
  updateProfilePicture: jest.fn(),
  delete: jest.fn(),
  validatePassword: jest.fn(),
  findOrCreateOAuthUser: jest.fn(),
});

export const createMockUsersRepository = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  searchByUsername: jest.fn(),
  findRecommended: jest.fn(),
  update: jest.fn(),
  updateProfilePicture: jest.fn(),
  delete: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUsername: jest.fn(),
});

export const createMockAuthService = () => ({
  validateUser: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
  googleLogin: jest.fn(),
});

export const createMockImagesService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByHashtag: jest.fn(),
  searchByDescription: jest.fn(),
  findAllWithStats: jest.fn(),
  findByIdWithStats: jest.fn(),
  findByUserIdWithStats: jest.fn(),
  findByHashtagWithStats: jest.fn(),
  searchByDescriptionWithStats: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

export const createMockImagesRepository = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByHashtag: jest.fn(),
  searchByDescription: jest.fn(),
  findAllWithStats: jest.fn(),
  findByIdWithStats: jest.fn(),
  findByUserIdWithStats: jest.fn(),
  findByHashtagWithStats: jest.fn(),
  searchByDescriptionWithStats: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findOrCreateHashtags: jest.fn(),
  updateImageHashtags: jest.fn(),
  updateImageMentions: jest.fn(),
  getImageFilename: jest.fn(),
});

export const createMockLikesService = () => ({
  addLike: jest.fn(),
  removeLike: jest.fn(),
  getLikeStatus: jest.fn(),
  getLikedImages: jest.fn(),
});

export const createMockLikesRepository = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  countByImageId: jest.fn(),
  existsByUserAndImage: jest.fn(),
  findLikedImagesByUserId: jest.fn(),
});

export const createMockCommentsService = () => ({
  addComment: jest.fn(),
  removeComment: jest.fn(),
  getCommentsByImage: jest.fn(),
  getCommentsByUser: jest.fn(),
});

export const createMockCommentsRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
  findByImageId: jest.fn(),
  findByUserId: jest.fn(),
});

export const createMockNotificationsService = () => ({
  createNotification: jest.fn(),
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
});

export const createMockNotificationsRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
});

export const createMockMessagesService = () => ({
  sendMessage: jest.fn(),
  getMessages: jest.fn(),
  getConversations: jest.fn(),
  markAsRead: jest.fn(),
});

export const createMockMessagesRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findMessagesBetweenUsers: jest.fn(),
  findAllInvolving: jest.fn(),
  markAsRead: jest.fn(),
});

export const createMockStorageService = () => ({
  uploadImage: jest.fn().mockResolvedValue({
    filename: 'mock-uuid.jpg',
    url: '/uploads/mock-uuid.jpg',
    thumbnailUrl: '/uploads/mock-uuid_thumbnail.jpg',
    mediumUrl: '/uploads/mock-uuid_medium.jpg',
  }),
  deleteImage: jest.fn(),
  getImageUrl: jest.fn(),
});

export const createMockStorageProvider = () => ({
  upload: jest.fn().mockResolvedValue('test-filename.jpg'),
  delete: jest.fn().mockResolvedValue(undefined),
  getUrl: jest.fn((filename: string) => `/uploads/${filename}`),
});

export const createMockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@example.com' }),
  verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-id', email: 'test@example.com' }),
  decode: jest.fn(),
});

export type MockUsersService = ReturnType<typeof createMockUsersService>;
export type MockUsersRepository = ReturnType<typeof createMockUsersRepository>;
export type MockAuthService = ReturnType<typeof createMockAuthService>;
export type MockImagesService = ReturnType<typeof createMockImagesService>;
export type MockImagesRepository = ReturnType<typeof createMockImagesRepository>;
export type MockLikesService = ReturnType<typeof createMockLikesService>;
export type MockLikesRepository = ReturnType<typeof createMockLikesRepository>;
export type MockCommentsService = ReturnType<typeof createMockCommentsService>;
export type MockCommentsRepository = ReturnType<typeof createMockCommentsRepository>;
export type MockMessagesService = ReturnType<typeof createMockMessagesService>;
export type MockMessagesRepository = ReturnType<typeof createMockMessagesRepository>;
export type MockNotificationsService = ReturnType<typeof createMockNotificationsService>;
export type MockNotificationsRepository = ReturnType<typeof createMockNotificationsRepository>;
export type MockStorageService = ReturnType<typeof createMockStorageService>;
export type MockStorageProvider = ReturnType<typeof createMockStorageProvider>;
export type MockJwtService = ReturnType<typeof createMockJwtService>;
