import React from 'react';
import { CommentIcon } from '../../utils/SvgFile';
import './CommentButton.css';

interface CommentButtonProps {
	count: number;
	isActive: boolean;
	onClick: () => void;
}

const CommentButton: React.FC<CommentButtonProps> = ({ count, isActive, onClick }) => {
	return (
		<button
			type="button"
			className={`comment-button ${isActive ? 'active' : ''}`}
			onClick={onClick}
			aria-label={isActive ? 'Hide comments' : 'Show comments'}
		>
			<CommentIcon />
			<span className="comment-count">{count}</span>
		</button>
	);
};

export default CommentButton;
