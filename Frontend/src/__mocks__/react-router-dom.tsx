import React from 'react';

export const mockNavigate = jest.fn();

export const useNavigate = (): jest.Mock => mockNavigate;

export const useLocation = jest.fn(() => ({
	pathname: '/',
	search: '',
	hash: '',
	state: null,
}));

export const useParams = jest.fn(() => ({}));

export const useSearchParams = jest.fn(() => [new URLSearchParams(), jest.fn()]);

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

export const NavLink = Link;

export const BrowserRouter = ({ children }: { children: React.ReactNode }): React.ReactElement => <div>{children}</div>;

export const Navigate = ({ to }: { to: string; replace?: boolean }): React.ReactElement => (
	<div data-testid="navigate" data-to={to} />
);

export const Routes = ({ children }: { children: React.ReactNode }): React.ReactElement => <div>{children}</div>;

export const Route = ({
	element,
}: {
	path?: string;
	element?: React.ReactNode;
	index?: boolean;
}): React.ReactElement => <>{element}</>;
