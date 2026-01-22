import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, CheckSquare, Quote, Code, Heading1, Heading2, RotateCcw, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const buttons = [
        {
            icon: <Bold className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive('bold'),
            title: 'Bold'
        },
        {
            icon: <Italic className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive('italic'),
            title: 'Italic'
        },
        {
            icon: <UnderlineIcon className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: editor.isActive('underline'),
            title: 'Underline'
        },
        { type: 'divider' },
        {
            icon: <Heading1 className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive('heading', { level: 1 }),
            title: 'Heading 1'
        },
        {
            icon: <Heading2 className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('heading', { level: 2 }),
            title: 'Heading 2'
        },
        { type: 'divider' },
        {
            icon: <List className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList'),
            title: 'Bullet List'
        },
        {
            icon: <ListOrdered className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('orderedList'),
            title: 'Ordered List'
        },
        {
            icon: <CheckSquare className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleTaskList().run(),
            isActive: editor.isActive('taskList'),
            title: 'Task List'
        },
        { type: 'divider' },
        {
            icon: <Quote className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editor.isActive('blockquote'),
            title: 'Quote'
        },
        {
            icon: <Code className="w-5 h-5" />,
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editor.isActive('codeBlock'),
            title: 'Code'
        },
        { type: 'divider' },
        {
            icon: <RotateCcw className="w-5 h-5" />,
            action: () => editor.chain().focus().undo().run(),
            title: 'Undo'
        },
        {
            icon: <RotateCw className="w-5 h-5" />,
            action: () => editor.chain().focus().redo().run(),
            title: 'Redo'
        },
    ];

    return (
        <div className="flex flex-nowrap items-center overflow-x-auto gap-1 p-2 bg-surface-variant/30 border-b border-outline/10 pb-4 md:pb-2 md:flex-wrap flex-shrink-0 min-h-[52px]">
            {buttons.map((btn, index) => (
                btn.type === 'divider' ? (
                    <div key={index} className="w-[1px] bg-outline/20 mx-1 my-1 flex-shrink-0" />
                ) : (
                    <button
                        key={index}
                        onClick={(e) => { e.preventDefault(); btn.action(); }}
                        className={`p-2 rounded-lg transition-all flex-shrink-0 ${btn.isActive ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}
                        title={btn.title}
                    >
                        {btn.icon}
                    </button>
                )
            ))}
        </div>
    );
};

export const TiptapEditor = ({ content, onChange, className }) => {
    // Parse initial markdown to HTML only once on mount or when completely different
    const [initialHtml, setInitialHtml] = useState(() => content ? marked.parse(content) : '');

    const [_, forceUpdate] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),

            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({
                placeholder: 'Start typing your note...',
            }),
        ],
        content: initialHtml,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const markdown = turndownService.turndown(html);
            onChange(markdown);
        },
        onTransaction: () => {
            forceUpdate(x => x + 1);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] outline-none',
            },
        },
    });

    // Handle external content updates (loading a note)
    useEffect(() => {
        if (editor && content !== undefined) {
            const currentMarkdown = turndownService.turndown(editor.getHTML());
            // Simple equality check to avoid loops. 
            // If the passed content is wildly different from current state (e.g. empty vs full, or completely diff text), update.
            // This is heuristic, but "New Note" sends "" while editor has text, so it matches.
            // "Open Note" sends "Title..." while editor has "" (or old note), so it matches.
            if (currentMarkdown.trim() !== content.trim()) {
                // Double check if we are just "typing" (content is 1 char different?)
                // Usually external updates are large.
                // Ideally we should use a key on the component to reset, but this works for re-used instances.
                const newHtml = marked.parse(content);
                editor.commands.setContent(newHtml);
            }
        }
    }, [content, editor]);

    return (
        <div className={`flex flex-col border border-outline/20 rounded-2xl bg-surface/50 overflow-hidden ${className}`}>
            <MenuBar editor={editor} />
            <div className="flex-grow overflow-y-auto custom-scrollbar p-3 sm:p-6">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};
