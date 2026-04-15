import * as Yup from 'yup';

const emailValidation = Yup.string()
	.required('Email is required')
	.matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email');

const phoneValidation = Yup.string()
	.matches(/^[+]?[0-9\s-]+$/, {
		message: 'Phone number can only contain digits, spaces, dashes, and an optional leading +',
		excludeEmptyString: true,
	})
	.test('no-trailing-dash', 'Phone number cannot end with a dash', (value) => {
		if (!value) {
			return true;
		}
		return !value.trimEnd().endsWith('-');
	});

export const loginSchema = Yup.object({
	email: emailValidation,
	password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

export const signupSchema = Yup.object({
	firstName: Yup.string().max(50, 'Maximum 50 characters'),
	lastName: Yup.string().max(50, 'Maximum 50 characters'),
	username: Yup.string()
		.min(3, 'Minimum 3 characters')
		.max(30, 'Maximum 30 characters')
		.matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores')
		.required('Username is required'),
	email: emailValidation,
	password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password')], 'Passwords do not match')
		.required('Confirmation is required'),
});

export const editProfileSchema = Yup.object({
	firstName: Yup.string().max(50, 'Maximum 50 characters'),
	lastName: Yup.string().max(50, 'Maximum 50 characters'),
	email: emailValidation,
	phoneNumber: phoneValidation,
});

const tagsValidation = Yup.string()
	.max(500, 'Maximum 500 characters')
	.test('valid-hashtags', 'Invalid hashtag format (use letters, numbers only)', (value) => {
		if (!value) {
			return true;
		}
		const tags = value.split(/[\s,]+/).filter((t) => t.length > 0);
		return tags.every((tag) => /^#?[a-zA-Z0-9_]+$/.test(tag));
	});

const captionValidation = Yup.string()
	.max(2200, 'Maximum 2200 characters')
	.test('valid-mentions', 'Invalid mention format (use @username)', (value) => {
		if (!value) {
			return true;
		}
		const mentions = value.match(/@[^\s]+/g) || [];
		return mentions.every((mention) => /^@[a-zA-Z0-9_]+$/.test(mention));
	})
	.required('Description is required');

export const createPostSchema = Yup.object({
	caption: captionValidation,
	tags: tagsValidation,
});

export const editPostSchema = Yup.object({
	caption: captionValidation,
	tags: tagsValidation,
});
