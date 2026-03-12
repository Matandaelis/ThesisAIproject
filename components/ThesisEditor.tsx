'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Download, Share2, MessageSquare, GripVertical, Search, Loader2, Folder, Tag, ListTree, ChevronRight, ChevronDown, FileText, CheckCircle2, LayoutTemplate, Link as LinkIcon, Menu, X, ShieldAlert, Wand2, Quote, Languages, SpellCheck, Minimize2, Settings, Briefcase, Lightbulb, PenTool, Microscope, GraduationCap } from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { EditorToolbar } from './EditorToolbar';
import { GoogleGenAI } from '@google/genai';
import dynamic from 'next/dynamic';
import 'react-latex-editor/styles';

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
};

type OutlineItem = {
  id: string;
  level: number;
  text: string;
  pos: number;
};

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
  
  // Research Assistant State
  const [researchQuery, setResearchQuery] = useState('');
  const [researchMessages, setResearchMessages] = useState<{role: 'user' | 'assistant', content: string, urls?: string[]}[]>([
    { role: 'assistant', content: "Hi! I'm your AI Research Assistant. You can ask me to find papers, summarize topics, or explain concepts related to your thesis." }
  ]);
  const [isResearching, setIsResearching] = useState(false);
  
  // LaTeX Editor State
  const [latexContent, setLatexContent] = useState('<p>Write your math equations here...</p>');

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
    { id: '1', title: 'Attention is All You Need', authors: 'Vaswani et al.', year: '2017', source: 'search' }
  ]);
  const [citationStyle, setCitationStyle] = useState('APA');
  const [showAddCitation, setShowAddCitation] = useState(false);
  const [newCitation, setNewCitation] = useState({ title: '', authors: '', year: '' });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
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
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          items.push({
            id: `heading-${pos}`,
            level: node.attrs.level,
            text: node.textContent,
            pos,
          });
        }
      });
      setOutline(items);
    },
    onUpdate: ({ editor }) => {
      const items: OutlineItem[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          items.push({
            id: `heading-${pos}`,
            level: node.attrs.level,
            text: node.textContent,
            pos,
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
      
      const prompt = `Write a research paper abstract based on the provided document. The abstract should be approximately 200-750 words and accurately summarize the document's main topic, research questions or objectives, methodology, key findings, and the significance or implications of the research.\n\nDocument:\n${documentContent}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        // Insert the abstract at the beginning of the document
        editor.chain().focus().insertContentAt(0, `<h2>Abstract</h2><p>${response.text}</p><hr>`).run();
      }
    } catch (error) {
      console.error('Failed to generate abstract:', error);
      alert('Failed to generate abstract. Please try again.');
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
      
      const prompt = `Create a detailed outline for an academic thesis using the provided document. The outline should include standard sections such as Introduction, Literature Review, Methodology, Results, Discussion, and Conclusion, with suggested sub-points for each section based on the document's content.\n\nDocument:\n${documentContent}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        editor.chain().focus().insertContentAt(editor.state.selection.to, `<h2>Proposed Outline</h2>${response.text.replace(/\n/g, '<br>')}<hr>`).run();
      }
    } catch (error) {
      console.error('Failed to generate outline:', error);
      alert('Failed to generate outline. Please try again.');
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
        alert("Academic Check Results:\n\n" + response.text);
      }
    } catch (error) {
      console.error('Failed to check academic tone:', error);
      alert('Failed to check academic tone. Please try again.');
    } finally {
      setIsCheckingAcademic(false);
    }
  };

  const paraphraseSelection = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      alert("Please select some text to paraphrase.");
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
      alert('Failed to paraphrase. Please try again.');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const expandText = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      alert("Please select some text to expand.");
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
      alert('Failed to expand text. Please try again.');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const shortenText = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      alert("Please select some text to shorten.");
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
      alert('Failed to shorten text. Please try again.');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const summarizeText = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      alert("Please select some text to summarize.");
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
        alert("Summary:\n\n" + response.text);
      }
    } catch (error) {
      console.error('Failed to summarize text:', error);
      alert('Failed to summarize text. Please try again.');
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
      alert("Please add some text to check for plagiarism.");
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
        alert("Plagiarism Report:\n\n" + response.text);
      }
    } catch (error) {
      console.error('Failed to check plagiarism:', error);
      alert('Failed to check plagiarism. Please try again.');
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
      alert('Failed to autocomplete. Please try again.');
    } finally {
      setIsAutocompleting(false);
    }
  };

  const summarizeSelection = async () => {
    if (!editor) return;
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      alert("Please select text to summarize.");
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
      alert('Failed to summarize text.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const translateSelection = async () => {
    if (!editor) return;
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      alert("Please select text to translate.");
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
      alert('Failed to translate text.');
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
      alert("The document is empty.");
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
      alert('Failed to check grammar.');
    } finally {
      setIsGrammarChecking(false);
    }
  };

  const generateCitation = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!text) {
      alert("Please select a claim or sentence to generate a citation for.");
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
      alert('Failed to generate citation. Please try again.');
    } finally {
      setIsGeneratingCitation(false);
    }
  };

  const handleResearchQuery = async () => {
    if (!researchQuery.trim() || isResearching) return;
    
    const userMessage = { role: 'user' as const, content: researchQuery };
    setResearchMessages(prev => [...prev, userMessage]);
    setResearchQuery('');
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

  const handleAddCitation = () => {
    if (newCitation.title && newCitation.authors) {
      setCitations(prev => [...prev, { id: Date.now().toString(), ...newCitation, source: 'manual' }]);
      setNewCitation({ title: '', authors: '', year: '' });
      setShowAddCitation(false);
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
      alert("No citations found in the document. Please insert some citations first.");
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
                  outline.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        if (editor) {
                          editor.commands.focus();
                          editor.commands.setTextSelection(item.pos);
                          // Scroll to the heading
                          setTimeout(() => {
                            const domNode = editor.view.nodeDOM(item.pos) as HTMLElement;
                            if (domNode && domNode.scrollIntoView) {
                              domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 50);
                        }
                      }}
                      className="flex items-center gap-2 py-1.5 hover:bg-neutral-100 rounded-md cursor-pointer text-sm text-neutral-600 transition-colors"
                      style={{ paddingLeft: `${(item.level - 1) * 1 + 0.5}rem`, paddingRight: '0.5rem' }}
                    >
                      {item.level === 1 ? (
                        <Folder className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      )}
                      <span className={`truncate ${item.level === 1 ? 'font-medium text-neutral-800' : ''}`}>
                        {item.text || 'Untitled Section'}
                      </span>
                    </div>
                  ))
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
                </div>
              </div>

              <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">My Library</h3>
                <button onClick={() => setShowAddCitation(!showAddCitation)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  + Add Manual
                </button>
              </div>

              {showAddCitation && (
                <div className="p-4 border-b border-neutral-200 bg-indigo-50/50 space-y-2">
                  <input 
                    type="text" 
                    placeholder="Title" 
                    value={newCitation.title}
                    onChange={e => setNewCitation({...newCitation, title: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none focus:border-indigo-500"
                  />
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
                    <button onClick={() => setShowAddCitation(false)} className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-800">Cancel</button>
                    <button onClick={handleAddCitation} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700">Save</button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {citations.map(citation => (
                  <div 
                    key={citation.id} 
                    id={`citation-${citation.id}`}
                    className={`border rounded-xl p-3 transition-colors ${highlightedCitationId === citation.id ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200' : citation.source === 'zotero' || citation.source === 'mendeley' ? 'border-red-100 bg-red-50/30 hover:border-indigo-300' : 'border-neutral-200 bg-white hover:border-indigo-300'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-neutral-900 line-clamp-1" title={citation.title}>{citation.title}</h3>
                      {citation.source !== 'manual' && citation.source !== 'search' && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded uppercase ml-2 flex-shrink-0">{citation.source}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">{citation.authors} ({citation.year})</p>
                    <div className="flex justify-between items-center">
                      <button onClick={() => insertCitation(citation)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Insert Citation</button>
                      <button onClick={() => setCitations(citations.filter(c => c.id !== citation.id))} className="text-xs text-neutral-400 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                ))}
                {citations.length === 0 && (
                  <div className="text-center text-sm text-neutral-500 py-4">
                    No citations in library.
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
              <div className="flex-1 overflow-auto p-4 flex flex-col">
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
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Source Evaluator</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Gap Analyzer</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Methodology Recs</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Lit Matrix Builder</button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-emerald-500" /> Writing & Drafting
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Abstract Generator</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Academic Tone</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Transition Flow</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Conclusion Writer</button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-purple-500" /> Data & Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Chart Describer</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Stat Test Selector</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Result Interpreter</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Limitation Finder</button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-rose-500" /> Publication
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Journal Matcher</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Cover Letter</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Review Simulator</button>
                    <button className="p-2 text-left text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">Response Drafter</button>
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
}
