import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token) {
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            } else {
                setUser({ token });
            }
        }
        setLoading(false);
    }, []);

    const signin = async (username, password) => {
        try {
            const response = await api.post('/api/auth/signin', { username, password });
            const token = typeof response.data === 'string' ? response.data : response.data.token;

            localStorage.setItem('token', token);
            const userData = { username, token };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Signin error", error);
            // Handle plain string error or JSON object error
            const errorMessage = (typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message) || 'Login failed';
            return { success: false, error: errorMessage };
        }
    };

    const signup = async (username, password) => {
        try {
            const response = await api.post('/api/auth/signup', { username, password });
            // Return full data: secret, qrCodeUrl
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Signup error", error);
            const data = error.response?.data;
            const errorMessage = (typeof data === 'string' ? data : (data?.message || data?.error)) || 'Signup failed';
            return { success: false, error: errorMessage };
        }
    };

    const verifySignup = async (username, password, secret, mfaCode) => {
        try {
            await api.post('/api/auth/signup/verify', { username, password, secret, mfaCode: mfaCode.toString() });
            return { success: true };
        } catch (error) {
            console.error("Verify Signup error", error);
            const data = error.response?.data;
            const errorMessage = (typeof data === 'string' ? data : (data?.message || data?.error)) || 'Verification failed';
            return { success: false, error: errorMessage };
        }
    };

    const resetPassword = async (username, newPassword, mfaCode) => {
        try {
            await api.post('/api/auth/resetpw', { username, newPassword, mfaCode });
            return { success: true };
        } catch (error) {
            console.error("Reset password error", error);
            const data = error.response?.data;
            const errorMessage = (typeof data === 'string' ? data : (data?.message || data?.error)) || 'Reset failed';
            return { success: false, error: errorMessage };
        }
    };

    const refreshMfa = async (currentMfaCode) => {
        try {
            const response = await api.post('/api/auth/refresh-mfa', currentMfaCode, {
                headers: { 'Content-Type': 'text/plain' } // Since backend expects @RequestBody String
            });
            return { success: true, data: response.data }; // Returns newSecret, qrCodeUrl
        } catch (error) {
            console.error("Refresh MFA error", error);
            const data = error.response?.data;
            const errorMessage = (typeof data === 'string' ? data : (data?.message || data?.error)) || 'Failed to refresh MFA';
            return { success: false, error: errorMessage };
        }
    };

    const confirmMfaUpdate = async (newSecret, code) => {
        try {
            await api.post('/api/auth/confirm-mfa-update', { newSecret, code: code.toString() });
            return { success: true };
        } catch (error) {
            console.error("Confirm MFA Update error", error);
            const data = error.response?.data;
            const errorMessage = (typeof data === 'string' ? data : (data?.message || data?.error)) || 'Failed to verify MFA';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login'; // Force redirect
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signin,
            signup,
            verifySignup,
            resetPassword,
            refreshMfa,
            confirmMfaUpdate,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
