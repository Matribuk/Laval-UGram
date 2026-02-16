import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MentionTextarea from '../../components/MentionTextarea/MentionTextarea';
import { usersService } from '../../services/usersService';

jest.mock('../../services/usersService');

const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe('MentionTextarea', () => {
	const mockUsers = [
		{
			id: 'user-1',
			username: 'johndoe',
			email: 'john@test.com',
			firstName: 'John',
			lastName: 'Doe',
			fullName: 'John Doe',
			avatar: '/avatar1.jpg',
		},
		{
			id: 'user-2',
			username: 'janedoe',
			email: 'jane@test.com',
			firstName: 'Jane',
			lastName: 'Doe',
			fullName: 'Jane Doe',
			avatar: '/avatar2.jpg',
		},
		{
			id: 'user-3',
			username: 'bobsmith',
			email: 'bob@test.com',
			firstName: 'Bob',
			lastName: 'Smith',
			fullName: 'Bob Smith',
			avatar: undefined,
		},
	];

	const defaultProps = {
		value: '',
		onChange: jest.fn(),
	};

	const triggerChangeWithCursor = (textarea: HTMLTextAreaElement, value: string, cursorPos: number) => {
		Object.defineProperty(textarea, 'selectionStart', { value: cursorPos, configurable: true });
		fireEvent.change(textarea, { target: { value } });
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
	});

	it('renders textarea with placeholder', () => {
		render(<MentionTextarea {...defaultProps} placeholder="Write something..." />);
		expect(screen.getByPlaceholderText('Write something...')).toBeInTheDocument();
	});

	it('renders with initial value', () => {
		render(<MentionTextarea {...defaultProps} value="Hello world" />);
		expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
	});

	it('calls onChange when typing', () => {
		const onChange = jest.fn();
		render(<MentionTextarea {...defaultProps} onChange={onChange} />);

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, 'Test', 4);

		expect(onChange).toHaveBeenCalledWith('Test');
	});

	it('calls onBlur when textarea loses focus', () => {
		const onBlur = jest.fn();
		render(<MentionTextarea {...defaultProps} onBlur={onBlur} />);

		const textarea = screen.getByRole('textbox');
		fireEvent.blur(textarea);

		expect(onBlur).toHaveBeenCalled();
	});

	it('applies custom className', () => {
		render(<MentionTextarea {...defaultProps} className="custom-class" />);
		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveClass('custom-class');
	});

	it('applies error class when hasError is true', () => {
		render(<MentionTextarea {...defaultProps} hasError={true} />);
		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveClass('has-error');
	});

	it('sets custom rows', () => {
		render(<MentionTextarea {...defaultProps} rows={6} />);
		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveAttribute('rows', '6');
	});

	it('fetches users on mount', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});
	});

	it('shows suggestions when typing @', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
			expect(screen.getByText('@janedoe')).toBeInTheDocument();
		});
	});

	it('filters suggestions based on query', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@john', 5);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
			expect(screen.queryByText('@bobsmith')).not.toBeInTheDocument();
		});
	});

	it('filters by fullName as well', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@doe', 4);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
			expect(screen.getByText('@janedoe')).toBeInTheDocument();
			expect(screen.queryByText('@bobsmith')).not.toBeInTheDocument();
		});
	});

	it('inserts mention when clicking on suggestion', async () => {
		const onChange = jest.fn();
		render(<MentionTextarea {...defaultProps} onChange={onChange} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('@johndoe'));

		expect(onChange).toHaveBeenCalledWith('@johndoe ');
	});

	it('navigates suggestions with ArrowDown', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
		});

		fireEvent.keyDown(textarea, { key: 'ArrowDown' });

		const suggestions = screen.getAllByRole('button');
		expect(suggestions[1]).toHaveClass('selected');
	});

	it('navigates suggestions with ArrowUp', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
		});

		fireEvent.keyDown(textarea, { key: 'ArrowUp' });

		const suggestions = screen.getAllByRole('button');
		expect(suggestions[suggestions.length - 1]).toHaveClass('selected');
	});

	it('inserts mention with Enter key', async () => {
		const onChange = jest.fn();
		render(<MentionTextarea {...defaultProps} onChange={onChange} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
		});

		fireEvent.keyDown(textarea, { key: 'Enter' });

		expect(onChange).toHaveBeenCalledWith('@johndoe ');
	});

	it('inserts mention with Tab key', async () => {
		const onChange = jest.fn();
		render(<MentionTextarea {...defaultProps} onChange={onChange} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
		});

		fireEvent.keyDown(textarea, { key: 'Tab' });

		expect(onChange).toHaveBeenCalledWith('@johndoe ');
	});

	it('closes suggestions with Escape key', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
		});

		fireEvent.keyDown(textarea, { key: 'Escape' });

		expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
	});

	it('does not show suggestions when @ is in middle of word', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, 'email@test', 10);

		expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
	});

	it('hides suggestions when space is typed after @', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@ ', 2);

		expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
	});

	it('hides suggestions when no users match', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@xyz123nonexistent', 18);

		expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
	});

	it('shows maximum 5 suggestions', async () => {
		const manyUsers = Array.from({ length: 10 }, (_, i) => ({
			id: `user-${i}`,
			username: `user${i}`,
			email: `user${i}@test.com`,
			firstName: `User`,
			lastName: `${i}`,
			fullName: `User ${i}`,
			avatar: undefined,
		}));
		mockUsersService.getAllUsers.mockResolvedValue(manyUsers);

		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@user', 5);

		await waitFor(() => {
			const suggestions = screen.getAllByRole('button');
			expect(suggestions.length).toBe(5);
		});
	});

	it('handles user fetch error gracefully', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockUsersService.getAllUsers.mockRejectedValue(new Error('Network error'));

		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch users for mentions:', expect.any(Error));
		});

		consoleSpy.mockRestore();
	});

	it('highlights selected suggestion on mouse enter', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@janedoe')).toBeInTheDocument();
		});

		const janeButton = screen.getByText('@janedoe').closest('button');
		if (janeButton) {
			fireEvent.mouseEnter(janeButton);
			expect(janeButton).toHaveClass('selected');
		}
	});

	it('does nothing for keydown when suggestions are hidden', async () => {
		const onChange = jest.fn();
		render(<MentionTextarea {...defaultProps} onChange={onChange} />);

		const textarea = screen.getByRole('textbox');
		fireEvent.keyDown(textarea, { key: 'ArrowDown' });
		fireEvent.keyDown(textarea, { key: 'Enter' });

		expect(onChange).not.toHaveBeenCalled();
	});

	it('closes suggestions on outside click', async () => {
		render(
			<div>
				<div data-testid="outside">Outside</div>
				<MentionTextarea {...defaultProps} />
			</div>,
		);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('@johndoe')).toBeInTheDocument();
		});

		fireEvent.mouseDown(screen.getByTestId('outside'));

		await waitFor(() => {
			expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
		});
	});

	it('displays user fullName in suggestions', async () => {
		render(<MentionTextarea {...defaultProps} />);

		await waitFor(() => {
			expect(mockUsersService.getAllUsers).toHaveBeenCalled();
		});

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		triggerChangeWithCursor(textarea, '@', 1);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('Jane Doe')).toBeInTheDocument();
		});
	});
});
