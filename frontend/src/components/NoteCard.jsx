import { Trash2, Calendar, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export const NoteCard = ({ note, onDelete, onEdit }) => {
    const date = note.createdAt ? new Date(note.createdAt).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : 'No Date';

    // Handle various potential field names from the backend optimization
    // We check multiple common names since the exact DTO field name isn't visible, plus the confirmed 'previewContent'
    const content = note.previewContent || note.content || note.preview || note.body || note.snippet || note.text || note.truncatedContent || note.summary || '';

    return (
        <div
            onClick={() => onEdit(note)}
            className="card flex flex-col h-full bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors border border-outline/10 p-5 rounded-3xl relative group min-h-[200px] cursor-pointer"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-on-surface line-clamp-1 pr-2">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-surface rounded-full p-1 shadow-sm">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                        className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                        className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="text-on-surface-variant text-sm mb-4 line-clamp-6 flex-grow prose prose-sm dark:prose-invert pointer-events-none note-preview-markdown prose-p:my-0.5 prose-headings:my-1 prose-ul:my-1 prose-li:my-0 leading-snug">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        input: ({ type, checked }) => {
                            if (type === 'checkbox') {
                                return (
                                    <span className={`flex-shrink-0 inline-flex items-center justify-center w-4 h-4 mt-0.5 align-top rounded-[4px] border border-on-surface-variant/40 ${checked ? 'bg-primary border-primary' : 'bg-transparent'}`}>
                                        {checked && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-on-primary">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </span>
                                );
                            }
                            return null;
                        },
                        li: ({ children, className, ...props }) => {
                            // Fix alignment for task list items
                            if (className?.includes('task-list-item')) {
                                return <li className={`flex items-start gap-2 list-none ${className || ''}`} {...props}>{children}</li>
                            }
                            return <li className={className} {...props}>{children}</li>
                        },
                        p: ({ children }) => <p className="inline">{children}</p>
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
            <div className="mt-auto flex items-center text-xs text-on-surface-variant/70 gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>{date}</span>
            </div>
        </div>
    );
};
