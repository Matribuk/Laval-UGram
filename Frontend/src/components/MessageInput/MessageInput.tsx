import React, { useState } from 'react';
import { SendIcon } from '../../utils/SvgFile';
import './MessageInput.css';

interface MessageInputProps {
	onSend: (content: string) => void;
	disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
	const [content, setContent] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedContent = content.trim();
		if (trimmedContent && !disabled) {
			onSend(trimmedContent);
			setContent('');
		}
	};

	return (
		<form className="message-input-form" onSubmit={handleSubmit}>
			<input
				type="text"
				className="message-input"
				placeholder="Type a message..."
				value={content}
				onChange={(e) => setContent(e.target.value)}
				disabled={disabled}
			/>
			<button type="submit" className="message-send-button" disabled={!content.trim() || disabled}>
				<SendIcon />
			</button>
		</form>
	);
};

export default MessageInput;
