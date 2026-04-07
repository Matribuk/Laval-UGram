import React from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../../types/api.types';
import { getTimeAgo } from '../../utils/helpers';
import { buildImageUrl } from '../../utils/constants';
import Avatar from '../Avatar/Avatar';
import { TrashIcon } from '../../utils/SvgFile';

interface CommentItemProps {
	comment: Comment;
	isOwner: boolean;
	onDelete: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isOwner, onDelete }) => {
	return (
		<div className="comment">
			<Link to={`/profile/${comment.user.username}`} className="comment-avatar-link">
				<Avatar
					src={comment.user.profilePictureUrl ? buildImageUrl(comment.user.profilePictureUrl) : undefined}
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
			{isOwner && (
				<button
					type="button"
					className="comment-delete-btn"
					onClick={() => onDelete(comment.id)}
					aria-label="Delete comment"
				>
					<TrashIcon />
				</button>
			)}
		</div>
	);
};

export default React.memo(CommentItem);
