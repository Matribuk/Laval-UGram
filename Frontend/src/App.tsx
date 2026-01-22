import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, RestrictedRoute } from './components/PrivateRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import HomePage from './pages/HomePage/HomePage';
import UsersPage from './pages/UsersPage/UsersPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import EditProfilePage from './pages/SettingsPage/EditProfilePage';
import CreatePostPage from './pages/CreatePostPage/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage/PostDetailPage';
import EditPostPage from './pages/EditPostPage/EditPostPage';
import MessagesPage from './pages/MessagesPage';

function App(): React.JSX.Element {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route
				path="/login"
				element={
					<RestrictedRoute>
						<LoginPage />
					</RestrictedRoute>
				}
			/>
			<Route
				path="/signup"
				element={
					<RestrictedRoute>
						<SignupPage />
					</RestrictedRoute>
				}
			/>
			<Route
				path="/feed"
				element={
					<PrivateRoute>
						<HomePage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/users"
				element={
					<PrivateRoute>
						<UsersPage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/profile"
				element={
					<PrivateRoute>
						<ProfilePage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/profile/edit"
				element={
					<PrivateRoute>
						<EditProfilePage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/profile/:username"
				element={
					<PrivateRoute>
						<ProfilePage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/post/create"
				element={
					<PrivateRoute>
						<CreatePostPage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/post/:id"
				element={
					<PrivateRoute>
						<PostDetailPage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/post/:id/edit"
				element={
					<PrivateRoute>
						<EditPostPage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/messages"
				element={
					<PrivateRoute>
						<MessagesPage />
					</PrivateRoute>
				}
			/>
		</Routes>
	);
}

export default App;
