import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useUI } from '../context/UIContext';
import QRCode from 'react-qr-code';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signin, signup, resetPassword, verifySignup } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useUI();

    // MFA Registration State
    const [mfaData, setMfaData] = useState(null); // { secret, qrCodeUrl, ... }
    const [verificationCode, setVerificationCode] = useState('');

    // Forgot Password State
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetData, setResetData] = useState({ username: '', newPassword: '', mfaCode: '' });

    const completeSignup = async () => {
        if (verificationCode.length < 6) {
            showToast("Please enter the code from your app", 'error');
            return;
        }
        setIsLoading(true);
        // Verify code to create user
        const res = await verifySignup(formData.username, formData.password, mfaData.secret, verificationCode);

        if (res.success) {
            // Now login
            const loginRes = await signin(formData.username, formData.password);
            if (loginRes.success) {
                navigate('/');
                showToast("Account verified & logged in!", 'success');
            } else {
                setIsLogin(true);
                setFormData({ username: '', password: '' });
                setMfaData(null);
                showToast("Account created! Please sign in.", 'success');
            }
        } else {
            showToast(res.error, 'error');
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await resetPassword(resetData.username, resetData.newPassword, resetData.mfaCode);
            if (res.success) {
                setIsForgotPassword(false);
                setIsLogin(true);
                setResetData({ username: '', newPassword: '', mfaCode: '' });
                showToast("Password reset successful! Please login.", 'success');
            } else {
                setError(res.error);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await signin(formData.username, formData.password);
                if (res.success) {
                    navigate('/');
                } else {
                    setError(res.error);
                }
            } else {
                res = await signup(formData.username, formData.password);
                if (res.success && res.data) {
                    // Signup success, show MFA setup
                    setMfaData(res.data);
                    showToast("Account created! Set up 2FA now.", 'info');
                } else {
                    setError(res.error || "Signup failed");
                }
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent mb-2">EmoNotes</h1>
                    <p className="text-on-surface-variant">Capture your thoughts, beautifully.</p>
                </div>

                <div className="bg-surface p-8 rounded-[32px] shadow-xl border border-outline/10">
                    <h2 className="text-2xl font-semibold mb-6 text-on-surface">
                        {mfaData ? 'Setup MFA' : isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
                    </h2>

                    {/* MFA Setup View */}
                    {mfaData ? (
                        <div className="text-center space-y-6 animate-fadeIn">
                            <div className="bg-white p-4 rounded-xl inline-block shadow-sm">
                                <QRCode
                                    value={mfaData.qrCodeUrl.startsWith('otpauth://') ? mfaData.qrCodeUrl : `otpauth://totp/EmoNotes:${formData.username}?secret=${mfaData.secret}&issuer=EmoNotes`}
                                    size={192}
                                    className="h-48 w-48"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-on-surface">Setup 2-Factor Authentication</h3>
                                <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                                    Scan this QR code with your authenticator app.
                                </p>
                            </div>

                            <div className="bg-surface-variant/10 p-4 rounded-lg text-left overflow-hidden">
                                <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Manual Entry Key</p>
                                <div
                                    className="bg-surface p-3 rounded border border-outline/10 text-primary font-mono text-center select-all cursor-pointer hover:bg-surface-variant/20 transition-colors break-all relative group"
                                    onClick={() => { navigator.clipboard.writeText(mfaData.secret); showToast('Copied!', 'success') }}
                                    title="Click to copy"
                                >
                                    {mfaData.secret}
                                    <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-xs bg-black/75 text-white px-2 py-1 rounded transition-opacity">Copy</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Verification Code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="000 000"
                                    type="number"
                                    className="text-center text-lg tracking-widest"
                                    required
                                />

                                <Button onClick={completeSignup} className="w-full" disabled={isLoading || verificationCode.length < 6}>
                                    {isLoading ? 'Verifying...' : 'Verify & Complete Signup'}
                                </Button>
                            </div>
                        </div>
                    ) : isForgotPassword ? (
                        /* Forgot Password View */
                        <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
                            <Input
                                label="Username"
                                value={resetData.username}
                                onChange={(e) => setResetData({ ...resetData, username: e.target.value })}
                                required
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={resetData.newPassword}
                                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                required
                            />

                            {/* Password Requirements for Reset */}
                            <div className="space-y-2 mb-2 p-3 bg-surface-variant/20 rounded-lg">
                                <p className="text-xs font-semibold text-on-surface-variant mb-1">Password Requirements:</p>
                                <div className="grid grid-cols-1 gap-1">
                                    <div className={`flex items-center gap-2 text-xs ${resetData.newPassword.length >= 8 ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${resetData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                        At least 8 characters
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(resetData.newPassword) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(resetData.newPassword) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                        Lowercase letter
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(resetData.newPassword) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(resetData.newPassword) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                        Uppercase letter
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(resetData.newPassword) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(resetData.newPassword) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                        Number
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${/[@#$%^&+=]/.test(resetData.newPassword) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${/[@#$%^&+=]/.test(resetData.newPassword) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                        Special char (@#$%^&+=)
                                    </div>
                                </div>
                            </div>

                            <Input
                                label="MFA Code (from App)"
                                type="number"
                                value={resetData.mfaCode}
                                onChange={(e) => setResetData({ ...resetData, mfaCode: e.target.value })}
                                placeholder="123456"
                                required
                            />

                            {error && <div className="text-red-500 text-sm bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{typeof error === 'string' ? error : 'Reset failed'}</div>}

                            <div className="flex gap-3">
                                <Button type="button" variant="text" onClick={() => { setIsForgotPassword(false); setError(null); }} className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={
                                        isLoading ||
                                        resetData.newPassword.length < 8 ||
                                        !/[a-z]/.test(resetData.newPassword) ||
                                        !/[A-Z]/.test(resetData.newPassword) ||
                                        !/[0-9]/.test(resetData.newPassword) ||
                                        !/[@#$%^&+=]/.test(resetData.newPassword)
                                    }
                                >
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        /* Standard Login/Signup Form */
                        <>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Enter your username"
                                    required
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />

                                {!isLogin && (
                                    <div className="space-y-2 mb-2 p-3 bg-surface-variant/20 rounded-lg">
                                        <p className="text-xs font-semibold text-on-surface-variant mb-1">Password Requirements:</p>
                                        <div className="grid grid-cols-1 gap-1">
                                            <div className={`flex items-center gap-2 text-xs ${formData.password.length >= 8 ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                At least 8 characters
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                Lowercase letter
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                Uppercase letter
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                Number
                                            </div>
                                            <div className={`flex items-center gap-2 text-xs ${/[@#$%^&+=]/.test(formData.password) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[@#$%^&+=]/.test(formData.password) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                Special char (@#$%^&+=)
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {error && <div className="text-red-500 text-sm bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{typeof error === 'string' ? error : 'Authentication failed'}</div>}

                                {isLogin && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => { setIsForgotPassword(true); setError(null); }}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full mt-4"
                                    disabled={
                                        isLoading ||
                                        (!isLogin && (
                                            formData.password.length < 8 ||
                                            !/[a-z]/.test(formData.password) ||
                                            !/[A-Z]/.test(formData.password) ||
                                            !/[0-9]/.test(formData.password) ||
                                            !/[@#$%^&+=]/.test(formData.password)
                                        ))
                                    }
                                >
                                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-on-surface-variant">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                                        className="text-primary font-medium hover:underline focus:outline-none"
                                    >
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
