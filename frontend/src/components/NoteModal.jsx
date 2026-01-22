import { useState, useEffect } from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';
import { TiptapEditor } from './TiptapEditor'; // Correctly import the named export
import api from '../api/axios';

export const NoteModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Generate a unique key for local storage based on whether we are editing or creating
    const draftKey = `emonotes_draft_${initialData ? initialData.id : 'new'}`;

    const [loadedId, setLoadedId] = useState(null);
    const [isLoadingFullNote, setIsLoadingFullNote] = useState(false);
    const currentId = initialData ? initialData.id : 'new';

    // Load draft or initial data
    useEffect(() => {
        const loadNoteData = async () => {
            if (!initialData) {
                // Priority 3: Fresh start (New Note)
                setTitle('');
                setContent('');
                setLoadedId('new');
                return;
            }

            setIsLoadingFullNote(true);
            let fullNoteData = initialData;

            // Fetch full note data from server to get non-truncated content
            try {
                const res = await api.get(`/api/notes/get/${initialData.id}`);
                fullNoteData = res.data;
            } catch (error) {
                console.error("Failed to fetch full note details", error);
            }

            const savedDraft = localStorage.getItem(draftKey);
            let loadedFromDraft = false;

            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);

                    // Heuristic: If draft is effectively empty but we have server data, 
                    // assume the draft is corrupted/accidental and ignore it to prevent data loss appearance.
                    const isDraftEmpty = !draft.title?.trim() && !draft.content?.trim();
                    const hasServerData = fullNoteData && (fullNoteData.title?.trim() || fullNoteData.content?.trim());

                    if (!isDraftEmpty || !hasServerData) {
                        setTitle(draft.title || '');
                        setContent(draft.content || '');
                        loadedFromDraft = true;
                    }
                } catch (e) {
                    console.error("Error parsing draft", e);
                }
            }

            if (!loadedFromDraft) {
                // Priority 2: Server Data (Full)
                setTitle(fullNoteData.title || '');
                setContent(fullNoteData.content || '');
            }

            setIsLoadingFullNote(false);
            setLoadedId(currentId);
        };

        loadNoteData();
    }, [initialData, draftKey, currentId]);

    // Auto-save draft on every change
    useEffect(() => {
        if (!isOpen) return; // Don't save if closed
        if (loadedId !== currentId) return; // Don't save if we haven't loaded the current ID yet

        // Don't save if matches initial data EXACTLY (avoid spamming empty drafts)
        const initialTitle = initialData ? initialData.title : '';
        const initialContent = initialData ? initialData.content : '';

        if (title !== initialTitle || content !== initialContent) {
            localStorage.setItem(draftKey, JSON.stringify({ title, content }));
        }
    }, [title, content, isOpen, draftKey, initialData, loadedId, currentId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, content });
        // Clear draft on successful submit action (optimistic)
        localStorage.removeItem(draftKey);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/75 transition-all" onClick={onClose}>
            <div
                className="bg-surface w-full max-w-4xl sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col h-full sm:h-[85vh] scale-100 transition-transform"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 sm:p-6 border-b border-outline/10 flex justify-between items-center bg-surface-variant/10 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-on-surface">{initialData ? 'Edit Note' : 'New Note'}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant/20 text-on-surface-variant active:scale-90 transition-transform">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="px-2 pt-2 sm:px-6 sm:pt-6 pb-2">
                        <input
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl sm:text-3xl font-bold bg-transparent border-0 px-0 focus:ring-0 rounded-none border-b border-transparent focus:border-outline/50 transition-colors w-full outline-none text-on-surface placeholder-on-surface/30 pb-2"
                            required
                        />
                    </div>

                    <div className="flex-grow px-2 pb-1 sm:px-6 sm:pb-6 pt-0 overflow-hidden relative">
                        {isLoadingFullNote && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/50 backdrop-blur-sm">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <TiptapEditor
                            key={Number(isOpen) + (initialData ? initialData.id : 'new')}
                            content={content}
                            onChange={(newContent) => setContent(newContent)}
                            className="h-full"
                        />
                    </div>

                    <div className="p-2 sm:p-6 border-t border-outline/10 flex justify-end gap-3 bg-surface-variant/5">
                        <Button type="button" variant="text" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{initialData ? 'Update' : 'Save Note'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
