import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Formik, Form } from 'formik';
import PasswordInput from '../../components/PasswordInput/PasswordInput';

jest.mock('../../utils/SvgFile', () => ({
	EyeIcon: () => <svg data-testid="eye-icon" />,
	EyeOffIcon: () => <svg data-testid="eye-off-icon" />,
}));

const renderWithFormik = (ui: React.ReactElement, initialValues = { password: '' }) => {
	return render(
		<Formik initialValues={initialValues} onSubmit={() => {}}>
			<Form>{ui}</Form>
		</Formik>
	);
};

describe('PasswordInput', () => {
	it('renders with label', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" />);
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
	});

	it('renders with default placeholder', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" />);
		expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
	});

	it('renders with custom placeholder', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" placeholder="Type password here" />);
		expect(screen.getByPlaceholderText('Type password here')).toBeInTheDocument();
	});

	it('initially renders as password type (hidden)', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" />);
		const input = screen.getByLabelText('Password');
		expect(input).toHaveAttribute('type', 'password');
	});

	it('toggles password visibility when button is clicked', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" />);
		const input = screen.getByLabelText('Password');
		const toggleButton = screen.getByRole('button', { name: 'Show password' });

		expect(input).toHaveAttribute('type', 'password');
		fireEvent.click(toggleButton);
		expect(input).toHaveAttribute('type', 'text');
		expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
	});

	it('shows eye icon when password is hidden', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" />);
		expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
	});

	it('shows eye-off icon when password is visible', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" />);
		const toggleButton = screen.getByRole('button', { name: 'Show password' });
		fireEvent.click(toggleButton);
		expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
	});

	it('shows error message when touched and has error', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" error="Password is required" touched />);
		expect(screen.getByText('Password is required')).toBeInTheDocument();
	});

	it('does not show error when not touched', () => {
		renderWithFormik(
			<PasswordInput name="password" label="Password" error="Password is required" touched={false} />
		);
		expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
	});

	it('applies error class when touched and has error', () => {
		renderWithFormik(<PasswordInput name="password" label="Password" error="Error" touched />);
		const input = screen.getByLabelText('Password');
		expect(input).toHaveClass('input-error');
	});
});
