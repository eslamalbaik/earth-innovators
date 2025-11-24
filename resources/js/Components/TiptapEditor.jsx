import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import { 
    FaBold, 
    FaItalic, 
    FaUnderline, 
    FaListUl, 
    FaListOl,
    FaHeading,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaQuoteLeft,
    FaUndo,
    FaRedo
} from 'react-icons/fa';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap items-center gap-2 rounded-t-lg">
            {/* Bold */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive('bold') ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="عريض"
            >
                <FaBold />
            </button>

            {/* Italic */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive('italic') ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="مائل"
            >
                <FaItalic />
            </button>

            {/* Underline */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive('underline') ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="تحته خط"
            >
                <FaUnderline />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300" />

            {/* Heading */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive('heading', { level: 1 }) ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="عنوان رئيسي"
            >
                <FaHeading className="text-sm" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300" />

            {/* Bullet List */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive('bulletList') ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="قائمة نقطية"
            >
                <FaListUl />
            </button>

            {/* Numbered List */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive('orderedList') ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="قائمة مرقمة"
            >
                <FaListOl />
            </button>

            {/* Blockquote */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive('blockquote') ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="اقتباس"
            >
                <FaQuoteLeft />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300" />

            {/* Text Align Left */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive({ textAlign: 'left' }) ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="محاذاة لليسار"
            >
                <FaAlignLeft />
            </button>

            {/* Text Align Center */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive({ textAlign: 'center' }) ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="محاذاة للوسط"
            >
                <FaAlignCenter />
            </button>

            {/* Text Align Right */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                    editor.isActive({ textAlign: 'right' }) ? 'bg-legacy-green/20 text-legacy-green' : 'text-gray-700'
                }`}
                title="محاذاة لليمين"
            >
                <FaAlignRight />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300" />

            {/* Undo */}
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-gray-200 transition text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="تراجع"
            >
                <FaUndo />
            </button>

            {/* Redo */}
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-gray-200 transition text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="إعادة"
            >
                <FaRedo />
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange, placeholder = 'أدخل محتوى المقال...' }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'right',
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'ProseMirror focus:outline-none min-h-[300px] p-4',
                dir: 'rtl',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <MenuBar editor={editor} />
            <EditorContent 
                editor={editor}
                className="focus-within:ring-2 focus-within:ring-legacy-green focus-within:border-legacy-green"
            />
        </div>
    );
}

