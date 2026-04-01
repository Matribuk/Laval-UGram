import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Comment } from '../../types/api.types';
import { useUser } from '../UserContext';
import { getTimeAgo } from '../../utils/helpers';
import Avatar from '../Avatar/Avatar';
import { TrashIcon, SendIcon } from '../../utils/SvgFile';
import { postsService } from '../../services/postsService';
import './CommentsSection.css';

interface CommentsSectionProps {
	postId: string;
	onCommentCountChange?: (count: number) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, onCommentCountChange }) => {
	const { user: currentUser } = useUser();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState('');
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchComments = async () => {
			try {
				setLoading(true);
				const data = await postsService.getComments(postId);
				setComments(data);
				onCommentCountChange?.(data.length);
			} catch (error) {
				console.error('Failed to fetch comments:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
	}, [postId, onCommentCountChange]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim() || submitting) {
			return;
		}

		setSubmitting(true);
		try {
			const comment = await postsService.addComment(postId, newComment.trim());
			setComments((prev) => {
				const newComments = [...prev, comment];
				onCommentCountChange?.(newComments.length);
				return newComments;
			});
			setNewComment('');
			toast.success('Comment added');
		} catch (error) {
			console.error('Failed to add comment:', error);
			toast.error('Failed to add comment');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (commentId: string) => {
		try {
			await postsService.deleteComment(postId, commentId);
			setComments((prev) => {
				const newComments = prev.filter((c) => c.id !== commentId);
				onCommentCountChange?.(newComments.length);
				return newComments;
			});
			toast.success('Comment deleted');
		} catch (error) {
			console.error('Failed to delete comment:', error);
			toast.error('Failed to delete comment');
		}
	};

	return (
		<div className="comments-section">
			<h3 className="comments-title">Comments ({comments.length})</h3>

			{loading ? (
				<p className="comments-loading">Loading comments...</p>
			) : (
				<>
					{comments.length === 0 ? (
						<p className="comments-empty">No comments yet. Be the first to comment!</p>
					) : (
						<div className="comments-list">
							{comments.map((comment) => (
								<div key={comment.id} className="comment">
									<Link to={`/profile/${comment.user.username}`} className="comment-avatar-link">
										<Avatar
											src={comment.user.profilePictureUrl}
											name={comment.user.username}
											size="small"
										/>
									</Link>
									<div className="comment-content">
										<div className="comment-header">
											<Link to={`/profile/${comment.user.username}`} className="comment-username">
												{comment.user.username}
											</Link>
											<span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
										</div>
										<p className="comment-text">{comment.content}</p>
									</div>
									{currentUser?.username === comment.user.username && (
										<button
											type="button"
											className="comment-delete-btn"
											onClick={() => handleDelete(comment.id)}
											aria-label="Delete comment"
										>
											<TrashIcon />
										</button>
									)}
								</div>
							))}
						</div>
					)}

					<form className="comment-form" onSubmit={handleSubmit}>
						<input
							type="text"
							className="comment-input"
							placeholder="Add a comment..."
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							disabled={submitting}
						/>
						<button
							type="submit"
							className="comment-submit-btn"
							disabled={!newComment.trim() || submitting}
						>
							<SendIcon />
						</button>
					</form>
				</>
			)}
		</div>
	);
};

export default CommentsSection;
