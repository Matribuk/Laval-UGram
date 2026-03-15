import React from 'react';

export const mockNavigate = jest.fn();
let mockParams: Record<string, string> = {};

export const useNavigate = (): jest.Mock => mockNavigate;
export const useLocation = (): { pathname: string } => ({ pathname: '/' });
export const useParams = jest.fn(() => mockParams);
export const useSearchParams = jest.fn(() => [new URLSearchParams(), jest.fn()]);
export const setMockParams = (params: Record<string, string>): void => {
	mockParams = params;
};

export const Link = ({
	children,
	to,
	...props
}: {
	children: React.ReactNode;
	to: string;
	[key: string]: unknown;
}): React.ReactElement => (
	<a href={to} {...props}>
		{children}
	</a>
);

export const BrowserRouter = ({ children }: { children: React.ReactNode }): React.ReactElement => <>{children}</>;
export const MemoryRouter = ({ children }: { children: React.ReactNode }): React.ReactElement => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }): React.ReactElement => <>{children}</>;
export const Route = (): null => null;
export const Navigate = (): null => null;
