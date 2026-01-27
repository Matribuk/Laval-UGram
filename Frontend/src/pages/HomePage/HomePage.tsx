import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Post } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { getTimeAgo } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout';
import PostCard from '../../components/PostCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { postsService } from '../../services/postsService';
import './HomePage.css';

const HomePage: React.FC = () => {
	const { user } = useUser();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	const postsWithTimeAgo = useMemo(
		() =>
			posts.map((post) => ({
				...post,
				timeAgo: getTimeAgo(post.createdAt),
			})),
		[posts],
	);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				setLoading(true);
				const data = await postsService.getAllPosts();
				setPosts(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error('Failed to fetch posts:', error);
				toast.error('Failed to load posts');
				setPosts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchPosts();
	}, []);

	if (loading) {
		return (
			<PageLayout activePage="feed" user={user}>
				<LoadingSpinner message="Loading posts..." />
			</PageLayout>
		);
	}

	return (
		<PageLayout activePage="feed" user={user}>
			<h1 className="page-title">Feed</h1>

			<div className="feed-container">
				{postsWithTimeAgo.length === 0 ? (
					<p className="feed-empty">No posts yet. Be the first to share something!</p>
				) : (
					<>
						{postsWithTimeAgo.map((post) => (
							<PostCard
								key={post.id}
								id={post.id}
								author={post.author}
								timeAgo={post.timeAgo}
								imageUrl={post.imageUrl}
								caption={post.caption}
								tags={post.tags}
							/>
						))}
						<p className="feed-end">You've reached the end</p>
					</>
				)}
			</div>
		</PageLayout>
	);
};

export default HomePage;
