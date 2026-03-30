import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, ButtonGroup, Button, Tooltip } from '@chakra-ui/react';
import { useEffect } from 'react';

const extensions = [
  StarterKit,
  Placeholder.configure({ placeholder: 'Add clinical notes…' }),
];

interface ClinicalNotesEditorProps {
  value: string | null;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <ButtonGroup size="xs" variant="ghost" spacing={0} mb={2}>
      <Tooltip label="Bold">
        <Button
          aria-label="Bold"
          fontWeight="bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          colorScheme={editor.isActive('bold') ? 'teal' : 'gray'}
        >
          B
        </Button>
      </Tooltip>
      <Tooltip label="Italic">
        <Button
          aria-label="Italic"
          fontStyle="italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          colorScheme={editor.isActive('italic') ? 'teal' : 'gray'}
        >
          I
        </Button>
      </Tooltip>
      <Tooltip label="Bullet list">
        <Button
          aria-label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          colorScheme={editor.isActive('bulletList') ? 'teal' : 'gray'}
        >
          •
        </Button>
      </Tooltip>
      <Tooltip label="Numbered list">
        <Button
          aria-label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          colorScheme={editor.isActive('orderedList') ? 'teal' : 'gray'}
        >
          1.
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
}

export function ClinicalNotesEditor({
  value,
  onChange,
  placeholder = 'Add clinical notes…',
  minHeight = '120px',
  readOnly = false,
}: ClinicalNotesEditorProps) {
  const editor = useEditor({
    extensions,
    content: value ?? '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `min-height: ${minHeight}; padding: 8px 12px;`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value ?? '', false);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      _focusWithin={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
    >
      {!readOnly && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </Box>
  );
}
