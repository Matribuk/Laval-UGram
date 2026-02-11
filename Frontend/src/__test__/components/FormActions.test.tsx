import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormActions from '../../components/FormActions/FormActions';

describe('FormActions', () => {
	it('renders default button labels', () => {
		render(<FormActions onCancel={() => {}} />);
		expect(screen.getByText('Save')).toBeInTheDocument();
		expect(screen.getByText('Cancel')).toBeInTheDocument();
	});

	it('renders custom button labels', () => {
		render(<FormActions onCancel={() => {}} submitLabel="Create" cancelLabel="Back" />);
		expect(screen.getByText('Create')).toBeInTheDocument();
		expect(screen.getByText('Back')).toBeInTheDocument();
	});

	it('calls onCancel when cancel button is clicked', () => {
		const handleCancel = jest.fn();
		render(<FormActions onCancel={handleCancel} />);
		fireEvent.click(screen.getByText('Cancel'));
		expect(handleCancel).toHaveBeenCalledTimes(1);
	});

	it('submit button has type submit', () => {
		render(<FormActions onCancel={() => {}} />);
		const submitButton = screen.getByText('Save');
		expect(submitButton).toHaveAttribute('type', 'submit');
	});

	it('cancel button has type button', () => {
		render(<FormActions onCancel={() => {}} />);
		const cancelButton = screen.getByText('Cancel');
		expect(cancelButton).toHaveAttribute('type', 'button');
	});

	it('disables submit button when isSubmitting is true', () => {
		render(<FormActions onCancel={() => {}} isSubmitting />);
		const submitButton = screen.getByText('Save');
		expect(submitButton).toBeDisabled();
	});

	it('enables submit button when isSubmitting is false', () => {
		render(<FormActions onCancel={() => {}} isSubmitting={false} />);
		const submitButton = screen.getByText('Save');
		expect(submitButton).not.toBeDisabled();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<FormActions onCancel={() => {}} />);
		expect(container.querySelector('.form-actions')).toBeInTheDocument();
		expect(container.querySelector('.btn-primary')).toBeInTheDocument();
		expect(container.querySelector('.btn-secondary')).toBeInTheDocument();
	});
});
