import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
 
export default function LoginPage() {
  const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();
 
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			await login(username, password);
			navigate('/dashboard');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};
 
	return (
		<div className="auth-page">
			<div className="auth-card">
 
				<h1 className="auth-title">Welcome back</h1>
				<p className="auth-subtitle">Sign in, and start cooking</p>
 
				<form className="auth-form" onSubmit={handleSubmit}>
					<div className="auth-field">
						<label className="auth-label" htmlFor="username">Username</label>
						<input
							id="username"
							className="auth-input"
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							autoComplete="username"
							autoFocus
						/>
					</div>
 
					<div className="auth-field">
						<label className="auth-label" htmlFor="password">Password</label>
						<input
							id="password"
							className="auth-input"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="current-password"
						/>
					</div>
 
					{error && (
						<div className="auth-error">
							{error}
						</div>
					)}
 
					<button
						className="auth-submit"
						type="submit"
						disabled={loading}
					>
						{loading ? 'Signing in…' : 'Sign in'}
					</button>
				</form>
 
				<p className="auth-switch">
					No account?{' '}
					<Link className="auth-switch-link" to="/register">Create one</Link>
				</p>
			</div>
		</div>
	);
}
