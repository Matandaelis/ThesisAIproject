'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Mark, mergeAttributes } from '@tiptap/core';
import { useState, useEffect, useMemo } from 'react';
import { Sparkles, BookOpen, Download, Share2, MessageSquare, GripVertical, Search, Loader2, Folder, Tag, ListTree, ChevronRight, ChevronDown, FileText, CheckCircle2, LayoutTemplate, Link as LinkIcon, Menu, X, ShieldAlert, Wand2, Quote, Languages, SpellCheck, Minimize2, Settings, Briefcase, Lightbulb, PenTool, Microscope, GraduationCap, Plus, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { EditorToolbar } from './EditorToolbar';
import { GoogleGenAI } from '@google/genai';
import dynamic from 'next/dynamic';
import 'react-latex-editor/styles';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LatexEditor = dynamic(
  () => import('react-latex-editor').then((mod) => mod.Editor),
  { ssr: false }
);

type Citation = {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: 'manual' | 'zotero' | 'mendeley' | 'search';
  link?: string;
  snippet?: string;
  notes?: string;
};

type OutlineItem = {
  id: string;
  level: number;
  text: string;
  pos: number;
  tags?: string[];
};

function SortableOutlineItem({ item, editor, onAddTag, onRemoveTag, hasChildren, isCollapsed, onToggle }: { item: OutlineItem, editor: any, onAddTag: (id: string, tag: string) => void, onRemoveTag: (id: string, tag: string) => void, hasChildren: boolean, isCollapsed: boolean, onToggle: (id: string, e: React.MouseEvent) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${(item.level - 1) * 1 + 0.5}rem`,
    paddingRight: '0.5rem'
  };

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  return (
    <div ref={setNodeRef} style={style} className="group flex flex-col gap-1 py-1.5 hover:bg-neutral-100 rounded-md text-sm text-neutral-600 transition-colors">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-200 rounded text-neutral-400">
          <GripVertical className="w-3 h-3" />
        </div>
        <div 
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => {
            if (editor) {
              editor.commands.focus();
              editor.commands.setTextSelection(item.pos);
              setTimeout(() => {
                const domNode = editor.view.nodeDOM(item.pos) as HTMLElement;
                if (domNode && domNode.scrollIntoView) {
                  domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 50);
            }
          }}
        >
          {hasChildren ? (
            <button onClick={(e) => onToggle(item.id, e)} className="p-0.5 hover:bg-neutral-200 rounded text-neutral-500">
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          ) : item.level === 1 ? (
            <Folder className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          )}
          <span className={`truncate ${item.level === 1 ? 'font-medium text-neutral-800' : ''}`}>
            {item.text || 'Untitled Section'}
          </span>
        </div>
        <button 
          onClick={() => setIsAddingTag(true)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 rounded text-neutral-400 transition-opacity"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      {(item.tags && item.tags.length > 0 || isAddingTag) && (
        <div className="flex flex-wrap gap-1 pl-8 pr-2">
          {item.tags?.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] rounded border border-neutral-200">
              #{tag}
              <button onClick={() => onRemoveTag(item.id, tag)} className="hover:text-red-500">&times;</button>
            </span>
          ))}
          {isAddingTag && (
            <input
              autoFocus
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newTag.trim()) {
                  onAddTag(item.id, newTag.trim());
                  setNewTag('');
                  setIsAddingTag(false);
                } else if (e.key === 'Escape') {
                  setIsAddingTag(false);
                  setNewTag('');
                }
              }}
              onBlur={() => {
                if (newTag.trim()) {
                  onAddTag(item.id, newTag.trim());
                }
                setIsAddingTag(false);
                setNewTag('');
              }}
              className="px-1.5 py-0.5 text-[10px] border border-indigo-300 rounded outline-none focus:ring-1 focus:ring-indigo-500 w-16"
              placeholder="tag..."
            />
          )}
        </div>
      )}
    </div>
  );
}

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return { id: attributes.id };
        },
      },
      tags: {
        default: [],
        parseHTML: element => {
          const tagsAttr = element.getAttribute('data-tags');
          return tagsAttr ? JSON.parse(tagsAttr) : [];
        },
        renderHTML: attributes => {
          if (!attributes.tags || attributes.tags.length === 0) {
            return {};
          }
          return { 'data-tags': JSON.stringify(attributes.tags) };
        },
      },
    };
  },
});

const CitationMark = Mark.create({
  name: 'citation',
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'citation-highlight cursor-pointer bg-indigo-100 text-indigo-800 rounded px-1 hover:bg-indigo-200 transition-colors',
      },
    }
  },
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-citation-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-citation-id': attributes.id,
          }
        },
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span[data-citation-id]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
});

const getTemplateClasses = (template: string) => {
  switch (template) {
    case 'Harvard University': return '[&_.ProseMirror]:font-serif [&_.ProseMirror]:leading-loose [&_.ProseMirror_h1]:text-red-900 [&_.ProseMirror_h2]:text-red-900 [&_.ProseMirror_p]:text-justify';
    case 'Stanford University': return '[&_.ProseMirror]:font-sans [&_.ProseMirror]:leading-relaxed [&_.ProseMirror_h1]:text-red-800 [&_.ProseMirror_h2]:text-red-800';
    case 'MIT Thesis': return '[&_.ProseMirror]:font-mono [&_.ProseMirror]:leading-normal [&_.ProseMirror_h1]:uppercase [&_.ProseMirror_h2]:uppercase [&_.ProseMirror_h1]:tracking-widest';
    case 'Oxford Style': return '[&_.ProseMirror]:font-serif [&_.ProseMirror]:leading-loose [&_.ProseMirror_h1]:text-blue-900 [&_.ProseMirror_h2]:text-blue-900 [&_.ProseMirror_h1]:font-normal';
    default: return '[&_.ProseMirror]:font-serif [&_.ProseMirror]:leading-relaxed';
  }
};

export default function ThesisEditor({ documentId }: { documentId: string }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // UI State
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' | 'info' } | null>(null);
  const [modal, setModal] = useState<{ title: string, content: string } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showCitationPanel, setShowCitationPanel] = useState(false);
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  const [showLatexPanel, setShowLatexPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showToolkitPanel, setShowToolkitPanel] = useState(false);
  const [showOutlinePanel, setShowOutlinePanel] = useState(true);
  const [isGeneratingAbstract, setIsGeneratingAbstract] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isCheckingAcademic, setIsCheckingAcademic] = useState(false);
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const [isGeneratingCitation, setIsGeneratingCitation] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGrammarChecking, setIsGrammarChecking] = useState(false);
  const [zoteroConnected, setZoteroConnected] = useState(false);
  const [mendeleyConnected, setMendeleyConnected] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Standard Academic');
  const [highlightedCitationId, setHighlightedCitationId] = useState<string | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const visibleOutline = useMemo(() => {
    const visible: OutlineItem[] = [];
    let hiddenLevel: number | null = null;

    for (const item of outline) {
      if (hiddenLevel !== null && item.level > hiddenLevel) {
        continue; // Skip items under a collapsed parent
      } else {
        hiddenLevel = null; // Reset when we reach a sibling or higher level
      }

      visible.push(item);

      if (collapsedSections.has(item.id)) {
        hiddenLevel = item.level;
      }
    }
    return visible;
  }, [outline, collapsedSections]);
  
  // Research Assistant State
  const [researchTab, setResearchTab] = useState<'chat' | 'scholar'>('chat');
  const [researchQuery, setResearchQuery] = useState('');
  const [researchMessages, setResearchMessages] = useState<{role: 'user' | 'assistant', content: string, urls?: string[]}[]>([
    { role: 'assistant', content: "Hi! I'm your AI Research Assistant. You can ask me to find papers, summarize topics, or explain concepts related to your thesis." }
  ]);
  const [isResearching, setIsResearching] = useState(false);
  
  // Scholar Search State
  const [scholarQuery, setScholarQuery] = useState('');
  const [scholarResults, setScholarResults] = useState<any[]>([]);
  const [isSearchingScholar, setIsSearchingScholar] = useState(false);
  const [scholarError, setScholarError] = useState('');
  
  // Scholar Profile State
  const [showScholarProfileModal, setShowScholarProfileModal] = useState(false);
  const [scholarAuthorId, setScholarAuthorId] = useState('');
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileArticles, setProfileArticles] = useState<any[]>([]);
  const [profileError, setProfileError] = useState('');
  const [isSyncingCitations, setIsSyncingCitations] = useState(false);
  const [citationSearchQuery, setCitationSearchQuery] = useState('');
  const [citationSortBy, setCitationSortBy] = useState<'year' | 'author' | 'title'>('year');
  const [editingCitationId, setEditingCitationId] = useState<string | null>(null);
  const [editCitationForm, setEditCitationForm] = useState<{ title: string, authors: string, year: string, link?: string, notes?: string }>({ title: '', authors: '', year: '', link: '', notes: '' });
  
  // LaTeX Editor State
  const [latexContent, setLatexContent] = useState('<p>Write your math equations here...</p>');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = outline.findIndex((item) => item.id === active.id);
      const newIndex = outline.findIndex((item) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1 && editor) {
        const oldItem = outline[oldIndex];
        const newItem = outline[newIndex];
        
        // Find the end position of the old section
        let oldEndPos = editor.state.doc.content.size;
        for (let i = oldIndex + 1; i < outline.length; i++) {
          if (outline[i].level <= oldItem.level) {
            oldEndPos = outline[i].pos;
            break;
          }
        }

        // Find the end position of the new section (where we want to insert)
        let insertPos = newItem.pos;
        if (newIndex > oldIndex) {
          // Moving down: insert after the target section
          for (let i = newIndex + 1; i < outline.length; i++) {
            if (outline[i].level <= newItem.level) {
              insertPos = outline[i].pos;
              break;
            }
          }
          if (insertPos === newItem.pos) {
            insertPos = editor.state.doc.content.size;
          }
        }

        // Extract the slice
        const slice = editor.state.doc.slice(oldItem.pos, oldEndPos);
        
        if (insertPos >= oldItem.pos && insertPos <= oldEndPos) {
          return; // Cannot move inside itself
        }

        editor.commands.command(({ tr }) => {
          // If moving down, we need to adjust insertPos because we are deleting before it
          let finalInsertPos = insertPos;
          if (newIndex > oldIndex) {
            finalInsertPos -= (oldEndPos - oldItem.pos);
          }
          
          tr.delete(oldItem.pos, oldEndPos);
          tr.insert(finalInsertPos, slice.content);
          return true;
        });
      }
    }
  };

  const handleAddTag = (id: string, tag: string) => {
    if (!editor) return;
    
    const item = outline.find(i => i.id === id);
    if (item) {
      const currentTags = item.tags || [];
      if (!currentTags.includes(tag)) {
        const newTags = [...currentTags, tag];
        editor.commands.command(({ tr }) => {
          const node = tr.doc.nodeAt(item.pos);
          if (node) {
            tr.setNodeMarkup(item.pos, undefined, { ...node.attrs, tags: newTags });
            return true;
          }
          return false;
        });
      }
    }
  };

  const handleRemoveTag = (id: string, tag: string) => {
    if (!editor) return;
    
    const item = outline.find(i => i.id === id);
    if (item) {
      const currentTags = item.tags || [];
      const newTags = currentTags.filter(t => t !== tag);
      editor.commands.command(({ tr }) => {
        const node = tr.doc.nodeAt(item.pos);
        if (node) {
          tr.setNodeMarkup(item.pos, undefined, { ...node.attrs, tags: newTags });
          return true;
        }
        return false;
      });
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowOutlinePanel(false);
      } else {
        setShowOutlinePanel(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Citation Management State
  const [citations, setCitations] = useState<Citation[]>([
    { 
      id: '1', 
      title: 'Machine learning', 
      authors: 'ZH Zhou', 
      year: '2021', 
      source: 'search',
      link: 'https://books.google.com/books?hl=en&lr=&id=ctM-EAAAQBAJ&oi=fnd&pg=PR6&dq=machine+learning&ots=o_OoX3Vx_t&sig=1DuT97LT8ZukXPk09u8CFJo4vWs',
      snippet: '... from data is called learning or training. The ... machine learning is to find or approximate ground-truth. In this book, models are sometimes called learners, which are machine learning ...'
    },
    {
      id: '2',
      title: 'Electromagnetic Energy Harvesting for Wireless Sensor Networks: Power Management and Conditioning for Sensors with Long Acquisition Times',
      authors: 'George C. Knowlden',
      year: '2016',
      source: 'manual'
    }
  ]);
  const [citationStyle, setCitationStyle] = useState('APA');
  const [showAddCitation, setShowAddCitation] = useState(false);
  const [newCitation, setNewCitation] = useState<{ title: string, authors: string, year: string, link?: string, snippet?: string }>({ title: '', authors: '', year: '' });
  const [isSearchingManualCitation, setIsSearchingManualCitation] = useState(false);
  const [manualScholarResults, setManualScholarResults] = useState<any[]>([]);
  const [manualScholarError, setManualScholarError] = useState('');

  const filteredAndSortedCitations = useMemo(() => {
    let result = [...citations];
    
    if (citationSearchQuery.trim()) {
      const query = citationSearchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.authors.toLowerCase().includes(query) ||
        c.year.includes(query)
      );
    }
    
    result.sort((a, b) => {
      if (citationSortBy === 'year') {
        // Descending year
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
      } else if (citationSortBy === 'author') {
        return a.authors.localeCompare(b.authors);
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    
    return result;
  }, [citations, citationSearchQuery, citationSortBy]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      CustomHeading,
      CitationMark,
      Placeholder.configure({
        placeholder: 'Start writing your thesis...',
      }),
      CharacterCount,
      Highlight,
      Typography,
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      Color,
    ],
    content: `
      <h1>Impact of AI on Education</h1>
      <p>Artificial Intelligence (AI) is rapidly transforming the educational landscape...</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[calc(100vh-12rem)]',
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        const citationId = target.getAttribute('data-citation-id') || target.closest('[data-citation-id]')?.getAttribute('data-citation-id');
        if (citationId) {
          setShowCitationPanel(true);
          setHighlightedCitationId(citationId);
          setTimeout(() => {
            const el = document.getElementById(`citation-${citationId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          return true;
        }
        setHighlightedCitationId(null);
        return false;
      }
    },
    onCreate: ({ editor }) => {
      const items: OutlineItem[] = [];
      let needsUpdate = false;
      
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          let id = node.attrs.id;
          if (!id) {
            id = `heading-${Math.random().toString(36).substr(2, 9)}`;
            needsUpdate = true;
            setTimeout(() => {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
                return true;
              });
            }, 0);
          }
          items.push({
            id,
            level: node.attrs.level,
            text: node.textContent,
            pos,
            tags: node.attrs.tags || [],
          });
        }
      });
      setOutline(items);
    },
    onUpdate: ({ editor }) => {
      const items: OutlineItem[] = [];
      
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          let id = node.attrs.id;
          if (!id) {
            id = `heading-${Math.random().toString(36).substr(2, 9)}`;
            setTimeout(() => {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
                return true;
              });
            }, 0);
          }
          items.push({
            id,
            level: node.attrs.level,
            text: node.textContent,
            pos,
            tags: node.attrs.tags || [],
          });
        }
      });
      setOutline(items);
    },
  });

  const generateAbstract = async () => {
    if (!editor) return;
    
    setIsGeneratingAbstract(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const documentContent = editor.getText();
      
      const prompt = `Write a research paper abstract based on the provided document. The abstract should be approximately 200-750 words and accurately summarize the document's main topic, research questions or objectives, methodology, key findings, and the significance or implications of the research. Return the response in HTML format, using appropriate tags like <p>, <strong>, <em>.\n\nDocument:\n${documentContent}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        // Strip markdown code block if present
        const htmlContent = response.text.replace(/```html/g, '').replace(/```/g, '').trim();
        // Insert the abstract at the beginning of the document
        editor.chain().focus().insertContentAt(0, `<h2>Abstract</h2>${htmlContent}<hr>`).run();
      }
    } catch (error) {
      console.error('Failed to generate abstract:', error);
      showToast('Failed to generate abstract. Please try again.', 'error');
    } finally {
      setIsGeneratingAbstract(false);
    }
  };

  const generateOutline = async () => {
    if (!editor) return;
    
    setIsGeneratingOutline(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const documentContent = editor.getText();
      
      const prompt = `Create a detailed outline for an academic thesis using the provided document. The outline should include standard sections such as Introduction, Literature Review, Methodology, Results, Discussion, and Conclusion, with suggested sub-points for each section based on the document's content. Return the response in HTML format, using appropriate tags like <h2>, <h3>, <ul>, <li>.\n\nDocument:\n${documentContent}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        // Strip markdown code block if present
        const htmlContent = response.text.replace(/```html/g, '').replace(/```/g, '').trim();
        editor.chain().focus().insertContentAt(editor.state.selection.to, `<h2>Proposed Outline</h2>${htmlContent}<hr>`).run();
      }
    } catch (error) {
      console.error('Failed to generate outline:', error);
      showToast('Failed to generate outline. Please try again.', 'error');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const checkAcademicTone = async () => {
    if (!editor) return;
    
    setIsCheckingAcademic(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const documentContent = editor.getText();
      
      const prompt = `Act as an Academic Checker tool. Review the following text and flag potential issues such as passive voice, wordiness, and weak verbs. Offer specific suggestions for improvement.\n\nText:\n${documentContent}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setModal({ title: "Academic Check Results", content: response.text });
      }
    } catch (error) {
      console.error('Failed to check academic tone:', error);
      showToast('Failed to check academic tone. Please try again.', 'error');
    } finally {
      setIsCheckingAcademic(false);
    }
  };

  const paraphraseSelection = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      showToast("Please select some text to paraphrase.", 'info');
      return;
    }

    setIsParaphrasing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Paraphrase the following sentence to improve sentence structure and academic tone:\n\n${text}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        editor.chain().focus().insertContent(response.text).run();
      }
    } catch (error) {
      console.error('Failed to paraphrase:', error);
      showToast('Failed to paraphrase. Please try again.', 'error');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const expandText = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      showToast("Please select some text to expand.", 'info');
      return;
    }

    setIsParaphrasing(true); // Reusing the loading state for simplicity
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const documentContent = editor.getText();
      
      const prompt = `Act as an academic writing assistant. Expand the following selected text, adding more detail, academic context, and depth. Maintain the original meaning but make it more comprehensive.\n\nSelected Text:\n${text}\n\nContext (for reference):\n${documentContent}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        editor.chain().focus().insertContent(response.text).run();
      }
    } catch (error) {
      console.error('Failed to expand text:', error);
      showToast('Failed to expand text. Please try again.', 'error');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const shortenText = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      showToast("Please select some text to shorten.", 'info');
      return;
    }

    setIsParaphrasing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Act as an academic writing assistant. Shorten and make the following text more concise and punchy, while retaining the core academic meaning.\n\nText:\n${text}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        editor.chain().focus().insertContent(response.text).run();
      }
    } catch (error) {
      console.error('Failed to shorten text:', error);
      showToast('Failed to shorten text. Please try again.', 'error');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const summarizeText = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      showToast("Please select some text to summarize.", 'info');
      return;
    }

    setIsParaphrasing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Act as an academic writing assistant. Provide a brief, one-sentence summary of the following text.\n\nText:\n${text}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setModal({ title: "Summary", content: response.text });
      }
    } catch (error) {
      console.error('Failed to summarize text:', error);
      showToast('Failed to summarize text. Please try again.', 'error');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const checkPlagiarism = async () => {
    if (!editor) return;

    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    const textToCheck = selectedText || editor.getText();

    if (!textToCheck.trim()) {
      showToast("Please add some text to check for plagiarism.", 'info');
      return;
    }

    setIsCheckingPlagiarism(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      const prompt = `Act as an academic plagiarism detection service. Analyze the following text for potential plagiarism. Use Google Search to check if these exact phrases or highly similar ones exist on the web. Provide a detailed plagiarism report including an estimated "Similarity Score" (percentage), highlight potentially plagiarized passages, and list the original source URLs.\n\nText to check:\n"${textToCheck}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      if (response.text) {
        setModal({ title: "Plagiarism Report", content: response.text });
      }
    } catch (error) {
      console.error('Failed to check plagiarism:', error);
      showToast('Failed to check plagiarism. Please try again.', 'error');
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  const autocompleteText = async () => {
    if (!editor) return;
    
    setIsAutocompleting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const documentContent = editor.getText();
      
      const prompt = `Act as an AI writing assistant (like Jenni AI). Continue the following academic text naturally, maintaining the academic tone and context. Write about 2-3 sentences. Return ONLY the continuation text, do not repeat the existing text.\n\nText:\n${documentContent}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        editor.chain().focus().insertContent(' ' + response.text.trim()).run();
      }
    } catch (error) {
      console.error('Failed to autocomplete:', error);
      showToast('Failed to autocomplete. Please try again.', 'error');
    } finally {
      setIsAutocompleting(false);
    }
  };

  const summarizeSelection = async () => {
    if (!editor) return;
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      showToast("Please select text to summarize.", 'info');
      return;
    }
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `Summarize the following academic text concisely:\n\n${text}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      if (response.text) {
        editor.chain().focus().insertContent(response.text).run();
      }
    } catch (error) {
      console.error('Failed to summarize:', error);
      showToast('Failed to summarize text.', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  const translateSelection = async () => {
    if (!editor) return;
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      showToast("Please select text to translate.", 'info');
      return;
    }
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `Translate the following academic text to English (if it's not) or to French (if it is English), maintaining academic tone:\n\n${text}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      if (response.text) {
        editor.chain().focus().insertContent(response.text).run();
      }
    } catch (error) {
      console.error('Failed to translate:', error);
      showToast('Failed to translate text.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const checkGrammar = async () => {
    if (!editor) return;
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    const contentToProcess = text || editor.getText();
    
    if (!contentToProcess) {
      showToast("The document is empty.", 'info');
      return;
    }
    
    setIsGrammarChecking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `Review the following academic text for grammar, spelling, and punctuation errors. Provide a corrected version of the text. If there are no errors, return the original text.\n\nText:\n${contentToProcess}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      if (response.text) {
        if (text) {
          editor.chain().focus().insertContent(response.text).run();
        } else {
          editor.commands.setContent(response.text);
        }
      }
    } catch (error) {
      console.error('Failed to check grammar:', error);
      showToast('Failed to check grammar.', 'error');
    } finally {
      setIsGrammarChecking(false);
    }
  };

  const generateCitation = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      showToast("Please select a claim or sentence to generate a citation for.", 'info');
      return;
    }

    setIsGeneratingCitation(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Act as an academic research assistant. Find a real, credible academic source that supports or relates to the following claim. Return the result as a JSON object with the following keys: "title", "authors" (e.g., "Smith et al."), "year", and "formatted" (the in-text citation, e.g., "Smith et al., 2023"). Return ONLY the JSON object, without markdown formatting.\n\nClaim:\n${text}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      if (response.text) {
        try {
          const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const data = JSON.parse(jsonStr);
          const newId = Date.now().toString();
          const newCit: Citation = {
            id: newId,
            title: data.title || 'Unknown Title',
            authors: data.authors || 'Unknown Authors',
            year: data.year || new Date().getFullYear().toString(),
            source: 'search'
          };
          setCitations(prev => [...prev, newCit]);
          editor.chain().focus().insertContent(` <span data-citation-id="${newId}">(${data.formatted || data.authors + ', ' + data.year})</span> `).run();
        } catch (e) {
          // Fallback if JSON parsing fails
          editor.chain().focus().insertContent(` (${response.text.trim()})`).run();
        }
      }
    } catch (error) {
      console.error('Failed to generate citation:', error);
      showToast('Failed to generate citation. Please try again.', 'error');
    } finally {
      setIsGeneratingCitation(false);
    }
  };

  const [isToolkitLoading, setIsToolkitLoading] = useState(false);

  const handleToolkitAction = async (actionName: string, promptTemplate: string) => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    const documentContent = editor.getText();
    
    const context = selectedText ? `Selected text:\n${selectedText}` : `Full document:\n${documentContent}`;
    
    if (!selectedText && !documentContent) {
      showToast("The document is empty. Please add some content first.", 'info');
      return;
    }

    setIsToolkitLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `${promptTemplate}\n\nContext:\n${context}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      if (response.text) {
        setModal({ title: actionName, content: response.text });
      }
    } catch (error) {
      console.error(`Failed to execute ${actionName}:`, error);
      showToast(`Failed to execute ${actionName}. Please try again.`, 'error');
    } finally {
      setIsToolkitLoading(false);
    }
  };

  const handleChatWithCitation = (citation: Citation) => {
    setShowResearchPanel(true);
    setResearchTab('chat');
    const prompt = `Let's discuss the paper "${citation.title}" by ${citation.authors} (${citation.year}). Can you summarize its main contributions and explain how it might relate to my thesis?`;
    handleResearchQuery(prompt);
  };

  const handleScholarSearch = async () => {
    if (!scholarQuery.trim() || isSearchingScholar) return;
    
    setIsSearchingScholar(true);
    setScholarError('');
    
    try {
      const response = await fetch(`/api/scholar?q=${encodeURIComponent(scholarQuery)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch from OpenAlex');
      }
      
      if (data.organic_results) {
        setScholarResults(data.organic_results);
      } else {
        setScholarResults([]);
      }
    } catch (error: any) {
      console.error('Scholar search error:', error);
      setScholarError(error.message || 'An error occurred while searching OpenAlex.');
    } finally {
      setIsSearchingScholar(false);
    }
  };

  const handleResearchQuery = async (queryOverride?: string | React.MouseEvent) => {
    const queryToUse = typeof queryOverride === 'string' ? queryOverride : researchQuery;
    if (!queryToUse.trim() || isResearching) return;
    
    const userMessage = { role: 'user' as const, content: queryToUse };
    setResearchMessages(prev => [...prev, userMessage]);
    if (!queryOverride) setResearchQuery('');
    setIsResearching(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const documentContent = editor?.getText() || '';
      
      const prompt = `You are an AI Research Assistant helping a student write their thesis. 
Here is the current content of their document for context:
---
${documentContent}
---

The user has asked the following question or request:
"${userMessage.content}"

Please provide a helpful, academic response. If they ask for sources, use the Google Search tool to find credible academic sources.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      
      let urls: string[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            urls.push(chunk.web.uri);
          }
        });
      }
      
      setResearchMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text || 'Sorry, I could not find an answer.',
        urls: urls.length > 0 ? Array.from(new Set(urls)) : undefined
      }]);
    } catch (error) {
      console.error('Research query failed:', error);
      setResearchMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred while researching. Please try again.' }]);
    } finally {
      setIsResearching(false);
    }
  };

  const handleConnectZotero = () => {
    if (!zoteroConnected) {
      setCitations(prev => [...prev, { id: 'z1', title: 'Deep Learning', authors: 'LeCun, Bengio, Hinton', year: '2015', source: 'zotero' }]);
    } else {
      setCitations(prev => prev.filter(c => c.source !== 'zotero'));
    }
    setZoteroConnected(!zoteroConnected);
  };

  const handleConnectMendeley = () => {
    if (!mendeleyConnected) {
      setCitations(prev => [...prev, { id: 'm1', title: 'Generative Adversarial Nets', authors: 'Goodfellow et al.', year: '2014', source: 'mendeley' }]);
    } else {
      setCitations(prev => prev.filter(c => c.source !== 'mendeley'));
    }
    setMendeleyConnected(!mendeleyConnected);
  };

  const handleFetchScholarProfile = async () => {
    if (!scholarAuthorId.trim()) return;
    setIsFetchingProfile(true);
    setProfileError('');
    try {
      const res = await fetch(`/api/scholar/profile?id=${encodeURIComponent(scholarAuthorId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
      if (data.articles) {
        setProfileArticles(data.articles);
      } else {
        setProfileArticles([]);
        setProfileError('No articles found for this author ID.');
      }
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleImportProfileArticle = (article: any) => {
    const newCit: Citation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title: article.title,
      authors: article.authors || 'Unknown',
      year: article.year || new Date().getFullYear().toString(),
      source: 'search',
      link: article.link
    };
    setCitations(prev => {
      // Prevent duplicates
      if (prev.some(c => c.title === newCit.title)) return prev;
      return [...prev, newCit];
    });
    showToast('Citation imported successfully!', 'success');
  };

  const handleSyncCitations = async () => {
    if (!zoteroConnected && !mendeleyConnected && !scholarAuthorId) {
      showToast('Please connect an account (Zotero, Mendeley, or OpenAlex) to sync citations.', 'error');
      return;
    }

    setIsSyncingCitations(true);
    
    try {
      // Simulate network request for syncing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newCitations: Citation[] = [];
      
      if (zoteroConnected) {
        newCitations.push({ id: 'z2', title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: '2017', source: 'zotero' });
        newCitations.push({ id: 'z3', title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', authors: 'Devlin et al.', year: '2018', source: 'zotero' });
      }
      
      if (mendeleyConnected) {
        newCitations.push({ id: 'm2', title: 'Adam: A Method for Stochastic Optimization', authors: 'Kingma, Ba', year: '2014', source: 'mendeley' });
      }
      
      if (scholarAuthorId && profileArticles.length > 0) {
        // Automatically import top 3 articles from profile if fetched
        profileArticles.slice(0, 3).forEach(article => {
          newCitations.push({
            id: 's_' + Math.random().toString(36).substr(2, 5),
            title: article.title,
            authors: article.authors || 'Unknown',
            year: article.year || new Date().getFullYear().toString(),
            source: 'search',
            link: article.link
          });
        });
      }
      
      if (newCitations.length > 0) {
        let addedCount = 0;
        setCitations(prev => {
          const existingTitles = new Set(prev.map(c => c.title));
          const toAdd = newCitations.filter(c => !existingTitles.has(c.title));
          addedCount = toAdd.length;
          return [...prev, ...toAdd];
        });
        
        if (addedCount > 0) {
          showToast(`Synced ${addedCount} new citations from connected accounts.`, 'success');
        } else {
          showToast('Library is already up to date.', 'success');
        }
      } else {
        showToast('Library is already up to date.', 'success');
      }
    } catch (error) {
      showToast('Failed to sync citations.', 'error');
    } finally {
      setIsSyncingCitations(false);
    }
  };

  const handleAddCitation = () => {
    if (newCitation.title && newCitation.authors) {
      setCitations(prev => [...prev, { id: Date.now().toString(), ...newCitation, source: 'manual' }]);
      setNewCitation({ title: '', authors: '', year: '' });
      setShowAddCitation(false);
      setManualScholarResults([]);
    }
  };

  const handleManualScholarSearch = async () => {
    if (!newCitation.title.trim() || isSearchingManualCitation) return;
    
    setIsSearchingManualCitation(true);
    setManualScholarError('');
    setManualScholarResults([]);
    
    try {
      const response = await fetch(`/api/scholar?q=${encodeURIComponent(newCitation.title)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch from OpenAlex');
      }
      
      if (data.organic_results) {
        setManualScholarResults(data.organic_results.slice(0, 5));
      } else {
        setManualScholarResults([]);
      }
    } catch (error: any) {
      console.error('Scholar search error:', error);
      setManualScholarError(error.message || 'An error occurred while searching OpenAlex.');
    } finally {
      setIsSearchingManualCitation(false);
    }
  };

  const formatCitation = (citation: Citation, style: string) => {
    if (style === 'APA') {
      return `(${citation.authors}, ${citation.year})`;
    } else if (style === 'MLA') {
      return `(${citation.authors.split(',')[0]} ${citation.year})`;
    } else if (style === 'Chicago') {
      return `(${citation.authors}, ${citation.year})`;
    }
    return `[${citation.id}]`;
  };

  const formatBibliographyEntry = (citation: Citation, style: string) => {
    if (style === 'APA') {
      return `${citation.authors} (${citation.year}). ${citation.title}.`;
    } else if (style === 'MLA') {
      return `${citation.authors}. "${citation.title}." (${citation.year}).`;
    } else if (style === 'Chicago') {
      return `${citation.authors}. ${citation.title}. ${citation.year}.`;
    }
    return `${citation.authors}, ${citation.title}, ${citation.year}.`;
  };

  const insertCitation = (citation: Citation) => {
    if (!editor) return;
    const formatted = formatCitation(citation, citationStyle);
    editor.chain().focus().insertContent(` <span data-citation-id="${citation.id}">${formatted}</span> `).run();
  };

  const getInsertedCitationIds = () => {
    if (!editor) return [];
    const ids = new Set<string>();
    editor.state.doc.descendants((node) => {
      node.marks.forEach(mark => {
        if (mark.type.name === 'citation' && mark.attrs.id) {
          ids.add(mark.attrs.id);
        }
      });
    });
    return Array.from(ids);
  };

  const generateBibliography = () => {
    if (!editor) return;
    
    const insertedIds = getInsertedCitationIds();
    const insertedCitations = citations.filter(c => insertedIds.includes(c.id));
    
    if (insertedCitations.length === 0) {
      showToast("No citations found in the document. Please insert some citations first.", 'info');
      return;
    }

    let bibHtml = `<h2>References</h2><ul>`;
    insertedCitations.forEach(c => {
      bibHtml += `<li>${formatBibliographyEntry(c, citationStyle)}</li>`;
    });
    bibHtml += `</ul>`;
    
    editor.chain().focus().insertContentAt(editor.state.doc.content.size, bibHtml).run();
  };

  const exportDocument = () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Exported Document</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; }
          h1, h2, h3 { color: #333; }
          p { margin-bottom: 1em; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thesis-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePanel = (panel: 'ai' | 'citation' | 'research' | 'outline' | 'latex' | 'settings' | 'toolkit') => {
    if (isMobile) {
      setShowAiPanel(panel === 'ai' ? !showAiPanel : false);
      setShowCitationPanel(panel === 'citation' ? !showCitationPanel : false);
      setShowResearchPanel(panel === 'research' ? !showResearchPanel : false);
      setShowLatexPanel(panel === 'latex' ? !showLatexPanel : false);
      setShowSettingsPanel(panel === 'settings' ? !showSettingsPanel : false);
      setShowToolkitPanel(panel === 'toolkit' ? !showToolkitPanel : false);
      setShowOutlinePanel(panel === 'outline' ? !showOutlinePanel : false);
    } else {
      if (panel === 'ai') setShowAiPanel(!showAiPanel);
      if (panel === 'citation') setShowCitationPanel(!showCitationPanel);
      if (panel === 'research') setShowResearchPanel(!showResearchPanel);
      if (panel === 'latex') setShowLatexPanel(!showLatexPanel);
      if (panel === 'settings') setShowSettingsPanel(!showSettingsPanel);
      if (panel === 'toolkit') setShowToolkitPanel(!showToolkitPanel);
      if (panel === 'outline') setShowOutlinePanel(!showOutlinePanel);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden relative">
      <Group orientation="horizontal">
        {/* Left Sidebar - Document Organization */}
        {showOutlinePanel && (
          <>
            <Panel defaultSize={20} minSize={15} maxSize={30} className={`bg-white flex flex-col flex-shrink-0 border-r border-neutral-200 ${isMobile ? '!absolute !inset-y-0 !left-0 !z-50 !w-80 !flex-none shadow-2xl' : ''}`}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2 text-neutral-800">
                  <ListTree className="w-4 h-4" />
                  Document Structure
                </h2>
                <button onClick={() => setShowOutlinePanel(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-1">
                {outline.length === 0 ? (
                  <div className="text-sm text-neutral-500 p-2">No headings found. Add headings to build your outline.</div>
                ) : (
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={outline.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {visibleOutline.map((item, index) => {
                        const hasChildren = index < outline.length - 1 && outline[outline.findIndex(i => i.id === item.id) + 1]?.level > item.level;
                        return (
                          <SortableOutlineItem 
                            key={item.id} 
                            item={item} 
                            editor={editor} 
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                            hasChildren={hasChildren}
                            isCollapsed={collapsedSections.has(item.id)}
                            onToggle={toggleSection}
                          />
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                )}
                
                <div className="mt-6 px-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">#AI</span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-100">#Education</span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-100">#Review</span>
                  </div>
                </div>
              </div>
            </Panel>
            {!isMobile && <Separator className="w-1 bg-neutral-200 hover:bg-indigo-400 transition-colors flex items-center justify-center cursor-col-resize" />}
          </>
        )}

        {/* Main Editor Area */}
        <Panel defaultSize={showOutlinePanel && !isMobile ? 55 : 75} minSize={30} className="flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {!showOutlinePanel && (
                <button 
                  onClick={() => togglePanel('outline')}
                  className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md transition-colors"
                  title="Show Outline"
                >
                  <ListTree className="w-5 h-5" />
                </button>
              )}
              <h1 className="font-semibold text-neutral-900 truncate text-sm sm:text-base">Impact of AI on Education</h1>
              <span className="hidden sm:inline-block px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-md">Draft</span>
              
              {/* Template Selector */}
              <div className="hidden md:flex items-center ml-4 gap-2">
                <LayoutTemplate className="w-4 h-4 text-neutral-400" />
                <select 
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="text-sm bg-transparent border-none text-neutral-600 focus:ring-0 cursor-pointer"
                >
                  <option>Standard Academic</option>
                  <option>Harvard University</option>
                  <option>Stanford University</option>
                  <option>MIT Thesis</option>
                  <option>Oxford Style</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0 ml-2">
              <button 
                onClick={() => togglePanel('citation')}
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${showCitationPanel ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'text-neutral-700 hover:bg-neutral-100'}`}
                title="Citations"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden lg:inline">Citations</span>
              </button>
              <button 
                onClick={() => togglePanel('ai')}
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${showAiPanel ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'text-neutral-700 hover:bg-neutral-100'}`}
                title="AI Assistant"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden lg:inline">AI Assistant</span>
              </button>
              <button 
                onClick={() => togglePanel('research')}
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${showResearchPanel ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'text-neutral-700 hover:bg-neutral-100'}`}
                title="AI Research"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">AI Research</span>
              </button>
              <button 
                onClick={() => togglePanel('latex')}
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${showLatexPanel ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'text-neutral-700 hover:bg-neutral-100'}`}
                title="LaTeX Editor"
              >
                <span className="font-serif italic font-bold text-sm">fx</span>
                <span className="hidden lg:inline">LaTeX</span>
              </button>
              <button 
                onClick={() => togglePanel('settings')}
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${showSettingsPanel ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'text-neutral-700 hover:bg-neutral-100'}`}
                title="Document Settings"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">Settings</span>
              </button>
              <button 
                onClick={() => togglePanel('toolkit')}
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${showToolkitPanel ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'text-neutral-700 hover:bg-neutral-100'}`}
                title="Scholar's Toolkit"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden lg:inline">Toolkit</span>
              </button>
              <div className="hidden sm:block w-px h-6 bg-neutral-200 mx-1"></div>
              <button className="hidden sm:block p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={exportDocument}
                className="hidden sm:block p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors" 
                title="Export Document"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <EditorToolbar 
            editor={editor} 
            onParaphrase={paraphraseSelection}
            onExpand={expandText}
            onShorten={shortenText}
            isProcessing={isParaphrasing}
          />

          {/* Editor Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-8">
            <div className={`max-w-4xl mx-auto bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 sm:p-12 min-h-full ${getTemplateClasses(selectedTemplate)}`}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Footer - Progress Tracker */}
          <div className="h-12 bg-white border-t border-neutral-200 flex items-center px-4 sm:px-6 text-xs sm:text-sm text-neutral-500 flex-shrink-0 justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <span>{editor?.storage.characterCount.words()} words</span>
              <span className="hidden sm:inline">{editor?.storage.characterCount.characters()} characters</span>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="font-medium text-neutral-700">Progress:</span>
                <div className="w-24 sm:w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[45%] rounded-full"></div>
                </div>
                <span>45%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="hidden sm:inline">Saved to cloud</span>
            </div>
          </div>
        </Panel>

        {/* Sidebars */}
        {showAiPanel && (
          <>
            {!isMobile && (
              <Separator className="w-1 bg-neutral-200 hover:bg-indigo-400 transition-colors flex items-center justify-center cursor-col-resize">
                <div className="h-8 w-1 bg-neutral-400 rounded-full flex items-center justify-center">
                </div>
              </Separator>
            )}
            <Panel defaultSize={25} minSize={20} maxSize={40} className={`bg-white flex flex-col flex-shrink-0 ${isMobile ? '!absolute !inset-y-0 !right-0 !z-50 !w-80 !flex-none shadow-2xl border-l border-neutral-200' : ''}`}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Assistant
                </h2>
                <button onClick={() => setShowAiPanel(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* AI Autocomplete Tool */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-blue-600" />
                    AI Autocomplete
                  </h3>
                  <p className="text-xs text-blue-700/80 mb-3 leading-relaxed">
                    Write with AI. Let the assistant continue your sentence or paragraph naturally.
                  </p>
                  <button 
                    onClick={autocompleteText}
                    disabled={isAutocompleting}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAutocompleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing...</> : 'Continue Writing'}
                  </button>
                </div>

                {/* AI Citation Generator Tool */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-1 flex items-center gap-2">
                    <Quote className="w-4 h-4 text-purple-600" />
                    Cite as you Write
                  </h3>
                  <p className="text-xs text-purple-700/80 mb-3 leading-relaxed">
                    Select a claim in your text, and the AI will find and insert a relevant academic citation.
                  </p>
                  <button 
                    onClick={generateCitation}
                    disabled={isGeneratingCitation}
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingCitation ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding Source...</> : 'Generate Citation'}
                  </button>
                </div>

                {/* Generate Abstract Tool */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Generate Abstract
                  </h3>
                  <p className="text-xs text-indigo-700/80 mb-3 leading-relaxed">
                    Automatically generate a 200-750 word abstract summarizing your document&apos;s main topic, methodology, and key findings.
                  </p>
                  <button 
                    onClick={generateAbstract}
                    disabled={isGeneratingAbstract}
                    className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingAbstract ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Now'
                    )}
                  </button>
                </div>

                {/* Generate Outline Tool */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                    <ListTree className="w-4 h-4 text-emerald-600" />
                    Generate Outline
                  </h3>
                  <p className="text-xs text-emerald-700/80 mb-3 leading-relaxed">
                    Create a detailed outline for an academic thesis based on your content.
                  </p>
                  <button 
                    onClick={generateOutline}
                    disabled={isGeneratingOutline}
                    className="w-full px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingOutline ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Outline'}
                  </button>
                </div>

                {/* Academic Checker Tool */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Academic Checker
                  </h3>
                  <p className="text-xs text-amber-700/80 mb-3 leading-relaxed">
                    Flag potential issues like passive voice, wordiness, and weak verbs.
                  </p>
                  <button 
                    onClick={checkAcademicTone}
                    disabled={isCheckingAcademic}
                    className="w-full px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCheckingAcademic ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : 'Check Academic Tone'}
                  </button>
                </div>

                {/* Plagiarism Checker Tool */}
                <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-rose-900 mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Plagiarism Check
                  </h3>
                  <p className="text-xs text-rose-700/80 mb-3 leading-relaxed">
                    Scan your document or selected text against web sources to detect potential plagiarism.
                  </p>
                  <button 
                    onClick={checkPlagiarism}
                    disabled={isCheckingPlagiarism}
                    className="w-full px-3 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCheckingPlagiarism ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</> : 'Scan for Plagiarism'}
                  </button>
                </div>

                {/* Summarize Tool */}
                <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-fuchsia-900 mb-1 flex items-center gap-2">
                    <Minimize2 className="w-4 h-4 text-fuchsia-600" />
                    Summarize Section
                  </h3>
                  <p className="text-xs text-fuchsia-700/80 mb-3 leading-relaxed">
                    Condense the selected text into a concise summary while retaining key points.
                  </p>
                  <button 
                    onClick={summarizeSelection}
                    disabled={isSummarizing}
                    className="w-full px-3 py-2 bg-fuchsia-600 text-white text-sm font-medium rounded-lg hover:bg-fuchsia-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSummarizing ? <><Loader2 className="w-4 h-4 animate-spin" /> Summarizing...</> : 'Summarize Text'}
                  </button>
                </div>

                {/* Translate Tool */}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-sky-900 mb-1 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-sky-600" />
                    Translate
                  </h3>
                  <p className="text-xs text-sky-700/80 mb-3 leading-relaxed">
                    Translate the selected text to English or French, maintaining an academic tone.
                  </p>
                  <button 
                    onClick={translateSelection}
                    disabled={isTranslating}
                    className="w-full px-3 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isTranslating ? <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</> : 'Translate Text'}
                  </button>
                </div>

                {/* Grammar Check Tool */}
                <div className="bg-gradient-to-br from-lime-50 to-green-50 border border-lime-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-lime-900 mb-1 flex items-center gap-2">
                    <SpellCheck className="w-4 h-4 text-lime-600" />
                    Grammar & Spell Check
                  </h3>
                  <p className="text-xs text-lime-700/80 mb-3 leading-relaxed">
                    Review your document or selection for grammar, spelling, and punctuation errors.
                  </p>
                  <button 
                    onClick={checkGrammar}
                    disabled={isGrammarChecking}
                    className="w-full px-3 py-2 bg-lime-600 text-white text-sm font-medium rounded-lg hover:bg-lime-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGrammarChecking ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : 'Check Grammar'}
                  </button>
                </div>

                {/* Paraphrase Tool */}
                <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Edit Selection</h3>
                  <p className="text-xs text-neutral-600 mb-3">Select text in the editor and choose an action to modify it.</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button 
                      onClick={paraphraseSelection}
                      disabled={isParaphrasing}
                      className="w-full px-2 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {isParaphrasing ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Paraphrase
                    </button>
                    <button 
                      onClick={summarizeText}
                      disabled={isParaphrasing}
                      className="w-full px-2 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {isParaphrasing ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Summarize
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={expandText}
                      disabled={isParaphrasing}
                      className="w-full px-2 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {isParaphrasing ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Expand
                    </button>
                    <button 
                      onClick={shortenText}
                      disabled={isParaphrasing}
                      className="w-full px-2 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {isParaphrasing ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Shorten
                    </button>
                  </div>
                </div>

                {/* Grammar Suggestion */}
                <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Grammar Suggestion</h3>
                  <p className="text-sm text-neutral-600 mb-3">Consider rephrasing &quot;is rapidly transforming&quot; to &quot;has fundamentally altered&quot; for a stronger academic tone.</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800">Accept</button>
                    <button className="px-3 py-1.5 bg-white text-neutral-700 border border-neutral-200 text-xs font-medium rounded-lg hover:bg-neutral-50">Dismiss</button>
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}

        {showCitationPanel && (
          <>
            {!isMobile && (
              <Separator className="w-1 bg-neutral-200 hover:bg-indigo-400 transition-colors flex items-center justify-center cursor-col-resize">
                <div className="h-8 w-1 bg-neutral-400 rounded-full flex items-center justify-center">
                </div>
              </Separator>
            )}
            <Panel defaultSize={25} minSize={20} maxSize={40} className={`bg-white flex flex-col flex-shrink-0 ${isMobile ? '!absolute !inset-y-0 !right-0 !z-50 !w-80 !flex-none shadow-2xl border-l border-neutral-200' : ''}`}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-neutral-600" />
                  Citations
                </h2>
                <button onClick={() => setShowCitationPanel(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
              </div>
              
              {/* Style Selector & Actions */}
              <div className="p-4 border-b border-neutral-100 bg-neutral-50 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Citation Style</label>
                  <select 
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value)}
                    className="w-full text-sm bg-white border border-neutral-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    <option>APA</option>
                    <option>MLA</option>
                    <option>Chicago</option>
                  </select>
                </div>
                <button 
                  onClick={generateBibliography}
                  className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ListTree className="w-4 h-4" />
                  Generate Bibliography
                </button>
              </div>

              {/* Integrations */}
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Connect Accounts</h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleConnectZotero}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${zoteroConnected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Zotero
                    </div>
                    {zoteroConnected ? 'Connected' : 'Connect'}
                  </button>
                  <button 
                    onClick={handleConnectMendeley}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${mendeleyConnected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Mendeley
                    </div>
                    {mendeleyConnected ? 'Connected' : 'Connect'}
                  </button>
                  <button 
                    onClick={() => setShowScholarProfileModal(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      OpenAlex
                    </div>
                    Connect
                  </button>
                </div>
              </div>

              <div className="p-4 border-b border-neutral-200 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">My Library</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSyncCitations} 
                      disabled={isSyncingCitations}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      {isSyncingCitations ? <Loader2 className="w-3 h-3 animate-spin" /> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                      Sync
                    </button>
                    <button onClick={() => { setShowResearchPanel(true); setResearchTab('scholar'); }} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      <Search className="w-3 h-3" /> Scholar
                    </button>
                    <button onClick={() => setShowAddCitation(!showAddCitation)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                      + Add Custom
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input 
                      type="text" 
                      placeholder="Search library..." 
                      value={citationSearchQuery}
                      onChange={e => setCitationSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-md text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                  <select 
                    value={citationSortBy}
                    onChange={e => setCitationSortBy(e.target.value as any)}
                    className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-xs outline-none focus:border-indigo-500 text-neutral-600"
                  >
                    <option value="year">Year</option>
                    <option value="author">Author</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>

              {showAddCitation && (
                <div className="p-4 border-b border-neutral-200 bg-indigo-50/50 space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Title or DOI" 
                      value={newCitation.title}
                      onChange={e => setNewCitation({...newCitation, title: e.target.value})}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleManualScholarSearch();
                      }}
                      className="flex-1 w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none focus:border-indigo-500"
                    />
                    <button 
                      onClick={handleManualScholarSearch}
                      disabled={isSearchingManualCitation || !newCitation.title.trim()}
                      className="px-3 py-1.5 bg-white border border-neutral-200 text-indigo-600 rounded-md hover:bg-neutral-50 disabled:opacity-50 flex items-center justify-center transition-colors"
                      title="Search OpenAlex"
                    >
                      {isSearchingManualCitation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                  </div>

                  {manualScholarError && (
                    <div className="text-xs text-red-600 p-1">
                      {manualScholarError}
                    </div>
                  )}

                  {manualScholarResults.length > 0 && (
                    <div className="bg-white border border-neutral-200 rounded-md shadow-sm max-h-48 overflow-y-auto mb-2">
                      <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1 bg-neutral-50 border-b border-neutral-200 sticky top-0">
                        Select from Scholar
                      </div>
                      {manualScholarResults.map((result, idx) => (
                        <div key={idx} className="p-2 border-b border-neutral-100 last:border-0 hover:bg-indigo-50/30 transition-colors group">
                          <div className="text-xs font-medium text-indigo-700 line-clamp-1 mb-0.5">{result.title}</div>
                          <div className="text-[10px] text-neutral-500 line-clamp-1 mb-1">
                            {result.publication_info?.summary || 'Unknown publication'}
                          </div>
                          <button
                            onClick={() => {
                              setNewCitation({
                                ...newCitation,
                                title: result.title,
                                authors: result.publication_info?.summary?.split('-')[0]?.trim() || 'Unknown',
                                year: result.publication_info?.summary?.match(/\b(19|20)\d{2}\b/)?.[0] || new Date().getFullYear().toString(),
                                link: result.link,
                                snippet: result.snippet
                              });
                              setManualScholarResults([]);
                            }}
                            className="text-[10px] font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors w-full"
                          >
                            Use this citation
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input 
                    type="text" 
                    placeholder="Authors (e.g. Smith, J.)" 
                    value={newCitation.authors}
                    onChange={e => setNewCitation({...newCitation, authors: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none focus:border-indigo-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Year" 
                    value={newCitation.year}
                    onChange={e => setNewCitation({...newCitation, year: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => { setShowAddCitation(false); setManualScholarResults([]); }} className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-800">Cancel</button>
                    <button onClick={handleAddCitation} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700">Save</button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {filteredAndSortedCitations.map(citation => (
                  <div 
                    key={citation.id} 
                    id={`citation-${citation.id}`}
                    className={`border rounded-xl p-3 transition-colors ${highlightedCitationId === citation.id ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200' : citation.source === 'zotero' || citation.source === 'mendeley' ? 'border-red-100 bg-red-50/30 hover:border-indigo-300' : 'border-neutral-200 bg-white hover:border-indigo-300'}`}
                  >
                    {editingCitationId === citation.id ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Title" 
                          value={editCitationForm.title}
                          onChange={e => setEditCitationForm({...editCitationForm, title: e.target.value})}
                          className="w-full px-2 py-1 bg-white border border-neutral-200 rounded text-xs outline-none focus:border-indigo-500 font-medium"
                        />
                        <input 
                          type="text" 
                          placeholder="Authors" 
                          value={editCitationForm.authors}
                          onChange={e => setEditCitationForm({...editCitationForm, authors: e.target.value})}
                          className="w-full px-2 py-1 bg-white border border-neutral-200 rounded text-xs outline-none focus:border-indigo-500"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Year" 
                            value={editCitationForm.year}
                            onChange={e => setEditCitationForm({...editCitationForm, year: e.target.value})}
                            className="w-1/3 px-2 py-1 bg-white border border-neutral-200 rounded text-xs outline-none focus:border-indigo-500"
                          />
                          <input 
                            type="text" 
                            placeholder="Link (optional)" 
                            value={editCitationForm.link}
                            onChange={e => setEditCitationForm({...editCitationForm, link: e.target.value})}
                            className="w-2/3 px-2 py-1 bg-white border border-neutral-200 rounded text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                        <textarea
                          placeholder="Add custom notes..."
                          value={editCitationForm.notes}
                          onChange={e => setEditCitationForm({...editCitationForm, notes: e.target.value})}
                          className="w-full px-2 py-1 bg-white border border-neutral-200 rounded text-xs outline-none focus:border-indigo-500 resize-none h-16"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button onClick={() => setEditingCitationId(null)} className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-800">Cancel</button>
                          <button 
                            onClick={() => {
                              setCitations(prev => prev.map(c => c.id === citation.id ? { ...c, ...editCitationForm } : c));
                              setEditingCitationId(null);
                            }} 
                            className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 pr-2" title={citation.title}>
                            {citation.link ? (
                              <a href={citation.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-700">
                                {citation.title}
                              </a>
                            ) : (
                              citation.title
                            )}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button 
                              onClick={() => {
                                setEditingCitationId(citation.id);
                                setEditCitationForm({
                                  title: citation.title,
                                  authors: citation.authors,
                                  year: citation.year,
                                  link: citation.link || '',
                                  notes: citation.notes || ''
                                });
                              }}
                              className="p-1 text-neutral-400 hover:text-indigo-600 rounded"
                              title="Edit citation"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => setCitations(citations.filter(c => c.id !== citation.id))} 
                              className="p-1 text-neutral-400 hover:text-red-600 rounded"
                              title="Delete citation"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-neutral-500">{citation.authors} ({citation.year})</p>
                          {citation.source !== 'manual' && citation.source !== 'search' && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded uppercase">{citation.source}</span>
                          )}
                        </div>
                        {citation.snippet && (
                          <p className="text-[10px] text-neutral-400 line-clamp-2 mb-2 italic">&quot;{citation.snippet}&quot;</p>
                        )}
                        {citation.notes && (
                          <div className="mt-2 mb-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-800">
                            <span className="font-semibold block mb-0.5">Notes:</span>
                            {citation.notes}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-3">
                            <button onClick={() => insertCitation(citation)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Insert</button>
                            <button onClick={() => handleChatWithCitation(citation)} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Chat</button>
                            {citation.link && (
                              <a href={citation.link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                Source <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {filteredAndSortedCitations.length === 0 && (
                  <div className="text-center text-sm text-neutral-500 py-8 px-4">
                    {citations.length === 0 ? (
                      <>
                        <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                        <p>Your library is empty.</p>
                        <p className="text-xs mt-1">Add citations manually, search Scholar, or connect an account.</p>
                      </>
                    ) : (
                      <p>No citations match your search.</p>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          </>
        )}
        {showResearchPanel && (
          <>
            {!isMobile && (
              <Separator className="w-1 bg-neutral-200 hover:bg-indigo-400 transition-colors flex items-center justify-center cursor-col-resize">
                <div className="h-8 w-1 bg-neutral-400 rounded-full flex items-center justify-center">
                </div>
              </Separator>
            )}
            <Panel defaultSize={25} minSize={20} maxSize={40} className={`bg-white flex flex-col flex-shrink-0 ${isMobile ? '!absolute !inset-y-0 !right-0 !z-50 !w-80 !flex-none shadow-2xl border-l border-neutral-200' : ''}`}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-600" />
                  AI Research Assistant
                </h2>
                <button onClick={() => setShowResearchPanel(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
              </div>
              
              <div className="flex border-b border-neutral-200">
                <button
                  onClick={() => setResearchTab('chat')}
                  className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${researchTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setResearchTab('scholar')}
                  className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${researchTab === 'scholar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  OpenAlex
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 flex flex-col">
                {researchTab === 'chat' ? (
                  <>
                    <div className="flex-1 space-y-4 overflow-y-auto pb-4">
                      {researchMessages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[90%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-800'}`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            {msg.urls && msg.urls.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Sources</p>
                                {msg.urls.map((url, uidx) => (
                                  <a key={uidx} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-600 hover:underline truncate">
                                    {url}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isResearching && (
                        <div className="flex items-start">
                          <div className="bg-neutral-100 rounded-xl p-3 text-sm text-neutral-500 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Researching...
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-4 border-t border-neutral-100">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={researchQuery}
                          onChange={(e) => setResearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleResearchQuery();
                            }
                          }}
                          placeholder="Ask a research question..." 
                          className="w-full pl-4 pr-10 py-3 bg-neutral-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                        <button 
                          onClick={handleResearchQuery}
                          disabled={isResearching || !researchQuery.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={scholarQuery}
                          onChange={(e) => setScholarQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleScholarSearch();
                            }
                          }}
                          placeholder="Search OpenAlex..." 
                          className="w-full pl-4 pr-10 py-3 bg-neutral-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                        <button 
                          onClick={handleScholarSearch}
                          disabled={isSearchingScholar || !scholarQuery.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                      {isSearchingScholar && (
                        <div className="flex items-center justify-center py-8 text-neutral-500">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          Searching OpenAlex...
                        </div>
                      )}
                      
                      {scholarError && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                          {scholarError}
                        </div>
                      )}
                      
                      {!isSearchingScholar && !scholarError && scholarResults.length === 0 && scholarQuery && (
                        <div className="text-center text-sm text-neutral-500 py-8">
                          No results found.
                        </div>
                      )}
                      
                      {!isSearchingScholar && scholarResults.map((result, idx) => (
                        <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-3 hover:border-indigo-300 transition-colors shadow-sm">
                          <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-700 hover:underline line-clamp-2 mb-1">
                            {result.title}
                          </a>
                          <div className="text-xs text-emerald-700 mb-2 line-clamp-1">
                            {result.publication_info?.summary || 'Unknown publication'}
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-3 mb-3">
                            {result.snippet}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-500">
                              {result.inline_links?.cited_by?.total ? `Cited by ${result.inline_links.cited_by.total}` : ''}
                            </span>
                            <button 
                              onClick={() => {
                                const newCit: Citation = {
                                  id: Date.now().toString(),
                                  title: result.title,
                                  authors: result.publication_info?.summary?.split('-')[0]?.trim() || 'Unknown',
                                  year: result.publication_info?.summary?.match(/\b(19|20)\d{2}\b/)?.[0] || new Date().getFullYear().toString(),
                                  source: 'search'
                                };
                                setCitations(prev => [...prev, newCit]);
                                setShowCitationPanel(true);
                              }}
                              className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
                            >
                              Save Citation
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Panel>
          </>
        )}
        {showLatexPanel && (
          <>
            {!isMobile && (
              <Separator className="w-1 bg-neutral-200 hover:bg-indigo-400 transition-colors flex items-center justify-center cursor-col-resize">
                <div className="h-8 w-1 bg-neutral-400 rounded-full flex items-center justify-center">
                </div>
              </Separator>
            )}
            <Panel defaultSize={30} minSize={25} maxSize={50} className={`bg-white flex flex-col flex-shrink-0 ${isMobile ? '!absolute !inset-y-0 !right-0 !z-50 !w-80 !flex-none shadow-2xl border-l border-neutral-200' : ''}`}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className="font-serif italic font-bold text-indigo-600">fx</span>
                  LaTeX Editor
                </h2>
                <button onClick={() => setShowLatexPanel(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex flex-col">
                <div className="flex-1 border border-neutral-200 rounded-xl overflow-hidden">
                  <LatexEditor 
                    initialContent={latexContent}
                    onChange={setLatexContent}
                    placeholder="Write your math equations here..."
                    minHeight="100%"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-end">
                  <button 
                    onClick={() => {
                      if (editor) {
                        editor.chain().focus().insertContent(latexContent).run();
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Insert to Document
                  </button>
                </div>
              </div>
            </Panel>
          </>
        )}
        {showSettingsPanel && (
          <>
            {!isMobile && (
              <Separator className="w-1 bg-neutral-200 hover:bg-indigo-400 transition-colors flex items-center justify-center cursor-col-resize">
                <div className="h-8 w-1 bg-neutral-400 rounded-full flex items-center justify-center">
                </div>
              </Separator>
            )}
            <Panel defaultSize={25} minSize={20} maxSize={40} className={`bg-white flex flex-col flex-shrink-0 ${isMobile ? '!absolute !inset-y-0 !right-0 !z-50 !w-80 !flex-none shadow-2xl border-l border-neutral-200' : ''}`}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  Document Settings
                </h2>
                <button onClick={() => setShowSettingsPanel(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3">Formatting</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Citation Style</label>
                      <select className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none">
                        <option>APA 7th Edition</option>
                        <option>MLA 9th Edition</option>
                        <option>Chicago Manual of Style</option>
                        <option>Harvard</option>
                        <option>IEEE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Line Spacing</label>
                      <select className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none">
                        <option>Single</option>
                        <option>1.15</option>
                        <option>1.5</option>
                        <option>Double</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3">Export Options</h3>
                  <div className="space-y-2">
                    <button onClick={exportDocument} className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg border border-neutral-200 transition-colors text-sm text-neutral-700">
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Word Document (.docx)</span>
                      <Download className="w-3 h-3 text-neutral-400" />
                    </button>
                    <button onClick={exportDocument} className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg border border-neutral-200 transition-colors text-sm text-neutral-700">
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-red-500" /> PDF Document (.pdf)</span>
                      <Download className="w-3 h-3 text-neutral-400" />
                    </button>
                    <button onClick={exportDocument} className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg border border-neutral-200 transition-colors text-sm text-neutral-700">
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-neutral-500" /> LaTeX (.tex)</span>
                      <Download className="w-3 h-3 text-neutral-400" />
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3">Document Info</h3>
                  <div className="bg-neutral-50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Words</span>
                      <span className="font-medium text-neutral-700">{editor?.storage.characterCount.words() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Characters</span>
                      <span className="font-medium text-neutral-700">{editor?.storage.characterCount.characters() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Reading Time</span>
                      <span className="font-medium text-neutral-700">{Math.ceil((editor?.storage.characterCount.words() || 0) / 200)} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}
        {showToolkitPanel && (
          <>
            {!isMobile && (
              <Separator className="w-1 bg-neutral-200 hover:bg-indigo-400 transition-colors flex items-center justify-center cursor-col-resize">
                <div className="h-8 w-1 bg-neutral-400 rounded-full flex items-center justify-center">
                </div>
              </Separator>
            )}
            <Panel defaultSize={25} minSize={20} maxSize={40} className={`bg-white flex flex-col flex-shrink-0 ${isMobile ? '!absolute !inset-y-0 !right-0 !z-50 !w-80 !flex-none shadow-2xl border-l border-neutral-200' : ''}`}>
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Scholar&apos;s Toolkit
                </h2>
                <button onClick={() => setShowToolkitPanel(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    <strong>30+ specialized tools</strong> designed to accelerate every stage of your research journey, from ideation to publication.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Ideation & Planning
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Topic Generator</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Hypothesis Builder</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">RQ Refiner</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Outline Creator</button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" /> Literature Review
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleToolkitAction('Source Evaluator', 'Evaluate the credibility and relevance of the sources mentioned in the following text. Provide a brief analysis for each.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Source Evaluator</button>
                    <button onClick={() => handleToolkitAction('Gap Analyzer', 'Analyze the following text and identify potential research gaps or areas that require further investigation.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Gap Analyzer</button>
                    <button onClick={() => handleToolkitAction('Methodology Recs', 'Based on the research topic or context provided, suggest appropriate research methodologies (qualitative, quantitative, or mixed) and justify your recommendations.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Methodology Recs</button>
                    <button onClick={() => handleToolkitAction('Lit Matrix Builder', 'Create a literature review matrix based on the provided text. Extract key themes, methodologies, and findings from the mentioned sources.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Lit Matrix Builder</button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-emerald-500" /> Writing & Drafting
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={generateAbstract} disabled={isGeneratingAbstract || isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Abstract Generator</button>
                    <button onClick={checkAcademicTone} disabled={isCheckingAcademic || isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Academic Tone</button>
                    <button onClick={() => handleToolkitAction('Transition Flow', 'Analyze the transitions between paragraphs or sections in the following text. Suggest improvements to enhance the logical flow and readability.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Transition Flow</button>
                    <button onClick={() => handleToolkitAction('Conclusion Writer', 'Draft a strong conclusion based on the provided text. Summarize the main points, restate the thesis/objectives in a new way, and highlight the broader implications.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Conclusion Writer</button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-purple-500" /> Data & Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleToolkitAction('Chart Describer', 'Provide a detailed academic description of the data or trends mentioned in the following text, as if describing a chart or table.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Chart Describer</button>
                    <button onClick={() => handleToolkitAction('Stat Test Selector', 'Based on the research design and variables described in the text, recommend appropriate statistical tests and explain why they are suitable.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Stat Test Selector</button>
                    <button onClick={() => handleToolkitAction('Result Interpreter', 'Interpret the findings or results presented in the following text. Explain their significance in the context of the broader research topic.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Result Interpreter</button>
                    <button onClick={() => handleToolkitAction('Limitation Finder', 'Critically analyze the provided text (especially methodology or results) and identify potential limitations, biases, or confounding factors.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Limitation Finder</button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-rose-500" /> Publication
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleToolkitAction('Journal Matcher', 'Based on the topic, methodology, and findings in the provided text, suggest 3-5 academic journals that would be a good fit for publication. Briefly explain why for each.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Journal Matcher</button>
                    <button onClick={() => handleToolkitAction('Cover Letter', 'Draft a professional cover letter for submitting this research to an academic journal. Highlight the novelty, significance, and fit for the journal.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Cover Letter</button>
                    <button onClick={() => handleToolkitAction('Review Simulator', 'Act as a critical peer reviewer (Reviewer 2). Provide constructive but rigorous feedback on the provided text, pointing out weaknesses and areas for improvement.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Review Simulator</button>
                    <button onClick={() => handleToolkitAction('Response Drafter', 'Draft a polite and comprehensive response to peer review comments based on the provided text. Assume the text contains the reviewer comments.')} disabled={isToolkitLoading} className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50">Response Drafter</button>
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}
      </Group>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all animate-in slide-in-from-bottom-5 ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          'bg-indigo-50 text-indigo-800 border border-indigo-200'
        }`}>
          <div className="text-sm font-medium">{toast.message}</div>
          <button onClick={() => setToast(null)} className="text-current opacity-70 hover:opacity-100">
            &times;
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-lg font-semibold text-neutral-900">{modal.title}</h3>
              <button onClick={() => setModal(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap">
                {modal.content}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scholar Profile Modal */}
      {showScholarProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Connect OpenAlex Profile
              </h2>
              <button onClick={() => setShowScholarProfileModal(false)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
            </div>
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex gap-2">
              <input
                type="text"
                placeholder="Enter Author Name or OpenAlex ID (e.g., A5023888391)"
                value={scholarAuthorId}
                onChange={(e) => setScholarAuthorId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchScholarProfile();
                }}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleFetchScholarProfile}
                disabled={isFetchingProfile || !scholarAuthorId.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isFetchingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Articles'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {profileError && <div className="text-red-600 text-sm mb-4">{profileError}</div>}
              {profileArticles.length > 0 ? (
                <div className="space-y-3">
                  {profileArticles.map((article, idx) => (
                    <div key={idx} className="border border-neutral-200 rounded-lg p-3 flex justify-between items-start gap-4 hover:border-indigo-300 transition-colors">
                      <div>
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-700 hover:underline line-clamp-2">{article.title}</a>
                        <div className="text-xs text-neutral-500 mt-1">{article.authors}</div>
                        <div className="text-xs text-neutral-400 mt-1">{article.publication} • {article.year}</div>
                      </div>
                      <button
                        onClick={() => handleImportProfileArticle(article)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-100 flex-shrink-0"
                      >
                        Import
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !isFetchingProfile && <div className="text-center text-neutral-500 text-sm py-8">Enter an Author Name or OpenAlex ID to fetch their publications.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
