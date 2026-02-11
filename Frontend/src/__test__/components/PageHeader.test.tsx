import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PageHeader from '../../components/PageHeader/PageHeader';
import { mockNavigate } from '../../__mocks__/react-router-dom';

jest.mock('react-router-dom');
jest.mock('../../utils/SvgFile', () => ({
	BackArrowIcon: () => <svg data-testid="back-arrow-icon" />,
}));

describe('PageHeader', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	it('renders title', () => {
		render(<PageHeader title="Edit Profile" />);
		expect(screen.getByText('Edit Profile')).toBeInTheDocument();
	});

	it('renders back button by default', () => {
		render(<PageHeader title="Test" />);
		expect(screen.getByRole('button')).toBeInTheDocument();
		expect(screen.getByTestId('back-arrow-icon')).toBeInTheDocument();
	});

	it('hides back button when showBackButton is false', () => {
		render(<PageHeader title="Test" showBackButton={false} />);
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('calls navigate(-1) when back button clicked without onBackClick', () => {
		render(<PageHeader title="Test" />);
		fireEvent.click(screen.getByRole('button'));
		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});

	it('calls onBackClick when provided', () => {
		const handleBack = jest.fn();
		render(<PageHeader title="Test" onBackClick={handleBack} />);
		fireEvent.click(screen.getByRole('button'));
		expect(handleBack).toHaveBeenCalledTimes(1);
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<PageHeader title="Test" />);
		expect(container.querySelector('.page-header')).toBeInTheDocument();
		expect(container.querySelector('.page-title')).toBeInTheDocument();
		expect(container.querySelector('.back-button')).toBeInTheDocument();
	});
});
