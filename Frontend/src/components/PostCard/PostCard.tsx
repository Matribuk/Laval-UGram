import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PostAuthor } from '../../types/api.types';
import Avatar from '../Avatar/Avatar';
import MentionText from '../MentionText/MentionText';
import LikeButton from '../LikeButton/LikeButton';
import CommentButton from '../CommentButton/CommentButton';
import CommentsSection from '../CommentsSection/CommentsSection';
import { postsService } from '../../services/postsService';
import './PostCard.css';

interface PostCardProps {
	id: string;
	author: PostAuthor;
	timeAgo: string;
	imageUrl: string;
	caption: string;
	tags: string[];
}

const PostCard: React.FC<PostCardProps> = ({ id, author, timeAgo, imageUrl, caption, tags }) => {
	const navigate = useNavigate();
	const [showComments, setShowComments] = useState(false);
	const [commentCount, setCommentCount] = useState(0);

	useEffect(() => {
		const fetchCommentCount = async () => {
			try {
				const comments = await postsService.getComments(id);
				setCommentCount(comments.length);
			} catch (error) {
				console.error('Failed to fetch comment count:', error);
			}
		};
		fetchCommentCount();
	}, [id]);

	const handleImageClick = () => {
		navigate(`/post/${id}`);
	};

	const toggleComments = () => {
		setShowComments((prev) => !prev);
	};

	const handleCommentCountChange = useCallback((count: number) => {
		setCommentCount(count);
	}, []);

	return (
		<article className="post-card">
			<div className="post-header">
				<Link to={`/profile/${author.username}`} className="post-author-link">
					<Avatar src={author.avatar} name={author.username} size="medium" className="post-avatar" />
					<div className="post-author-info">
						<span className="post-username">{author.username}</span>
						<span className="post-time">{timeAgo}</span>
					</div>
				</Link>
			</div>

			<div className="post-image" onClick={handleImageClick}>
				<img src={imageUrl} alt={caption} />
			</div>

			<div className="post-actions-bar">
				<LikeButton postId={id} />
				<CommentButton count={commentCount} isActive={showComments} onClick={toggleComments} />
			</div>

			<div className="post-content">
				<p className="post-caption">
					<Link to={`/profile/${author.username}`} className="caption-username">
						{author.username}
					</Link>{' '}
					<MentionText text={caption} />
				</p>
				{tags.length > 0 && (
					<div className="post-tags">
						{tags.map((tag) => (
							<Link key={tag} to={`/hashtag/${tag}`} className="post-tag">
								#{tag}
							</Link>
						))}
					</div>
				)}
			</div>

			{showComments && <CommentsSection postId={id} onCommentCountChange={handleCommentCountChange} />}
		</article>
	);
};

export default React.memo(PostCard);
