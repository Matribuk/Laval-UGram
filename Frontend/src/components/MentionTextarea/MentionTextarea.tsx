import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User } from '../../types/api.types';
import { usersService } from '../../services/usersService';
import Avatar from '../Avatar/Avatar';
import './MentionTextarea.css';

interface MentionTextareaProps {
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	className?: string;
	hasError?: boolean;
	rows?: number;
}

const MentionTextarea: React.FC<MentionTextareaProps> = ({
	value,
	onChange,
	onBlur,
	placeholder,
	className = '',
	hasError = false,
	rows = 4,
}) => {
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<User[]>([]);
	const [mentionQuery, setMentionQuery] = useState('');
	const [mentionStartIndex, setMentionStartIndex] = useState(-1);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [users, setUsers] = useState<User[]>([]);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await usersService.getAllUsers();
				setUsers(data);
			} catch (error) {
				console.error('Failed to fetch users for mentions:', error);
			}
		};

		fetchUsers();
	}, []);

	const findMentionQuery = useCallback(
		(text: string, cursorPos: number): { query: string; startIndex: number } | null => {
			const textBeforeCursor = text.slice(0, cursorPos);
			const atIndex = textBeforeCursor.lastIndexOf('@');

			if (atIndex === -1) {
				return null;
			}

			const textAfterAt = textBeforeCursor.slice(atIndex + 1);

			if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
				return null;
			}

			if (atIndex > 0 && !/[\s\n]/.test(text[atIndex - 1])) {
				return null;
			}

			return {
				query: textAfterAt.toLowerCase(),
				startIndex: atIndex,
			};
		},
		[],
	);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		const cursorPos = e.target.selectionStart;

		onChange(newValue);

		const mentionInfo = findMentionQuery(newValue, cursorPos);

		if (mentionInfo) {
			const filteredUsers = users.filter(
				(user) =>
					user.username.toLowerCase().includes(mentionInfo.query) ||
					user.fullName.toLowerCase().includes(mentionInfo.query),
			);

			if (filteredUsers.length > 0) {
				setSuggestions(filteredUsers.slice(0, 5));
				setMentionQuery(mentionInfo.query);
				setMentionStartIndex(mentionInfo.startIndex);
				setShowSuggestions(true);
				setSelectedIndex(0);
			} else {
				setShowSuggestions(false);
			}
		} else {
			setShowSuggestions(false);
		}
	};

	const insertMention = (username: string) => {
		if (mentionStartIndex === -1) {
			return;
		}

		const beforeMention = value.slice(0, mentionStartIndex);
		const afterMention = value.slice(mentionStartIndex + 1 + mentionQuery.length);
		const newValue = `${beforeMention}@${username} ${afterMention}`;

		onChange(newValue);
		setShowSuggestions(false);
		setMentionStartIndex(-1);
		setMentionQuery('');

		setTimeout(() => {
			if (textareaRef.current) {
				const newCursorPos = mentionStartIndex + username.length + 2;
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
			}
		}, 0);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (!showSuggestions) {
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % suggestions.length);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
				break;
			case 'Enter':
				if (suggestions[selectedIndex]) {
					e.preventDefault();
					insertMention(suggestions[selectedIndex].username);
				}
				break;
			case 'Escape':
				e.preventDefault();
				setShowSuggestions(false);
				break;
			case 'Tab':
				if (suggestions[selectedIndex]) {
					e.preventDefault();
					insertMention(suggestions[selectedIndex].username);
				}
				break;
		}
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(e.target as Node) &&
				textareaRef.current &&
				!textareaRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className="mention-textarea-container">
			<textarea
				ref={textareaRef}
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={onBlur}
				placeholder={placeholder}
				className={`mention-textarea ${className} ${hasError ? 'has-error' : ''}`}
				rows={rows}
			/>
			{showSuggestions && suggestions.length > 0 && (
				<div ref={suggestionsRef} className="mention-suggestions">
					{suggestions.map((user, index) => (
						<button
							key={user.id}
							type="button"
							className={`mention-suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
							onClick={() => insertMention(user.username)}
							onMouseEnter={() => setSelectedIndex(index)}
						>
							<Avatar name={user.fullName} src={user.avatar || undefined} size="small" />
							<div className="mention-suggestion-info">
								<span className="mention-suggestion-username">@{user.username}</span>
								<span className="mention-suggestion-fullname">{user.fullName}</span>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default MentionTextarea;
