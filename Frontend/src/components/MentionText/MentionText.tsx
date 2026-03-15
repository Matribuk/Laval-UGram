import React from 'react';
import { Link } from 'react-router-dom';
import './MentionText.css';

interface MentionTextProps {
	text: string;
	className?: string;
}

const MentionText: React.FC<MentionTextProps> = ({ text, className }) => {
	const parts = text.split(/(@[a-zA-Z0-9_]+)/g);

	return (
		<span className={className}>
			{parts.map((part, index) => {
				if (part.startsWith('@')) {
					const username = part.slice(1);
					return (
						<Link key={index} to={`/profile/${username}`} className="mention-link">
							{part}
						</Link>
					);
				}
				return <span key={index}>{part}</span>;
			})}
		</span>
	);
};

export default MentionText;
