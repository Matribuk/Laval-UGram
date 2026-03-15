import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('react-router-dom');

describe('App', () => {
	it('renders toast container', () => {
		render(<App />);
		const toastContainer = screen.getByLabelText(/notifications/i);
		expect(toastContainer).toBeInTheDocument();
	});
});
