export const getInitial = (name: string): string => {
	return name.charAt(0).toUpperCase();
};

export const formatDate = (date: Date): string => {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		year: 'numeric',
	});
};

export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, maxLength)}...`;
};

export const parseMentions = (text: string): string[] => {
	const mentionRegex = /@([a-zA-Z0-9_]+)/g;
	const matches = text.match(mentionRegex);
	if (!matches) {
		return [];
	}
	return matches.map((m) => m.slice(1));
};

export const parseTags = (tagsString: string): string[] => {
	return tagsString
		.split(/[\s,]+/)
		.map((tag) => tag.replace(/^#/, '').trim())
		.filter((tag) => tag.length > 0);
};

export const getTimeAgo = (dateString: string): string => {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (seconds < 60) {
		return 'just now';
	}
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	}
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	}
	const days = Math.floor(hours / 24);
	if (days < 7) {
		return `${days} day${days > 1 ? 's' : ''} ago`;
	}
	const weeks = Math.floor(days / 7);
	if (weeks < 4) {
		return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
	}
	const months = Math.floor(days / 30);
	return `${months} month${months > 1 ? 's' : ''} ago`;
};
