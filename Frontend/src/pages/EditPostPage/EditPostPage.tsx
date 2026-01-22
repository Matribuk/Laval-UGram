import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { EditPostFormValues } from '../../types/api.types';
import { currentUser, isCurrentUser } from '../../utils/mockData';
import { editPostSchema } from '../../utils/validationSchemas';
import { parseMentions, parseTags } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout';
import PageHeader from '../../components/PageHeader';
import MentionTextarea from '../../components/MentionTextarea';
import FormActions from '../../components/FormActions';
import EmptyState from '../../components/EmptyState';
import { GridIcon } from '../../utils/SvgFile';
import postsData from '../../__data__/posts.json';
import './EditPostPage.css';

const EditPostPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const localPosts = JSON.parse(localStorage.getItem('posts') || '[]');
	const allPosts = [...localPosts, ...postsData.posts];

	const post = allPosts.find((p) => p.id === Number(id));
	const isLocalPost = localPosts.some((p: { id: number }) => p.id === Number(id));

	if (!post) {
		return (
			<PageLayout activePage="feed" user={currentUser}>
				<EmptyState
					icon={<GridIcon width={48} height={48} />}
					title="Post not found"
					subtitle="This post may have been deleted or doesn't exist."
				/>
			</PageLayout>
		);
	}

	if (!isCurrentUser(post.authorUsername)) {
		return (
			<PageLayout activePage="feed" user={currentUser}>
				<EmptyState
					icon={<GridIcon width={48} height={48} />}
					title="Access denied"
					subtitle="You can only edit your own posts."
				/>
			</PageLayout>
		);
	}

	const initialValues: EditPostFormValues = {
		caption: post.caption,
		tags: post.tags?.join(', ') || '',
	};

	const handleSubmit = (values: EditPostFormValues) => {
		const mentions = parseMentions(values.caption);
		const tags = parseTags(values.tags);

		if (isLocalPost) {
			const updatedLocalPosts = localPosts.map((p: { id: number }) => {
				if (p.id === post.id) {
					return {
						...p,
						caption: values.caption,
						tags,
						mentions,
					};
				}
				return p;
			});
			localStorage.setItem('posts', JSON.stringify(updatedLocalPosts));
		}

		navigate(`/post/${post.id}`);
	};

	return (
		<PageLayout activePage="feed" user={currentUser}>
			<PageHeader title="Edit Post" />

			<div className="edit-post-preview">
				<img src={post.imageUrl} alt={post.caption} />
			</div>

			<Formik initialValues={initialValues} validationSchema={editPostSchema} onSubmit={handleSubmit}>
				{({ setFieldValue, values, errors, touched, isSubmitting }) => (
					<Form className="edit-post-form">
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

						<FormActions submitLabel="Save Changes" onCancel={() => navigate(-1)} isSubmitting={isSubmitting} />
					</Form>
				)}
			</Formik>
		</PageLayout>
	);
};

export default EditPostPage;
