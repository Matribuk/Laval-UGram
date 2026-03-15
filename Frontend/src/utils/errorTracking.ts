import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

export const captureApiError = (error: AxiosError): void => {
	if (process.env.REACT_APP_SENTRY_DSN) {
		Sentry.captureException(error, {
			tags: {
				type: 'api_error',
				status: error.response?.status,
			},
			contexts: {
				api: {
					url: error.config?.url,
					method: error.config?.method,
					baseURL: error.config?.baseURL,
				},
			},
		});
	}
};
