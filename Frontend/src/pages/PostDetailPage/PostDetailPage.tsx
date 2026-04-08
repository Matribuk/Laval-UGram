import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Post } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { getTimeAgo } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout/PageLayout';
import PageHeader from '../../components/PageHeader/PageHeader';
import Avatar from '../../components/Avatar/Avatar';
import MentionText from '../../components/MentionText/MentionText';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import EmptyState from '../../components/EmptyState/EmptyState';
import LikeButton from '../../components/LikeButton/LikeButton';
import CommentsSection from '../../components/CommentsSection/CommentsSection';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { GridIcon } from '../../utils/SvgFile';
import { postsService } from '../../services/postsService';
import './PostDetailPage.css';

const PostDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { user: currentUser } = useUser();
	const [post, setPost] = useState<Post | null>(null);
	const [loading, setLoading] = useState(true);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

	const handleConfirmDelete = async () => {
		if (!post) {
			return;
		}

		try {
			await postsService.deletePost(post.id);
			toast.success('Post deleted successfully');
			navigate('/feed');
		} catch (error) {
			console.error('Failed to delete post:', error);
			toast.error('Failed to delete post');
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
	const timeAgo = getTimeAgo(post.createdAt);

	return (
		<PageLayout activePage="feed" user={currentUser}>
			<PageHeader title="Post" />

			<article className="post-detail">
				<div className="post-detail-author">
					<Link to={`/profile/${post.author.username}`} className="author-link">
						<Avatar src={post.author.avatar} name={post.author.username} size="medium" />
						<div className="author-info">
							<span className="author-username">{post.author.username}</span>
							<span className="post-time">{timeAgo}</span>
						</div>
					</Link>

					{isOwner && (
						<div className="post-actions">
							<button
								type="button"
								className="btn btn-secondary btn-sm"
								onClick={() => navigate(`/post/${post.id}/edit`)}
							>
								Edit
							</button>
							<button type="button" className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
								Delete
							</button>
						</div>
					)}
				</div>

				<div className="post-detail-image">
					<img src={post.mediumUrl} alt={post.caption} />
				</div>

				<div className="post-detail-actions">
					<LikeButton postId={post.id} />
				</div>

				<div className="post-detail-content">
					<p className="post-caption">
						<Link to={`/profile/${post.author.username}`} className="caption-username">
							{post.author.username}
						</Link>{' '}
						<MentionText text={post.caption} />
					</p>

					{post.tags && post.tags.length > 0 && (
						<div className="post-tags">
							{post.tags.map((tag: string, index: number) => (
								<span key={index} className="post-tag">
									#{tag}
								</span>
							))}
						</div>
					)}

					{post.mentions && post.mentions.length > 0 && (
						<div className="post-mentions">
							<span className="mentions-label">Mentions: </span>
							{post.mentions.map((mention: string, index: number) => (
								<Link key={index} to={`/profile/${mention}`} className="mention-link">
									@{mention}
								</Link>
							))}
						</div>
					)}
				</div>

				<CommentsSection postId={post.id} />
			</article>

			<ConfirmModal
				isOpen={showDeleteConfirm}
				title="Delete Post"
				message="Are you sure you want to delete this post? This action cannot be undone."
				confirmLabel="Delete"
				onConfirm={handleConfirmDelete}
				onCancel={() => setShowDeleteConfirm(false)}
				isDangerous
			/>
		</PageLayout>
	);
};

export default PostDetailPage;
