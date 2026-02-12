import React from 'react';

export const mockNavigate = jest.fn();
let mockParams: Record<string, string> = {};

export const useNavigate = () => mockNavigate;
export const useLocation = () => ({ pathname: '/' });
export const useParams = jest.fn(() => mockParams);
export const setMockParams = (params: Record<string, string>) => {
	mockParams = params;
};

export const Link = ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
	<a href={to} {...props}>
		{children}
	</a>
);

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const MemoryRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = () => null;
export const Navigate = () => null;
