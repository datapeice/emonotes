import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '../components/Button';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);
    const [alertModal, setAlertModal] = useState(null);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const showConfirm = useCallback((title, message, onConfirm) => {
        setConfirmModal({ title, message, onConfirm });
    }, []);

    const showAlert = useCallback((title, message) => {
        setAlertModal({ title, message });
    }, []);

    const closeConfirm = () => setConfirmModal(null);
    const closeAlert = () => setAlertModal(null);

    return (
        <UIContext.Provider value={{ showToast, showConfirm, showAlert }}>
            {children}

            {/* Toasts Container */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 items-center pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border border-outline/10
                                ${toast.type === 'error' ? 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100' :
                                    toast.type === 'success' ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100' :
                                        'bg-surface-variant text-on-surface-variant'}`}
                        >
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                            <span className="font-medium text-sm">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75" onClick={closeConfirm}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-xl border border-outline/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-2 text-on-surface">{confirmModal.title}</h3>
                            <p className="text-on-surface-variant mb-6">{confirmModal.message}</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="text" onClick={closeConfirm}>Cancel</Button>
                                <Button onClick={() => { confirmModal.onConfirm(); closeConfirm(); }}>Confirm</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Alert Modal */}
            <AnimatePresence>
                {alertModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75" onClick={closeAlert}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-xl border border-outline/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                                <h3 className="text-xl font-bold text-on-surface">{alertModal.title}</h3>
                            </div>
                            <p className="text-on-surface-variant mb-6">{alertModal.message}</p>
                            <div className="flex justify-end gap-2">
                                <Button onClick={closeAlert}>OK</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
