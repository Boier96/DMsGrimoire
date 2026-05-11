import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            const user = await login(username, password);
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to your account</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="auth-input"
                            placeholder="Your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="auth-input"
                            placeholder="Your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <div className="auth-switch">
                    Don’t have an account?{' '}
                    <Link to="/register" className="auth-switch-link">Sign up</Link>
                </div>
            </div>
        </div>
    );
}