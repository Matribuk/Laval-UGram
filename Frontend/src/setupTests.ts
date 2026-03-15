import '@testing-library/jest-dom';

jest.mock('@sentry/react', () => ({
	captureException: jest.fn(),
	captureMessage: jest.fn(),
	init: jest.fn(),
	browserTracingIntegration: jest.fn(),
	replayIntegration: jest.fn(),
	captureConsoleIntegration: jest.fn(),
	ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('./utils/errorTracking', () => ({
	captureApiError: jest.fn(),
}));
