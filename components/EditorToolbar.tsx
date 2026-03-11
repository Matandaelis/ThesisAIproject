import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Superscript, 
  Subscript, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Wand2,
  Maximize2,
  Minimize2,
  Loader2
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  onParaphrase?: () => void;
  onExpand?: () => void;
  onShorten?: () => void;
  isProcessing?: boolean;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors flex items-center justify-center
      ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-neutral-600 hover:bg-neutral-100'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-neutral-200 mx-1" />;

export function EditorToolbar({ editor, onParaphrase, onExpand, onShorten, isProcessing }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-2 bg-white border-b border-neutral-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
      {onParaphrase && (
        <>
          <ToolbarButton
            onClick={onParaphrase || (() => {})}
            disabled={isProcessing || editor.state.selection.empty}
            title="Paraphrase Selection"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Wand2 className="w-4 h-4 text-indigo-600" />}
          </ToolbarButton>
          <ToolbarButton
            onClick={onExpand || (() => {})}
            disabled={isProcessing || editor.state.selection.empty}
            title="Expand Selection"
          >
            <Maximize2 className="w-4 h-4 text-indigo-600" />
          </ToolbarButton>
          <ToolbarButton
            onClick={onShorten || (() => {})}
            disabled={isProcessing || editor.state.selection.empty}
            title="Shorten Selection"
          >
            <Minimize2 className="w-4 h-4 text-indigo-600" />
          </ToolbarButton>
          <Divider />
        </>
      )}

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      
      <Divider />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        disabled={!editor.can().chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive('superscript')}
      >
        <Superscript className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        disabled={!editor.can().chain().focus().toggleSubscript().run()}
        isActive={editor.isActive('subscript')}
      >
        <Subscript className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
      >
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive('taskList')}
      >
        <CheckSquare className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => {
          const url = window.prompt('URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        isActive={editor.isActive('link')}
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('Image URL');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
      >
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}
