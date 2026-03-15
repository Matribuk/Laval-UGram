import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import FormField from '../../components/FormField/FormField';

const renderWithFormik = (ui: React.ReactElement, initialValues = { testField: '' }) => {
	return render(
		<Formik initialValues={initialValues} onSubmit={jest.fn()}>
			<Form>{ui}</Form>
		</Formik>,
	);
};

describe('FormField', () => {
	it('renders label correctly', () => {
		renderWithFormik(<FormField name="testField" label="Test Label" />);
		expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
	});

	it('renders required asterisk when required', () => {
		renderWithFormik(<FormField name="testField" label="Required Field" required />);
		expect(screen.getByText(/Required Field/)).toBeInTheDocument();
		expect(screen.getByText('*', { exact: false })).toBeInTheDocument();
	});

	it('renders with placeholder', () => {
		renderWithFormik(<FormField name="testField" label="Test" placeholder="Enter value" />);
		expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
	});

	it('renders with default text type', () => {
		renderWithFormik(<FormField name="testField" label="Test" />);
		const input = screen.getByLabelText('Test');
		expect(input).toHaveAttribute('type', 'text');
	});

	it('renders with email type', () => {
		renderWithFormik(<FormField name="email" label="Email" type="email" />);
		const input = screen.getByLabelText('Email');
		expect(input).toHaveAttribute('type', 'email');
	});

	it('shows error message when touched and has error', () => {
		renderWithFormik(<FormField name="testField" label="Test" error="This field is required" touched />);
		expect(screen.getByText('This field is required')).toBeInTheDocument();
	});

	it('does not show error when not touched', () => {
		renderWithFormik(<FormField name="testField" label="Test" error="This field is required" touched={false} />);
		expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
	});

	it('applies error class when touched and has error', () => {
		renderWithFormik(<FormField name="testField" label="Test" error="Error" touched />);
		const input = screen.getByLabelText('Test');
		expect(input).toHaveClass('input-error');
	});
});
