import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from '../../components/MessageInput/MessageInput';

jest.mock('../../utils/SvgFile', () => ({
	SendIcon: () => <svg data-testid="send-icon" />,
}));

describe('MessageInput', () => {
	const mockOnSend = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders input and send button', () => {
		render(<MessageInput onSend={mockOnSend} />);
		expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
		expect(screen.getByRole('button')).toBeInTheDocument();
	});

	it('send button is disabled when input is empty', () => {
		render(<MessageInput onSend={mockOnSend} />);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('send button is enabled when input has content', async () => {
		render(<MessageInput onSend={mockOnSend} />);
		const input = screen.getByPlaceholderText('Type a message...');
		await userEvent.type(input, 'Hello');
		expect(screen.getByRole('button')).not.toBeDisabled();
	});

	it('calls onSend with trimmed content on submit', async () => {
		render(<MessageInput onSend={mockOnSend} />);
		const input = screen.getByPlaceholderText('Type a message...');
		await userEvent.type(input, '  Hello World  ');
		const form = screen.getByRole('button').closest('form');
		if (form) {
			fireEvent.submit(form);
		}
		expect(mockOnSend).toHaveBeenCalledWith('Hello World');
	});

	it('clears input after successful send', async () => {
		render(<MessageInput onSend={mockOnSend} />);
		const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
		await userEvent.type(input, 'Hello');
		const form = screen.getByRole('button').closest('form');
		if (form) {
			fireEvent.submit(form);
		}
		expect(input.value).toBe('');
	});

	it('does not send empty or whitespace-only messages', async () => {
		render(<MessageInput onSend={mockOnSend} />);
		const input = screen.getByPlaceholderText('Type a message...');
		await userEvent.type(input, '   ');
		const form = screen.getByRole('button').closest('form');
		if (form) {
			fireEvent.submit(form);
		}
		expect(mockOnSend).not.toHaveBeenCalled();
	});

	it('disables input and button when disabled prop is true', () => {
		render(<MessageInput onSend={mockOnSend} disabled={true} />);
		expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('does not send message when disabled', async () => {
		render(<MessageInput onSend={mockOnSend} disabled={true} />);
		const form = screen.getByRole('button').closest('form');
		if (form) {
			fireEvent.submit(form);
		}
		expect(mockOnSend).not.toHaveBeenCalled();
	});
});
