import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user')
            .then(res => {
                if (!res.ok) throw new Error('Not authenticated');
                return res.json();
            })
            .then(data => {
                setUser(data);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (username, password) => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Login failed');
        }
        const data = await res.json();
        // After login, re-fetch user to get full data including role
        const userRes = await fetch('/api/user');
        const userData = await userRes.json();
        setUser(userData);
        return data;
    }, []);

    const register = useCallback(async (username, password) => {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Registration failed');
        }
        const data = await res.json();
        // After register, get full user
        const userRes = await fetch('/api/user');
        const userData = await userRes.json();
        setUser(userData);
        return data;
    }, []);

    const logout = useCallback(async () => {
        await fetch('/api/logout', { method: 'POST' });
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}