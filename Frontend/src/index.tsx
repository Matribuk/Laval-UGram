import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { UserProvider } from './components/UserContext';
import App from './App';
import './index.css';

if (process.env.REACT_APP_SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.REACT_APP_SENTRY_DSN,
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration(),
			Sentry.captureConsoleIntegration({ levels: ['error'] }),
		],
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
		environment: process.env.NODE_ENV || 'development',
		beforeSend(event) {
			if (process.env.NODE_ENV === 'development') {
				console.log('Sentry event:', event);
			}
			return event;
		},
		attachStacktrace: true,
	});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).Sentry = Sentry;
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
			<BrowserRouter>
				<UserProvider>
					<App />
				</UserProvider>
			</BrowserRouter>
		</Sentry.ErrorBoundary>
	</React.StrictMode>,
);
