import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Comment } from '../../types/api.types';
import { useUser } from '../UserContext';
import { SendIcon } from '../../utils/SvgFile';
import { postsService } from '../../services/postsService';
import CommentItem from './CommentItem';
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

	const handleDelete = useCallback(
		async (commentId: string) => {
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
		},
		[postId, onCommentCountChange],
	);

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
								<CommentItem
									key={comment.id}
									comment={comment}
									isOwner={currentUser?.username === comment.user.username}
									onDelete={handleDelete}
								/>
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
						<button type="submit" className="comment-submit-btn" disabled={!newComment.trim() || submitting}>
							<SendIcon />
						</button>
					</form>
				</>
			)}
		</div>
	);
};

export default CommentsSection;
