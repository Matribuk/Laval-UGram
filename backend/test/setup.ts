import { resetUserCounter } from './factories/user.factory';
import { resetImageCounter } from './factories/image.factory';

jest.setTimeout(10000);

beforeEach(() => {
  resetUserCounter();
  resetImageCounter();
});

afterAll(() => {
  jest.clearAllMocks();
});
