import React from 'react'
import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Toggle } from '@/components/ui/toggle'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Highlighter,
  Palette,
  Heading1,
  Heading2
} from 'lucide-react'

// Custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

const FONT_FAMILIES = [
  { label: 'Mặc định', value: '' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
]

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  const currentFontFamily = (editor.getAttributes('textStyle').fontFamily || "'Times New Roman', Times, serif").replace(/['"]+/g, '')
  const activeFontFamily = FONT_FAMILIES.find(f => {
    if (!f.value) return false
    const primaryFont = f.value.replace(/['"]+/g, '').split(',')[0].trim()
    return currentFontFamily.includes(primaryFont)
  })?.value || "'Times New Roman', Times, serif"

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-1 bg-muted/50 rounded-t-md">
      {/* Font Family */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            editor.chain().focus().setFontFamily(e.target.value).run()
          } else {
            editor.chain().focus().unsetFontFamily().run()
          }
        }}
        value={activeFontFamily}
        className="h-8 rounded-sm border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {FONT_FAMILIES.map(f => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Font Size */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            editor.chain().focus().setFontSize(e.target.value).run()
          } else {
            editor.chain().focus().unsetFontSize().run()
          }
        }}
        value={editor.getAttributes('textStyle').fontSize || '18px'}
        className="h-8 rounded-sm border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-16"
      >
        <option value="">Cỡ</option>
        <option value="10px">10</option>
        <option value="11px">11</option>
        <option value="12px">12</option>
        <option value="13px">13</option>
        <option value="14px">14</option>
        <option value="15px">15</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="22px">22</option>
        <option value="24px">24</option>
        <option value="30px">30</option>
        <option value="36px">36</option>
      </select>

      <div className="w-[1px] h-6 bg-border mx-1" />

      {/* Headings */}
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-label="Tiêu đề 1" title="Tiêu đề lớn (H1)">
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Tiêu đề 2" title="Tiêu đề vừa (H2)">
        <Heading2 className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] h-6 bg-border mx-1" />

      {/* Formatting */}
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} aria-label="In đậm" title="In đậm (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} aria-label="In nghiêng" title="In nghiêng (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} aria-label="Gạch dưới" title="Gạch dưới (Ctrl+U)">
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()} aria-label="Gạch ngang" title="Gạch ngang (Ctrl+Shift+S)">
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('subscript')} onPressedChange={() => editor.chain().focus().toggleSubscript().run()} aria-label="Chỉ số dưới" title="Chỉ số dưới">
        <SubscriptIcon className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('superscript')} onPressedChange={() => editor.chain().focus().toggleSuperscript().run()} aria-label="Chỉ số trên" title="Chỉ số trên">
        <SuperscriptIcon className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] h-6 bg-border mx-1" />

      {/* Alignment */}
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} aria-label="Canh trái" title="Canh trái (Ctrl+Shift+L)">
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} aria-label="Canh giữa" title="Canh giữa (Ctrl+Shift+E)">
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} aria-label="Canh phải" title="Canh phải (Ctrl+Shift+R)">
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()} aria-label="Canh đều" title="Canh đều (Ctrl+Shift+J)">
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] h-6 bg-border mx-1" />

      {/* Lists */}
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} aria-label="Danh sách chấm" title="Danh sách chấm (Ctrl+Shift+8)">
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Danh sách số" title="Danh sách số (Ctrl+Shift+7)">
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] h-6 bg-border mx-1" />

      {/* Colors */}
      <div className="flex items-center gap-1 px-1">
        <label className="flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-sm" title="Màu chữ">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <input
            type="color"
            className="w-5 h-5 p-0 border-0 cursor-pointer rounded-sm"
            onInput={event => editor.chain().focus().setColor(event.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            title="Màu chữ"
          />
        </label>

        <label className="flex items-center gap-1 cursor-pointer hover:bg-muted p-1 rounded-sm" title="Màu nền (Highlight)">
          <Highlighter className="h-4 w-4 text-muted-foreground" />
          <input
            type="color"
            className="w-5 h-5 p-0 border-0 cursor-pointer rounded-sm"
            onInput={event => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()}
            title="Màu nền (Highlight)"
          />
        </label>
      </div>
    </div>
  )
}

export function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none min-h-[200px] w-full p-4 max-w-none',
        style: 'font-family: "Times New Roman", Times, serif; font-size: 18px;',
      },
      transformPastedHTML(html) {
        return html
          .replace(/font-family\s*:[^;"]+;?/gi, '')
          .replace(/font-size\s*:[^;"]+;?/gi, '')
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  React.useEffect(() => {
    if (!editor) return

    const val = value || ''
    const currentHtml = editor.getHTML()
    const isEditorEmpty = currentHtml === '<p></p>' || currentHtml === ''

    if (val === '' && !isEditorEmpty) {
      editor.commands.setContent('')
    } else if (val !== '' && val !== currentHtml) {
      editor.commands.setContent(val)
    }
  }, [value, editor])

  return (
    <div className="border rounded-md border-input bg-background overflow-hidden flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 cursor-text" />
    </div>
  )
}
