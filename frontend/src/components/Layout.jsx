import { Moon, Sun, LogOut, Settings } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Navigate, Outlet } from 'react-router-dom';

export const Layout = () => {
    const { user, logout, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const { showConfirm } = useUI();

    const handleLogout = () => {
        showConfirm(
            "Log Out",
            "Are you sure you want to log out?",
            () => logout()
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-on-background">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen bg-background text-on-background transition-colors duration-300 font-sans">
            <header className="sticky top-0 z-50 bg-background/95 border-b border-outline/10 px-6 py-4 flex justify-between items-center shadow-sm">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>EmoNotes</h1>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-variant/30 transition-colors text-on-surface">
                        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                    <div className="flex items-center gap-3 bg-surface-variant/30 pl-4 pr-2 py-1.5 rounded-full">
                        <span className="text-sm font-medium hidden sm:block text-on-surface-variant">
                            {user.username ? user.username : 'User'}
                        </span>
                        <button onClick={() => navigate('/settings')} className="p-1.5 rounded-full bg-surface text-on-surface hover:bg-primary/20 hover:text-primary transition-colors" title="Settings">
                            <Settings className="w-4 h-4" />
                        </button>
                        <button onClick={handleLogout} className="p-1.5 rounded-full bg-surface text-on-surface hover:bg-error hover:text-white transition-colors" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};
