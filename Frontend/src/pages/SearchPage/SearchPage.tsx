import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Post } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { getTimeAgo } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout/PageLayout';
import PostCard from '../../components/PostCard/PostCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { postsService } from '../../services/postsService';
import './SearchPage.css';

const SearchPage: React.FC = () => {
	const { user } = useUser();
	const { hashtag } = useParams<{ hashtag: string }>();
	const [searchParams] = useSearchParams();
	const descriptionQuery = searchParams.get('q');

	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	const searchType = hashtag ? 'hashtag' : 'description';
	const searchTerm = hashtag || descriptionQuery || '';

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
			if (!searchTerm) {
				setPosts([]);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				let data: Post[];

				if (searchType === 'hashtag') {
					data = await postsService.getPostsByHashtag(searchTerm);
				} else {
					data = await postsService.searchByDescription(searchTerm);
				}

				setPosts(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error('Failed to search posts:', error);
				toast.error('Failed to search posts');
				setPosts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchPosts();
	}, [searchTerm, searchType]);

	const getTitle = () => {
		if (searchType === 'hashtag') {
			return `#${searchTerm}`;
		}
		return `Search: "${searchTerm}"`;
	};

	if (loading) {
		return (
			<PageLayout activePage="feed" user={user}>
				<LoadingSpinner message="Searching..." />
			</PageLayout>
		);
	}

	return (
		<PageLayout activePage="feed" user={user}>
			<h1 className="page-title">{getTitle()}</h1>

			<div className="search-results-container">
				{postsWithTimeAgo.length === 0 ? (
					<p className="search-empty">
						{searchType === 'hashtag'
							? `No posts found with hashtag #${searchTerm}`
							: `No posts found matching "${searchTerm}"`}
					</p>
				) : (
					<>
						<p className="search-count">
							{postsWithTimeAgo.length} {postsWithTimeAgo.length === 1 ? 'post' : 'posts'} found
						</p>
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
					</>
				)}
			</div>
		</PageLayout>
	);
};

export default SearchPage;
