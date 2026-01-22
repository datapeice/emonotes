import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shield, Key, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

export const Settings = () => {
    const { user, refreshMfa, confirmMfaUpdate, resetPassword } = useAuth();
    const { showToast } = useUI();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('security');

    // Change MFA State
    const [currentMfaCode, setCurrentMfaCode] = useState('');
    const [newMfaData, setNewMfaData] = useState(null); // { newSecret, qrCodeUrl }
    const [verifyNewMfaCode, setVerifyNewMfaCode] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);

    // Change Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [pwMfaCode, setPwMfaCode] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    const handleStartMfaUpdate = async (e) => {
        e.preventDefault();
        setMfaLoading(true);
        try {
            const res = await refreshMfa(currentMfaCode);
            if (res.success) {
                setNewMfaData(res.data);
                showToast("Identity verified. Scan new QR code.", 'info');
            } else {
                showToast(res.error, 'error');
            }
        } catch (error) {
            showToast("Failed to start MFA update", 'error');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleConfirmMfaUpdate = async (e) => {
        e.preventDefault();
        setMfaLoading(true);
        try {
            const res = await confirmMfaUpdate(newMfaData.newSecret, verifyNewMfaCode);
            if (res.success) {
                setNewMfaData(null);
                setCurrentMfaCode('');
                setVerifyNewMfaCode('');
                showToast("MFA successfully updated!", 'success');
            } else {
                showToast(res.error, 'error');
            }
        } catch (error) {
            showToast("Failed to confirm MFA update", 'error');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            showToast("Passwords do not match", 'error');
            return;
        }

        setPwLoading(true);
        try {
            const res = await resetPassword(user.username, newPassword, pwMfaCode);
            if (res.success) {
                setNewPassword('');
                setConfirmNewPassword('');
                setPwMfaCode('');
                showToast("Password updated successfully", 'success');
            } else {
                showToast(res.error, 'error');
            }
        } catch (error) {
            showToast("Failed to update password", 'error');
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="text" className="p-2 rounded-full" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-on-surface">Settings</h1>
                    <p className="text-on-surface-variant">Manage your account and security</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="col-span-1">
                    <div className="bg-surface rounded-2xl border border-outline/10 overflow-hidden">
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 p-4 transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface hover:bg-surface-variant/10'}`}
                        >
                            <Shield className="w-5 h-5" />
                            Security
                        </button>
                        <button
                            className="w-full flex items-center gap-3 p-4 text-on-surface-variant/50 cursor-not-allowed"
                            disabled
                        >
                            <RefreshCw className="w-5 h-5" />
                            Appearance (Coming Soon)
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-1 md:col-span-2 space-y-8">

                    {/* Security Section */}
                    {activeTab === 'security' && (
                        <>
                            {/* Update MFA Card */}
                            <section className="bg-surface p-6 rounded-2xl border border-outline/10 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-300">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-on-surface">Update 2-Factor Authentication</h2>
                                </div>

                                {!newMfaData ? (
                                    <form onSubmit={handleStartMfaUpdate} className="space-y-4">
                                        <p className="text-sm text-on-surface-variant">
                                            To assign a new MFA device, first verify your identity with your <b>current</b> authenticator code.
                                        </p>
                                        <Input
                                            label="Current MFA Code"
                                            value={currentMfaCode}
                                            onChange={(e) => setCurrentMfaCode(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            required
                                            type="number"
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={mfaLoading || currentMfaCode.length < 6}>
                                                {mfaLoading ? 'Verifying...' : 'Generate New Key'}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="border border-outline/10 rounded-xl p-4 bg-surface-variant/5 text-center">
                                            <p className="text-sm font-medium text-on-surface mb-4">Scan this NEW QR Code</p>
                                            <div className="bg-white p-2 inline-block rounded-lg mb-4">
                                                <QRCode
                                                    value={newMfaData.qrCodeUrl.startsWith('otpauth://') ? newMfaData.qrCodeUrl : `otpauth://totp/EmoNotes:${user.username}?secret=${newMfaData.newSecret}&issuer=EmoNotes`}
                                                    size={160}
                                                />
                                            </div>
                                            <p className="text-xs text-on-surface-variant font-mono select-all bg-surface-variant/20 p-2 rounded break-all">
                                                {newMfaData.newSecret}
                                            </p>
                                        </div>

                                        <form onSubmit={handleConfirmMfaUpdate} className="space-y-4">
                                            <Input
                                                label="Verify New Code"
                                                value={verifyNewMfaCode}
                                                onChange={(e) => setVerifyNewMfaCode(e.target.value)}
                                                placeholder="Enter code from NEW entry"
                                                required
                                                type="number"
                                            />
                                            <div className="flex justify-end gap-3">
                                                <Button type="button" variant="text" onClick={() => setNewMfaData(null)}>Cancel</Button>
                                                <Button type="submit" disabled={mfaLoading || verifyNewMfaCode.length < 6}>
                                                    {mfaLoading ? 'Validating...' : 'Confirm New MFA'}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </section>

                            {/* Change Password Card */}
                            <section className="bg-surface p-6 rounded-2xl border border-outline/10 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-300">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-on-surface">Change Password</h2>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="New Password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <Input
                                            label="Confirm Password"
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {newPassword && (
                                        <div className="space-y-2 mb-2 p-3 bg-surface-variant/20 rounded-lg">
                                            <p className="text-xs font-semibold text-on-surface-variant mb-1">Password Requirements:</p>
                                            <div className="grid grid-cols-1 gap-1">
                                                <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 8 ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                    At least 8 characters
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                    Number
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs ${/[@#$%^&+=]/.test(newPassword) ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${/[@#$%^&+=]/.test(newPassword) ? 'bg-green-500' : 'bg-on-surface-variant/30'}`} />
                                                    Special char (@#$%^&+=)
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-surface-variant/10 p-4 rounded-xl">
                                        <p className="text-sm font-medium mb-3 text-on-surface">Security Confirmation</p>
                                        <Input
                                            label="Enter MFA Code to Authorize"
                                            value={pwMfaCode}
                                            onChange={(e) => setPwMfaCode(e.target.value)}
                                            placeholder="000 000"
                                            required
                                            type="number"
                                            className="bg-surface"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={
                                                pwLoading ||
                                                newPassword.length < 8 ||
                                                !/[@#$%^&+=]/.test(newPassword) ||
                                                newPassword !== confirmNewPassword ||
                                                pwMfaCode.length < 6
                                            }
                                        >
                                            {pwLoading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </form>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
