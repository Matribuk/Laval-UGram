import { loginSchema, signupSchema, editProfileSchema, createPostSchema, editPostSchema } from '../../utils/validationSchemas';

describe('validationSchemas', () => {
	describe('loginSchema', () => {
		it('validates correct login data', async () => {
			const validData = { email: 'test@example.com', password: 'password123' };
			await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
		});

		it('rejects invalid email', async () => {
			const invalidData = { email: 'invalid', password: 'password123' };
			await expect(loginSchema.validate(invalidData)).rejects.toThrow('Invalid email');
		});

		it('rejects missing email', async () => {
			const invalidData = { email: '', password: 'password123' };
			await expect(loginSchema.validate(invalidData)).rejects.toThrow('Email is required');
		});

		it('rejects short password', async () => {
			const invalidData = { email: 'test@example.com', password: '123' };
			await expect(loginSchema.validate(invalidData)).rejects.toThrow('Minimum 6 characters');
		});

		it('rejects empty password', async () => {
			const invalidData = { email: 'test@example.com', password: '' };
			await expect(loginSchema.validate(invalidData)).rejects.toThrow('Minimum 6 characters');
		});
	});

	describe('signupSchema', () => {
		const validData = {
			firstName: 'John',
			lastName: 'Doe',
			username: 'johndoe',
			email: 'john@example.com',
			password: 'password123',
			confirmPassword: 'password123',
		};

		it('validates correct signup data', async () => {
			await expect(signupSchema.validate(validData)).resolves.toEqual(validData);
		});

		it('rejects short username', async () => {
			await expect(signupSchema.validate({ ...validData, username: 'ab' })).rejects.toThrow('Minimum 3 characters');
		});

		it('rejects long username', async () => {
			await expect(signupSchema.validate({ ...validData, username: 'a'.repeat(31) })).rejects.toThrow(
				'Maximum 30 characters'
			);
		});

		it('rejects invalid username characters', async () => {
			await expect(signupSchema.validate({ ...validData, username: 'user@name' })).rejects.toThrow(
				'Only letters, numbers and underscores'
			);
		});

		it('rejects mismatched passwords', async () => {
			await expect(signupSchema.validate({ ...validData, confirmPassword: 'different' })).rejects.toThrow(
				'Passwords do not match'
			);
		});

		it('rejects long firstName', async () => {
			await expect(signupSchema.validate({ ...validData, firstName: 'a'.repeat(51) })).rejects.toThrow(
				'Maximum 50 characters'
			);
		});
	});

	describe('editProfileSchema', () => {
		const validData = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			phoneNumber: '+1 234-567-8900',
		};

		it('validates correct profile data', async () => {
			await expect(editProfileSchema.validate(validData)).resolves.toEqual(validData);
		});

		it('rejects invalid email', async () => {
			await expect(editProfileSchema.validate({ ...validData, email: 'invalid' })).rejects.toThrow('Invalid email');
		});

		it('rejects invalid phone number', async () => {
			await expect(editProfileSchema.validate({ ...validData, phoneNumber: 'abc123' })).rejects.toThrow(
				'Phone number can only contain digits'
			);
		});

		it('allows empty phone number', async () => {
			await expect(editProfileSchema.validate({ ...validData, phoneNumber: '' })).resolves.toBeDefined();
		});
	});

	describe('createPostSchema', () => {
		it('validates correct post data', async () => {
			const validData = { caption: 'Hello world', tags: 'tag1 tag2' };
			await expect(createPostSchema.validate(validData)).resolves.toEqual(validData);
		});

		it('rejects missing caption', async () => {
			await expect(createPostSchema.validate({ caption: '', tags: '' })).rejects.toThrow('Description is required');
		});

		it('rejects invalid mention format', async () => {
			await expect(createPostSchema.validate({ caption: 'Hello @user@name', tags: '' })).rejects.toThrow(
				'Invalid mention format'
			);
		});

		it('accepts valid mentions', async () => {
			const validData = { caption: 'Hello @john_doe123', tags: '' };
			await expect(createPostSchema.validate(validData)).resolves.toEqual(validData);
		});

		it('rejects invalid hashtag format', async () => {
			await expect(createPostSchema.validate({ caption: 'Hello', tags: '#tag@invalid' })).rejects.toThrow(
				'Invalid hashtag format'
			);
		});

		it('accepts valid hashtags', async () => {
			const validData = { caption: 'Hello', tags: '#tag1 tag2 #tag_3' };
			await expect(createPostSchema.validate(validData)).resolves.toEqual(validData);
		});
	});

	describe('editPostSchema', () => {
		it('validates correct post data', async () => {
			const validData = { caption: 'Updated caption', tags: 'newtag' };
			await expect(editPostSchema.validate(validData)).resolves.toEqual(validData);
		});

		it('rejects missing caption', async () => {
			await expect(editPostSchema.validate({ caption: '', tags: '' })).rejects.toThrow('Description is required');
		});
	});
});
