'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

// Improved function to convert HTML to Markdown
function htmlToMarkdown(html: string): string {
  if (!html) return '';
  
  // Replace bold tags
  let markdown = html.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  
  // Replace italic tags
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  
  // Handle lists more carefully
  // Process unordered lists
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/g, function(match, listContent) {
    // Process each list item with proper indentation and line breaks
    return listContent.replace(/<li>([\s\S]*?)<\/li>/g, function(match, itemContent) {
      return `- ${itemContent.trim()}\n`;
    });
  });
  
  // Process ordered lists
  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/g, function(match, listContent) {
    let index = 1;
    return listContent.replace(/<li>([\s\S]*?)<\/li>/g, function(match, itemContent) {
      return `${index++}. ${itemContent.trim()}\n`;
    });
  });
  
  // Replace paragraphs (must be after lists to prevent nested paragraph issues)
  markdown = markdown.replace(/<p>([\s\S]*?)<\/p>/g, '$1\n\n');
  
  // Clean up any remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Fix double spaces
  markdown = markdown.replace(/\s+/g, ' ');
  
  // Fix multiple newlines
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Clean up extra whitespace
  markdown = markdown.trim();
  
  return markdown;
}

export function TipTapEditor({ content, onChange, className = '' }: TipTapEditorProps) {
  const [isFocused, setIsFocused] = React.useState(false);

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
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      // Get HTML content and convert to Markdown
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none p-4 min-h-[200px]'
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false)
  })

  if (!editor) {
    return null
  }

  const tools = [
    { 
      icon: Bold, 
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold')
    },
    { 
      icon: Italic, 
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic')
    },
    { 
      icon: List, 
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList')
    },
    { 
      icon: ListOrdered, 
      title: 'Numbered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList')
    },
  ]

  return (
    <Card className={`min-h-[300px] ${className}`}>
      <div className="flex items-center gap-1 border-b p-2">
        <TooltipProvider>
          {tools.map((Tool) => (
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
      <div className="[&_.ProseMirror]:focus-visible:outline-none [&_.ProseMirror]:focus-visible:ring-0">
        <EditorContent 
          editor={editor} 
          className="[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4" 
        />
      </div>
    </Card>
  )
} 