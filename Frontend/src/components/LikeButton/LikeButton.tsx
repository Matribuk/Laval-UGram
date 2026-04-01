import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { HeartIcon } from '../../utils/SvgFile';
import { postsService } from '../../services/postsService';
import './LikeButton.css';

interface LikeButtonProps {
	postId: string;
	initialLikeCount?: number;
	initialLikedByCurrentUser?: boolean;
	showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
	postId,
	initialLikeCount = 0,
	initialLikedByCurrentUser = false,
	showCount = true,
}) => {
	const [likeCount, setLikeCount] = useState(initialLikeCount);
	const [liked, setLiked] = useState(initialLikedByCurrentUser);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchLikeStatus = async () => {
			try {
				const status = await postsService.getLikeStatus(postId);
				setLikeCount(status.likeCount);
				setLiked(status.likedByCurrentUser);
			} catch (error) {
				console.error('Failed to fetch like status:', error);
			}
		};

		fetchLikeStatus();
	}, [postId]);

	const handleToggleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (loading) {
			return;
		}

		setLoading(true);
		try {
			if (liked) {
				const status = await postsService.unlikePost(postId);
				setLikeCount(status.likeCount);
				setLiked(status.likedByCurrentUser);
			} else {
				const status = await postsService.likePost(postId);
				setLikeCount(status.likeCount);
				setLiked(status.likedByCurrentUser);
			}
		} catch (error) {
			console.error('Failed to toggle like:', error);
			toast.error('Failed to update like');
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			type="button"
			className={`like-button ${liked ? 'liked' : ''} ${loading ? 'loading' : ''}`}
			onClick={handleToggleLike}
			disabled={loading}
			aria-label={liked ? 'Unlike' : 'Like'}
		>
			<HeartIcon filled={liked} className="like-icon" />
			{showCount && <span className="like-count">{likeCount}</span>}
		</button>
	);
};

export default LikeButton;
