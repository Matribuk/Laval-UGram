import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PrivateRoute, RestrictedRoute, NotFoundRedirect } from './components/PrivateRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner/LoadingSpinner';

const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage/SignupPage'));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage/OAuthCallbackPage'));
const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const UsersPage = lazy(() => import('./pages/UsersPage/UsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/SettingsPage/EditProfilePage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage/CreatePostPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage/PostDetailPage'));
const EditPostPage = lazy(() => import('./pages/EditPostPage/EditPostPage'));

function App(): React.JSX.Element {
	return (
		<>
			<ToastContainer
				position="top-right"
				autoClose={4000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
			<Suspense fallback={<LoadingSpinner message="Loading..." />}>
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
					<Route path="/oauth/callback" element={<OAuthCallbackPage />} />
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
					<Route path="*" element={<NotFoundRedirect />} />
				</Routes>
			</Suspense>
		</>
	);
}

export default App;
