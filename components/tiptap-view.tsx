'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'

interface TipTapViewProps {
  content: string
  className?: string
}

export function TipTapView({ content, className = '' }: TipTapViewProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: {
          HTMLAttributes: {
            class: 'font-bold'
          }
        },
        heading: {
          levels: [1, 2, 3]
        },
        hardBreak: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'my-2'
          }
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-2'
          }
        }
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
        breaks: true
      })
    ],
    content: typeof content === 'string' ? (content.startsWith('"') ? JSON.parse(content) : content) : '',
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none p-4'
      }
    }
  });

  // Update editor content when content prop changes
  React.useEffect(() => {
    if (editor && content !== undefined) {
      try {
        const parsedContent = content.startsWith('"') ? JSON.parse(content) : content;
        // Only update if content actually changed
        if (editor.storage.markdown.getMarkdown() !== parsedContent) {
          editor.commands.setContent(parsedContent);
        }
      } catch (e) {
        console.error('Error parsing content:', e);
        editor.commands.setContent('');
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`[&_.ProseMirror]:focus-visible:outline-none [&_.ProseMirror]:focus-visible:ring-0 ${className}`}>
      <EditorContent 
        editor={editor} 
        className="[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2" 
      />
    </div>
  )
} 