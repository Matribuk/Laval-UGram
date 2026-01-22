import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PostAuthor } from '../../types/api.types';
import Avatar from '../Avatar';
import MentionText from '../MentionText';
import './PostCard.css';

interface PostCardProps {
	id: number;
	author: PostAuthor;
	timeAgo: string;
	imageUrl: string;
	caption: string;
	tags: string[];
}

const PostCard: React.FC<PostCardProps> = ({ id, author, timeAgo, imageUrl, caption, tags }) => {
	const navigate = useNavigate();

	const handleImageClick = () => {
		navigate(`/post/${id}`);
	};

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

			<div className="post-content">
				<p className="post-caption">
					<Link to={`/profile/${author.username}`} className="caption-username">
						{author.username}
					</Link>{' '}
					<MentionText text={caption} />
				</p>
				{tags.length > 0 && (
					<div className="post-tags">
						{tags.map((tag, index) => (
							<span key={index} className="post-tag">
								#{tag}
							</span>
						))}
					</div>
				)}
			</div>
		</article>
	);
};

export default PostCard;
