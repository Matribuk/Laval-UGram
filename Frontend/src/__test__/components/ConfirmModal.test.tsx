import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

describe('ConfirmModal', () => {
	const defaultProps = {
		isOpen: true,
		title: 'Confirm Action',
		message: 'Are you sure you want to proceed?',
		onConfirm: jest.fn(),
		onCancel: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders nothing when isOpen is false', () => {
		const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />);
		expect(container.firstChild).toBeNull();
	});

	it('renders modal when isOpen is true', () => {
		render(<ConfirmModal {...defaultProps} />);
		expect(screen.getByText('Confirm Action')).toBeInTheDocument();
		expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
	});

	it('renders default button labels', () => {
		render(<ConfirmModal {...defaultProps} />);
		expect(screen.getByText('Confirm')).toBeInTheDocument();
		expect(screen.getByText('Cancel')).toBeInTheDocument();
	});

	it('renders custom button labels', () => {
		render(<ConfirmModal {...defaultProps} confirmLabel="Yes, delete" cancelLabel="No, keep" />);
		expect(screen.getByText('Yes, delete')).toBeInTheDocument();
		expect(screen.getByText('No, keep')).toBeInTheDocument();
	});

	it('calls onConfirm when confirm button is clicked', () => {
		render(<ConfirmModal {...defaultProps} />);
		fireEvent.click(screen.getByText('Confirm'));
		expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
	});

	it('calls onCancel when cancel button is clicked', () => {
		render(<ConfirmModal {...defaultProps} />);
		fireEvent.click(screen.getByText('Cancel'));
		expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
	});

	it('applies primary button style by default', () => {
		render(<ConfirmModal {...defaultProps} />);
		const confirmButton = screen.getByText('Confirm');
		expect(confirmButton).toHaveClass('btn-primary');
	});

	it('applies danger button style when isDangerous is true', () => {
		render(<ConfirmModal {...defaultProps} isDangerous />);
		const confirmButton = screen.getByText('Confirm');
		expect(confirmButton).toHaveClass('btn-danger');
		expect(confirmButton).not.toHaveClass('btn-primary');
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<ConfirmModal {...defaultProps} />);
		expect(container.querySelector('.confirm-modal-overlay')).toBeInTheDocument();
		expect(container.querySelector('.confirm-modal')).toBeInTheDocument();
		expect(container.querySelector('.confirm-modal-actions')).toBeInTheDocument();
	});
});
