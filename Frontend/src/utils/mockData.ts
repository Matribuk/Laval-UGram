import { CurrentUser } from '../types/api.types';
import currentUserData from '../__data__/currentUser.json';

export const currentUser: CurrentUser = {
	name: currentUserData.name,
	email: currentUserData.email,
	avatar: currentUserData.avatar || undefined,
};

export const isCurrentUser = (username: string): boolean => {
	return username === currentUser.name;
};
