import React from 'react';
import { Post } from '../../types/api.types';
import { currentUser } from '../../utils/mockData';
import { getTimeAgo } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout';
import PostCard from '../../components/PostCard';
import postsData from '../../__data__/posts.json';
import './HomePage.css';

interface RawPost {
	id: number;
	authorUsername: string;
	createdAt: string;
	imageUrl: string;
	caption: string;
	tags: string[];
	mentions: string[];
}

const HomePage: React.FC = () => {
	const localPosts: RawPost[] = JSON.parse(localStorage.getItem('posts') || '[]');
	const allRawPosts: RawPost[] = [...localPosts, ...postsData.posts];

	const sortedPosts = allRawPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	const posts: Post[] = sortedPosts.map((p) => ({
		id: p.id,
		author: {
			username: p.authorUsername,
			avatar: undefined,
		},
		timeAgo: getTimeAgo(p.createdAt),
		createdAt: p.createdAt,
		imageUrl: p.imageUrl,
		caption: p.caption,
		tags: p.tags,
		mentions: p.mentions || [],
	}));

	return (
		<PageLayout activePage="feed" user={currentUser}>
			<h1 className="page-title">Feed</h1>

			<div className="feed-container">
				{posts.map((post) => (
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
			</div>
		</PageLayout>
	);
};

export default HomePage;
