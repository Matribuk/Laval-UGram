import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from '../../components/SearchInput/SearchInput';

jest.mock('../../utils/SvgFile', () => ({
	SearchIcon: ({ className }: { className?: string }) => <svg data-testid="search-icon" className={className} />,
}));

describe('SearchInput', () => {
	it('renders with default placeholder', () => {
		render(<SearchInput value="" onChange={jest.fn()} />);
		expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
	});

	it('renders with custom placeholder', () => {
		render(<SearchInput value="" onChange={jest.fn()} placeholder="Find users..." />);
		expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument();
	});

	it('displays the provided value', () => {
		render(<SearchInput value="test query" onChange={jest.fn()} />);
		const input = screen.getByDisplayValue('test query');
		expect(input).toBeInTheDocument();
	});

	it('calls onChange when input value changes', () => {
		const handleChange = jest.fn();
		render(<SearchInput value="" onChange={handleChange} />);
		const input = screen.getByPlaceholderText('Search...');
		fireEvent.change(input, { target: { value: 'new value' } });
		expect(handleChange).toHaveBeenCalledWith('new value');
	});

	it('renders search icon', () => {
		render(<SearchInput value="" onChange={jest.fn()} />);
		expect(screen.getByTestId('search-icon')).toBeInTheDocument();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<SearchInput value="" onChange={jest.fn()} />);
		expect(container.querySelector('.search-container')).toBeInTheDocument();
		expect(container.querySelector('.search-input')).toBeInTheDocument();
	});
});
