import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import * as UserContext from '../components/UserContext';

jest.mock('react-router-dom');
jest.mock('../components/UserContext');

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;

describe('App', () => {
	beforeEach(() => {
		mockUseUser.mockReturnValue({
			user: null,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: false,
		});
	});

	it('renders toast container', () => {
		render(<App />);
		const toastContainer = screen.getByLabelText(/notifications/i);
		expect(toastContainer).toBeInTheDocument();
	});
});
