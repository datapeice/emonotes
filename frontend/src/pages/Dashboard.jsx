import { useEffect, useState } from 'react';
import api from '../api/axios';
import { NoteCard } from '../components/NoteCard';
import { NoteModal } from '../components/NoteModal';
import { Button } from '../components/Button';
import { Plus } from 'lucide-react';
import { useUI } from '../context/UIContext';

export const Dashboard = () => {
    const [notes, setNotes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast, showConfirm, showAlert } = useUI();

    const [error, setError] = useState(null);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/api/notes/all');
            setNotes(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch notes", error);
            setError(error);
            showToast("Failed to fetch notes", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleCreate = async (data) => {
        try {
            await api.post('/api/notes/create', data);
            fetchNotes(); // Refresh list to get ID and Date from server
            setIsModalOpen(false);
            showToast("Note created successfully", 'success');
        } catch (error) {
            console.error("Create error", error);
            showToast("Failed to create note", 'error');
        }
    };

    const handleUpdate = async (data) => {
        if (!editingNote) return;
        try {
            await api.put(`/api/notes/update/${editingNote.id}`, data);
            fetchNotes();
            setIsModalOpen(false);
            setEditingNote(null);
            showToast("Note updated", 'success');
        } catch (error) {
            console.error("Update error", error);
            showToast("Failed to update note", 'error');
        }
    };

    const handleDelete = (id) => {
        showConfirm(
            "Delete Note",
            "Are you sure you want to delete this note? This action cannot be undone.",
            async () => {
                try {
                    await api.delete(`/api/notes/delete/${id}`);
                    setNotes(prev => prev.filter(n => n.id !== id));
                    showToast("Note deleted", 'info');
                } catch (error) {
                    console.error("Delete error", error);
                    showToast("Failed to delete note", 'error');
                }
            }
        );
    };

    const openEditModal = (note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingNote(null);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">My Notes</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Manage your ideas and tasks</p>
                </div>
                <Button onClick={openCreateModal} className="rounded-2xl pr-6 pl-5 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                    <Plus className="w-5 h-5" />
                    <span className="ml-2">New Note</span>
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
            ) : error ? (
                <div className="text-center py-20 opacity-70 flex flex-col items-center">
                    <div className="bg-red-500/10 p-6 rounded-full mb-4 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-off"><path d="m2 2 20 20" /><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193" /><path d="M21.532 16.5A4.5 4.5 0 0 0 22 15a4.5 4.5 0 0 0-4.5-4.5c-.3 0-.58.05-.85.125" /><path d="M12.556 5.556A5 5 0 0 1 12 5a7 7 0 0 1 7.226 5.707" /></svg>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Unavailable</h3>
                    <p className="max-w-md mx-auto mb-6">We couldn't load your notes. The server might be down or you are offline.</p>
                    <Button onClick={fetchNotes}>Retry Connection</Button>
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-20 opacity-50 flex flex-col items-center">
                    <div className="bg-surface-variant/20 p-6 rounded-full mb-4">
                        <Plus className="w-8 h-8 text-on-surface-variant" />
                    </div>
                    <p className="text-xl font-medium">No notes yet</p>
                    <p className="text-sm">Create your first note to get started!</p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {notes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onDelete={handleDelete}
                            onEdit={openEditModal}
                        />
                    ))}
                </div>
            )}

            <NoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingNote ? handleUpdate : handleCreate}
                initialData={editingNote}
            />
        </div>
    );
};
