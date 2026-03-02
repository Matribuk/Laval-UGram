import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Post } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { getTimeAgo } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout/PageLayout';
import PostCard from '../../components/PostCard/PostCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { postsService } from '../../services/postsService';
import './HomePage.css';

const HomePage: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	const isHashtagSearch = searchQuery.trim().startsWith('#') && searchQuery.trim().length > 1;

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const query = searchQuery.trim();
		if (query) {
			if (query.startsWith('#') && query.length > 1) {
				navigate(`/hashtag/${encodeURIComponent(query.slice(1))}`);
			} else {
				navigate(`/search?q=${encodeURIComponent(query)}`);
			}
		}
	};

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
			<div className="feed-header">
				<h1 className="page-title">Feed</h1>
				<form className="search-form" onSubmit={handleSearch}>
					<div className="search-input-wrapper">
						<input
							type="text"
							className={`search-input ${isHashtagSearch ? 'search-input-hashtag' : ''}`}
							placeholder="Search posts or #hashtag..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{isHashtagSearch && <span className="search-hashtag-badge">#</span>}
					</div>
					<button type="submit" className="search-button">
						{isHashtagSearch ? 'Hashtag' : 'Search'}
					</button>
				</form>
			</div>

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
