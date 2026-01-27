import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { EditPostFormValues, Post } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { editPostSchema } from '../../utils/validationSchemas';
import { parseTags } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout';
import PageHeader from '../../components/PageHeader';
import MentionTextarea from '../../components/MentionTextarea';
import FormActions from '../../components/FormActions';
import EmptyState from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { GridIcon } from '../../utils/SvgFile';
import { postsService } from '../../services/postsService';
import './EditPostPage.css';

const EditPostPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { user: currentUser } = useUser();
	const [post, setPost] = useState<Post | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPost = async () => {
			if (!id) {
				return;
			}

			try {
				setLoading(true);
				const data = await postsService.getPostById(id);
				setPost(data);
			} catch (error) {
				console.error('Failed to fetch post:', error);
				toast.error('Failed to load post');
			} finally {
				setLoading(false);
			}
		};

		fetchPost();
	}, [id]);

	const handleSubmit = async (values: EditPostFormValues) => {
		if (!post) {
			return;
		}

		try {
			const tags = parseTags(values.tags);

			await postsService.updatePost(post.id, {
				description: values.caption,
				hashtags: tags,
			});

			toast.success('Post updated successfully');
			navigate(`/post/${post.id}`);
		} catch (error) {
			console.error('Failed to update post:', error);
			toast.error('Failed to update post');
		}
	};

	if (loading) {
		return (
			<PageLayout activePage="feed" user={currentUser}>
				<LoadingSpinner message="Loading post..." />
			</PageLayout>
		);
	}

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

	const isOwner = post.author.username === currentUser?.username;

	if (!isOwner) {
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
