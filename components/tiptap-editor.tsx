'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import { Bold, Italic, List, ListOrdered, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export function TipTapEditor({ content, onChange, className = '' }: TipTapEditorProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isRawMode, setIsRawMode] = React.useState(false);
  const [rawMarkdown, setRawMarkdown] = React.useState(content || '');
  
  // Update raw markdown when content changes from outside
  React.useEffect(() => {
    if (!isRawMode) {
      setRawMarkdown(content || '');
    }
  }, [content, isRawMode]);

  // Global event handler for keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocused && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        // Prevent default behavior AND stop propagation
        e.preventDefault();
        e.stopPropagation();
        
        // Manually toggle bold in the editor
        if (editor) {
          editor.chain().focus().toggleBold().run();
        }
        
        return false;
      }
    };
    
    // Add to document level to catch all events
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isFocused]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: {
          HTMLAttributes: {
            class: 'font-bold'
          }
        }
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true
      })
    ],
    content: {
      type: 'doc',
      content: content ? [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] : [],
    },
    onUpdate: ({ editor }) => {
      // Use the markdown extension to get markdown content
      const markdown = editor.storage.markdown.getMarkdown();
      setRawMarkdown(markdown);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none p-4 min-h-[200px]'
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false)
  });

  // Toggle between rich text and raw markdown modes
  const toggleEditMode = () => {
    if (isRawMode && editor) {
      // When switching from raw to rich, parse the markdown content
      const content = editor.storage.markdown.parser.parse(rawMarkdown);
      editor.commands.setContent(content);
    }
    setIsRawMode(!isRawMode);
  };

  // Handle raw markdown changes
  const handleRawMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRawMarkdown(newValue);
    onChange(newValue);
  };

  if (!editor && !isRawMode) {
    return null;
  }

  const tools = [
    { 
      icon: Bold, 
      title: 'Bold',
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold') || false,
      showInRawMode: false,
    },
    { 
      icon: Italic, 
      title: 'Italic',
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic') || false,
      showInRawMode: false,
    },
    { 
      icon: List, 
      title: 'Bullet List',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList') || false,
      showInRawMode: false,
    },
    { 
      icon: ListOrdered, 
      title: 'Numbered List',
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList') || false,
      showInRawMode: false,
    },
    { 
      icon: Code, 
      title: 'Toggle Raw Markdown',
      action: toggleEditMode,
      isActive: () => isRawMode,
      showInRawMode: true,
    },
  ];

  return (
    <Card className={`min-h-[300px] ${className}`}>
      <div className="flex items-center gap-1 border-b p-2">
        <TooltipProvider>
          {tools
            .filter(tool => isRawMode ? tool.showInRawMode : true)
            .map((Tool) => (
              <Tooltip key={Tool.title}>
                <TooltipTrigger asChild>
                  <Button 
                    variant={Tool.isActive() ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={Tool.action}
                    title={Tool.title}
                  >
                    <Tool.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{Tool.title}</TooltipContent>
              </Tooltip>
            ))}
        </TooltipProvider>
      </div>
      
      {isRawMode ? (
        <Textarea
          value={rawMarkdown}
          onChange={handleRawMarkdownChange}
          className="min-h-[200px] resize-none border-none rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
          placeholder="Enter markdown here..."
        />
      ) : (
        <div className="[&_.ProseMirror]:focus-visible:outline-none [&_.ProseMirror]:focus-visible:ring-0">
          <EditorContent 
            editor={editor} 
            className="[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4" 
          />
        </div>
      )}
    </Card>
  )
} 