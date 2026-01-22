import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { CreatePostFormValues } from '../../types/api.types';
import { currentUser } from '../../utils/mockData';
import { createPostSchema } from '../../utils/validationSchemas';
import { parseMentions, parseTags } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout';
import PageHeader from '../../components/PageHeader';
import ImageUpload from '../../components/ImageUpload';
import MentionTextarea from '../../components/MentionTextarea';
import FormActions from '../../components/FormActions';
import './CreatePostPage.css';

const CreatePostPage: React.FC = () => {
	const navigate = useNavigate();
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageError, setImageError] = useState<string>('');

	const initialValues: CreatePostFormValues = {
		caption: '',
		tags: '',
		imageFile: null,
	};

	const handleFileSelect = (file: File | null, setFieldValue: (field: string, value: File | null) => void) => {
		if (file) {
			setFieldValue('imageFile', file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
			setImageError('');
		} else {
			setFieldValue('imageFile', null);
			setImagePreview(null);
		}
	};

	const handleSubmit = (values: CreatePostFormValues) => {
		if (!values.imageFile || !imagePreview) {
			setImageError('Image is required');
			return;
		}

		const mentions = parseMentions(values.caption);
		const tags = parseTags(values.tags);

		const newPost = {
			id: Date.now(),
			authorUsername: currentUser.name,
			createdAt: new Date().toISOString(),
			imageUrl: imagePreview,
			caption: values.caption,
			tags,
			mentions,
		};

		const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
		existingPosts.unshift(newPost);
		localStorage.setItem('posts', JSON.stringify(existingPosts));

		navigate('/feed');
	};

	return (
		<PageLayout activePage="feed" user={currentUser}>
			<PageHeader title="New Post" />

			<Formik initialValues={initialValues} validationSchema={createPostSchema} onSubmit={handleSubmit}>
				{({ setFieldValue, values, errors, touched, isSubmitting }) => (
					<Form className="create-post-form">
						<ImageUpload
							preview={imagePreview}
							onFileSelect={(file) => handleFileSelect(file, setFieldValue)}
							error={imageError}
						/>

						<div className="form-group">
							<label htmlFor="caption">Description</label>
							<MentionTextarea
								value={values.caption}
								onChange={(value) => setFieldValue('caption', value)}
								placeholder="Write a caption... Use @username to mention someone"
								hasError={!!(errors.caption && touched.caption)}
								rows={4}
							/>
							<ErrorMessage name="caption" component="span" className="form-error" />
						</div>

						<div className="form-group">
							<label htmlFor="tags">Hashtags</label>
							<Field
								type="text"
								id="tags"
								name="tags"
								placeholder="nature, photography, sunset (separated by commas or spaces)"
								className="form-input"
							/>
							<ErrorMessage name="tags" component="span" className="form-error" />
						</div>

						<FormActions submitLabel="Share" onCancel={() => navigate(-1)} isSubmitting={isSubmitting} />
					</Form>
				)}
			</Formik>
		</PageLayout>
	);
};

export default CreatePostPage;
