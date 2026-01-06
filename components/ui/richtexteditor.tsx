import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node as TiptapNode } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import ImageResize from 'tiptap-extension-resize-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Code,
  ListOrdered,
  List,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Eye,
  Video as VideoIcon,
  Youtube,
  Move,
  Maximize,
  Minimize,
  FileText,
  Music,
} from 'lucide-react';
import { uploadImageToCloudinary, uploadAudioToCloudinary, uploadRawToCloudinary } from '@/utils/cloudinary';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

const VideoExtension = TiptapNode.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: '400px',
      },
      provider: {
        default: 'youtube', // youtube or vimeo
        parseHTML: element => element.getAttribute('data-provider') || 'youtube',
      },
      videoId: {
        default: null,
        parseHTML: element => element.getAttribute('data-video-id') || null,
      },
      align: {
        default: 'center', // 'left', 'center', 'right', 'full'
        parseHTML: element => element.getAttribute('align') || 'center',
        renderHTML: attributes => {
          return {
            align: attributes.align || 'center',
          }
        }
      },
      // Boyutlandırma işlemi için ekstra attr ekleyelim
      isResizable: {
        default: true,
        parseHTML: () => true,
        renderHTML: () => ({})
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const { provider, videoId, width, height, align } = HTMLAttributes;

    let embedUrl = '';
    if (provider === 'youtube') {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (provider === 'vimeo') {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }


    // Convert align value to HTML attributes and inline styles
    let style = '';
    let alignAttr = align;

    if (align === 'full') {
      style = 'display: block; width: 100%; margin-left: auto; margin-right: auto;';
      alignAttr = 'center';
    } else if (align === 'center') {
      style = 'display: block; margin-left: auto; margin-right: auto;';
    } else if (align === 'left') {
      style = 'float: left; margin-right: 1rem; max-width: 50%;';
    } else if (align === 'right') {
      style = 'float: right; margin-left: 1rem; max-width: 50%;';
    }

    return [
      'div',
      {
        class: 'video-embed my-6',
        'data-video': '',
        'data-video-id': videoId,
        'data-provider': provider,
        style: `position: relative; margin: 1.5rem 0; width: 100%; ${style}`,
        align: alignAttr
      },
      ['iframe', {
        src: embedUrl,
        width: '100%',
        height: '400px',
        frameborder: '0',
        allowfullscreen: 'true',
        style: 'width: 100%; height: 400px;'
      }],
    ];
  },
});

// Custom extension for Audio files
// Custom extension for Iframe embeds (Spotify, SoundCloud, etc.)
const IframeExtension = TiptapNode.create({
  name: 'iframe',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.getAttribute('src');
          }
          const iframe = element.querySelector('iframe');
          return iframe ? iframe.getAttribute('src') : null;
        },
      },
      width: {
        default: '100%',
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.getAttribute('width') || '100%';
          }
          const iframe = element.querySelector('iframe');
          return iframe ? (iframe.getAttribute('width') || '100%') : '100%';
        },
      },
      height: {
        default: '352',
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.getAttribute('height') || '352';
          }
          const iframe = element.querySelector('iframe');
          return iframe ? (iframe.getAttribute('height') || '352') : '352';
        },
      },
      frameborder: {
        default: '0',
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.getAttribute('frameborder') || '0';
          }
          const iframe = element.querySelector('iframe');
          return iframe ? (iframe.getAttribute('frameborder') || '0') : '0';
        },
      },
      allow: {
        default: null,
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.getAttribute('allow');
          }
          const iframe = element.querySelector('iframe');
          return iframe ? iframe.getAttribute('allow') : null;
        },
      },
      allowfullscreen: {
        default: true,
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.hasAttribute('allowfullscreen');
          }
          const iframe = element.querySelector('iframe');
          return iframe ? iframe.hasAttribute('allowfullscreen') : true;
        },
      },
      loading: {
        default: 'lazy',
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.getAttribute('loading') || 'lazy';
          }
          const iframe = element.querySelector('iframe');
          return iframe ? (iframe.getAttribute('loading') || 'lazy') : 'lazy';
        },
      },
      style: {
        default: null,
        parseHTML: element => {
          if (element.tagName === 'IFRAME') {
            return element.getAttribute('style');
          }
          const iframe = element.querySelector('iframe');
          return iframe ? iframe.getAttribute('style') : null;
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('align') || 'center',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
      {
        tag: 'div[data-iframe]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const { src, width, height, frameborder, allow, allowfullscreen, loading, style: iframeStyle, align } = HTMLAttributes;

    // Convert align value to container styles
    let containerStyle = '';

    if (align === 'full') {
      containerStyle = 'display: block; width: 100%; margin-left: auto; margin-right: auto;';
    } else if (align === 'center') {
      containerStyle = 'display: block; margin-left: auto; margin-right: auto;';
    } else if (align === 'left') {
      containerStyle = 'float: left; margin-right: 1rem; max-width: 50%;';
    } else if (align === 'right') {
      containerStyle = 'float: right; margin-left: 1rem; max-width: 50%;';
    }

    const iframeAttrs: Record<string, any> = {
      src,
      width,
      height,
      frameborder,
      style: iframeStyle || `border-radius: 12px; width: ${width}; height: ${height}px;`,
    };

    if (allow) {
      iframeAttrs.allow = allow;
    }

    if (allowfullscreen) {
      iframeAttrs.allowfullscreen = 'true';
    }

    if (loading) {
      iframeAttrs.loading = loading;
    }

    return [
      'div',
      {
        class: 'iframe-embed my-6',
        'data-iframe': '',
        style: `position: relative; margin: 1.5rem 0; width: 100%; ${containerStyle}`,
        align,
      },
      ['iframe', iframeAttrs],
    ];
  },
});

const AudioExtension = TiptapNode.create({
  name: 'audio',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => {
          // Try to get src from audio element directly
          if (element.tagName === 'AUDIO') {
            return element.getAttribute('src');
          }
          // Try to get src from div[data-audio] > audio element
          const audioElement = element.querySelector('audio');
          if (audioElement) {
            return audioElement.getAttribute('src');
          }
          return null;
        },
        renderHTML: attributes => {
          if (attributes.src) {
            return {
              src: attributes.src,
            }
          }
          return {}
        }
      },
      controls: {
        default: true,
        parseHTML: element => {
          if (element.tagName === 'AUDIO') {
            return element.hasAttribute('controls');
          }
          const audioElement = element.querySelector('audio');
          return audioElement ? audioElement.hasAttribute('controls') : true;
        },
        renderHTML: attributes => {
          if (attributes.controls !== false) {
            return {
              controls: 'true',
            }
          }
          return {}
        }
      },
      align: {
        default: 'center',
        parseHTML: element => {
          if (element.tagName === 'AUDIO') {
            return element.getAttribute('align') || 'center';
          }
          return element.getAttribute('align') || 'center';
        },
        renderHTML: attributes => {
          return {
            align: attributes.align || 'center',
          }
        }
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
      },
      {
        tag: 'div[data-audio]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const { src, controls, align } = HTMLAttributes;

    // Convert align value to HTML attributes and inline styles
    let style = '';
    let alignAttr = align;

    if (align === 'full') {
      style = 'display: block; width: 100%; margin-left: auto; margin-right: auto;';
      alignAttr = 'center';
    } else if (align === 'center') {
      style = 'display: block; margin-left: auto; margin-right: auto;';
    } else if (align === 'left') {
      style = 'float: left; margin-right: 1rem; max-width: 50%;';
    } else if (align === 'right') {
      style = 'float: right; margin-left: 1rem; max-width: 50%;';
    }

    const audioAttrs: Record<string, any> = {
      controls: controls !== false ? 'controls' : undefined,
      style: `margin: 1.5rem 0; width: 100%; max-width: 600px; ${style}`,
    };

    // Add src attribute if it exists
    if (src) {
      audioAttrs.src = src;
    }

    if (alignAttr) {
      audioAttrs.align = alignAttr;
    }

    return [
      'div',
      {
        class: 'audio-embed my-6',
        'data-audio': '',
        style: `position: relative; margin: 1.5rem 0; width: 100%; ${style}`,
        align: alignAttr,
      },
      ['audio', audioAttrs],
    ];
  },
});

// Custom extension for PDF files
const PdfExtension = TiptapNode.create({
  name: 'pdf',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.querySelector('iframe')?.getAttribute('src') || null,
        renderHTML: attributes => {
          return {
            'data-pdf-src': attributes.src || null,
          }
        }
      },
      title: {
        default: 'PDF Document',
        parseHTML: element => element.querySelector('iframe')?.getAttribute('title') || 'PDF Document',
        renderHTML: attributes => {
          return {
            'data-pdf-title': attributes.title || 'PDF Document',
          }
        }
      },
      size: {
        default: 'medium', // small, medium, large
        parseHTML: element => element.getAttribute('data-pdf-size') || 'medium',
        renderHTML: attributes => {
          return {
            'data-pdf-size': attributes.size || 'medium',
          }
        }
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('align') || 'center',
        renderHTML: attributes => {
          return {
            align: attributes.align || 'center',
          }
        }
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-pdf]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const { src, title, size, align, 'data-pdf-src': dataPdfSrc } = HTMLAttributes;

    // Use data-pdf-src if src is not available
    const pdfSrc = src || dataPdfSrc;


    // Fixed height for all PDF sizes
    const height = '1200px';

    // Convert align value to HTML attributes and inline styles
    let style = '';
    let alignAttr = align;

    if (align === 'full') {
      style = 'display: block; width: 100%; margin-left: auto; margin-right: auto;';
      alignAttr = 'center';
    } else if (align === 'center') {
      style = 'display: block; margin-left: auto; margin-right: auto;';
    } else if (align === 'left') {
      style = 'float: left; margin-right: 1rem; max-width: 50%;';
    } else if (align === 'right') {
      style = 'float: right; margin-left: 1rem; max-width: 50%;';
    }

    return [
      'div',
      {
        class: 'pdf-embed my-6',
        'data-pdf': '',
        'data-pdf-src': src,
        'data-pdf-title': title,
        'data-pdf-size': size,
        style: `position: relative; margin: 1.5rem 0; width: 100%; ${style}`,
        align: alignAttr
      },
      ['iframe', {
        src: pdfSrc,
        width: '100%',
        height: height,
        frameborder: '0',
        style: `width: 100%; height: ${height}; border: 1px solid #e5e7eb; border-radius: 0.375rem; aspect-ratio: 1 / 1.414;`,
        title: title || 'PDF Document'
      }],
    ];
  },
});

// Helper function to upload PDF to Cloudinary using raw upload
const uploadPdfToCloudinary = async (file: File): Promise<string> => {
  return await uploadRawToCloudinary(file);
};

// Helper function to extract video ID from URLs
const getVideoId = (url: string, provider: 'youtube' | 'vimeo'): string | null => {
  if (provider === 'youtube') {
    // Match YouTube URL patterns - simplified and more reliable regex
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const match = url.match(youtubeRegex);

    if (match) {
      return match[1];
    }

    // Fallback: try to extract from watch?v= parameter
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (watchMatch) {
      return watchMatch[1];
    }

    // Another fallback for youtu.be links
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (shortMatch) {
      return shortMatch[1];
    }

    return null;
  } else if (provider === 'vimeo') {
    // Match Vimeo URL patterns
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/i;
    const match = url.match(vimeoRegex);
    return match ? match[1] : null;
  }
  return null;
};

// Stil sınıfları için sabit
const editorClasses = 'prose prose-sm sm:prose lg:prose-lg prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-sm prose-p:my-3 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-img:rounded-md prose-img:mx-auto focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0';

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  className = '',
  placeholder = 'Write your content here...',
}) => {
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'code'>('edit');
  const [htmlContent, setHtmlContent] = useState(content);
  const [isVideoMenuOpen, setIsVideoMenuOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoProvider, setVideoProvider] = useState<'youtube' | 'vimeo'>('youtube');
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [selectedImageNode, setSelectedImageNode] = useState<any>(null);
  const [selectedVideoNode, setSelectedVideoNode] = useState<any>(null);
  const [selectedAudioNode, setSelectedAudioNode] = useState<any>(null);
  const [selectedIframeNode, setSelectedIframeNode] = useState<any>(null);
  const [selectedNodeAlign, setSelectedNodeAlign] = useState<string>('center');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Update htmlContent when content prop changes
  useEffect(() => {
    setHtmlContent(content);
  }, [content]);

  // Initialize editor with initial content
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'my-4 whitespace-pre-wrap',
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'font-bold mt-6 mb-3 whitespace-pre-wrap',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'pl-6 my-4 list-disc space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'pl-6 my-4 list-decimal space-y-2',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'my-1 whitespace-pre-wrap',
          },
        },
        hardBreak: {
          keepMarks: false,
          HTMLAttributes: {
            class: 'whitespace-pre-wrap',
          },
        },
      }),
      ImageResize.configure({
        inline: true,
        HTMLAttributes: {
          class: 'tiptap-resize-image',
          style: 'display: inline-block; max-width: 100%'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        validate: href => /^https?:\/\//.test(href),
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      VideoExtension,
      IframeExtension,
      AudioExtension,
      PdfExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setHtmlContent(html);
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if the selection contains an image
      const imageNode = editor.isActive('image') ? editor.getAttributes('image') : null;
      setSelectedImageNode(imageNode);

      // Check if the selection contains a video - sadece manuel seçimde
      const videoNode = editor.isActive('video') ? editor.getAttributes('video') : null;

      // Video seçimini sadece resize handle'a tıklandığında aktif et
      if (videoNode) {
        const selection = editor.state.selection;
        const { $from } = selection;
        const node = $from.node();

        // Eğer video node'u seçiliyse ama resize handle'a tıklanmamışsa seçimi kaldır
        if (node && node.type.name === 'video') {
          // Video seçimini sadece resize handle ile yapılabilir hale getir
          const videoElement = document.querySelector('.ProseMirror .video-embed.ProseMirror-selectednode');
          if (videoElement && !videoElement.querySelector('.video-resize-handle:hover')) {
            // Video seçimini kaldır
            editor.commands.blur();
          }
        }
      }

      setSelectedVideoNode(videoNode);

      // Check if the selection contains an audio
      const audioNode = editor.isActive('audio') ? editor.getAttributes('audio') : null;
      setSelectedAudioNode(audioNode);

      // Check if the selection contains an iframe
      const iframeNode = editor.isActive('iframe') ? editor.getAttributes('iframe') : null;
      setSelectedIframeNode(iframeNode);

      // Update selected node alignment
      if (imageNode) {
        setSelectedNodeAlign(imageNode.align || 'center');
      } else if (videoNode) {
        setSelectedNodeAlign(videoNode.align || 'center');
      } else if (audioNode) {
        setSelectedNodeAlign(audioNode.align || 'center');
      } else if (iframeNode) {
        setSelectedNodeAlign(iframeNode.align || 'center');
      }
    },
    editorProps: {
      attributes: {
        class: editorClasses + ' outline-none border-none ring-0 ring-offset-0 min-h-[300px]',
        placeholder,
        spellcheck: 'false',
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editor content when html content changes in code view
  useEffect(() => {
    if (viewMode === 'edit' && editor && htmlContent !== editor.getHTML()) {
      editor.commands.setContent(htmlContent);
    }
  }, [viewMode, htmlContent, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadImageToCloudinary(file);

      setImageUrl(imageUrl);

      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is audio - support both MIME type and file extension
    const validAudioTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/wave',
      'audio/x-wav', 'audio/x-wav', 'audio/ogg', 'audio/aac', 'audio/flac',
      'audio/webm', 'audio/x-m4a'
    ];
    const validAudioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm', '.wma'];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    // WAV dosyaları için MIME type kontrolü - bazen boş olabilir
    const isValidAudioType = file.type.startsWith('audio/') || validAudioTypes.includes(file.type);
    const isValidAudioExtension = validAudioExtensions.includes(fileExtension);

    if (!isValidAudioType && !isValidAudioExtension) {
      alert('Please select an audio file (MP3, WAV, OGG, M4A, AAC, FLAC, WEBM, WMA formats are supported)');
      return;
    }

    // Cloudinary maksimum dosya boyutu: 50MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > MAX_FILE_SIZE) {
      alert(
        `Dosya boyutu çok büyük!\n\n` +
        `Dosya boyutu: ${fileSizeMB} MB\n` +
        `Maksimum boyut: 50 MB\n\n` +
        `Lütfen dosyayı sıkıştırın veya daha küçük bir dosya seçin.\n` +
        `WAV dosyaları genellikle büyük olduğu için MP3 formatına dönüştürmenizi öneririz.`
      );
      return;
    }

    try {
      setIsAudioUploading(true);

      // Upload audio using raw upload endpoint
      const audioUrlResult = await uploadAudioToCloudinary(file);

      // Set the uploaded URL to state
      setAudioUrl(audioUrlResult);

      // Otomatik olarak editöre ekle (MP3 gibi)
      if (editor && audioUrlResult) {
        const audioAttrs = {
          src: audioUrlResult,
          controls: true,
          align: 'center'
        };

        editor
          .chain()
          .focus()
          .insertContent({
            type: 'audio',
            attrs: audioAttrs
          })
          .run();

        // State'i temizle ve menüyü kapat
        setAudioUrl('');
        setIsAudioMenuOpen(false);
      }

      setIsAudioUploading(false);
    } catch (error: any) {
      console.error("Error uploading audio:", error);
      setIsAudioUploading(false);

      // Hata mesajını daha açıklayıcı göster
      let errorMessage = 'Audio dosyası yüklenirken bir hata oluştu.';

      if (error?.message?.includes('File size too large')) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        errorMessage = `Dosya boyutu çok büyük!\n\n` +
          `Dosya boyutu: ${fileSizeMB} MB\n` +
          `Maksimum boyut: 50 MB\n\n` +
          `Lütfen dosyayı sıkıştırın veya daha küçük bir dosya seçin.\n` +
          `WAV dosyaları genellikle büyük olduğu için MP3 formatına dönüştürmenizi öneririz.`;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    try {
      setIsPdfUploading(true);

      // Upload PDF using raw upload endpoint
      const pdfUrl = await uploadPdfToCloudinary(file);


      // Insert PDF into editor
      if (editor) {
        const pdfAttrs = {
          src: pdfUrl,
          title: file.name.replace('.pdf', ''),
          size: 'medium'
        };


        editor
          .chain()
          .focus()
          .insertContent({
            type: 'pdf',
            attrs: pdfAttrs
          })
          .run();
      }

      setIsPdfUploading(false);
      setIsPdfMenuOpen(false);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setIsPdfUploading(false);
    }
  };

  const insertImage = () => {
    if (editor && imageUrl) {
      // First insert the image
      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
          alt: 'Blog image',
        })
        .run();

      // Then separately update the attributes for width/height
      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          width: '100%',
          height: 'auto'
        })
        .run();

      setImageUrl('');
      setIsImageMenuOpen(false);
    }
  };

  const updateSelectedImage = () => {
    if (editor && selectedImageNode) {
      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          align: selectedNodeAlign
        })
        .run();
    }
  };

  const insertVideo = () => {
    if (editor && videoUrl) {
      const videoId = getVideoId(videoUrl, videoProvider);

      if (videoId) {
        const videoAttrs = {
          videoId,
          provider: videoProvider,
          width: '100%',
          height: '400px'
        };

        editor
          .chain()
          .focus()
          .insertContent({
            type: 'video',
            attrs: videoAttrs
          })
          .run();

        setVideoUrl('');
        setIsVideoMenuOpen(false);
      } else {
        // URL'den video ID çıkarılamadığında kullanıcıya daha yardımcı bir mesaj göster
        alert(`Geçersiz ${videoProvider === 'youtube' ? 'YouTube' : 'Vimeo'} URL'si. Lütfen doğru bir bağlantı girin.\n\nÖrnek: ${videoProvider === 'youtube'
          ? 'https://www.youtube.com/watch?v=abcdefghijk veya https://youtu.be/abcdefghijk'
          : 'https://vimeo.com/123456789'
          }\n\nGirilen URL: ${videoUrl}`);
      }
    }
  };

  const updateSelectedVideo = () => {
    if (editor && selectedVideoNode) {
      editor
        .chain()
        .focus()
        .updateAttributes('video', {
          align: selectedNodeAlign
        })
        .run();
    }
  };

  const insertAudio = () => {
    if (editor && audioUrl) {
      const audioAttrs = {
        src: audioUrl,
        controls: true,
        align: 'center'
      };

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'audio',
          attrs: audioAttrs
        })
        .run();

      setAudioUrl('');
      setIsAudioMenuOpen(false);
    }
  };

  const updateSelectedAudio = () => {
    if (editor && selectedAudioNode) {
      editor
        .chain()
        .focus()
        .updateAttributes('audio', {
          align: selectedNodeAlign
        })
        .run();
    }
  };

  const updateSelectedIframe = () => {
    if (editor && selectedIframeNode) {
      editor
        .chain()
        .focus()
        .updateAttributes('iframe', {
          align: selectedNodeAlign
        })
        .run();
    }
  };

  const insertLink = () => {
    if (editor && linkUrl) {
      // Check if URL has protocol
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

      // Check if there's selected text
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

      if (selectedText) {
        // If text is selected, make it a link
        editor
          .chain()
          .focus()
          .setLink({ href: url })
          .run();
      } else if (linkText) {
        // If link text is provided, insert it as a link
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}" class="text-blue-600 underline">${linkText}</a>`)
          .run();
      } else {
        // If no text is selected and no link text, insert the URL as clickable text
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}" class="text-blue-600 underline">${url}</a>`)
          .run();
      }

      setLinkUrl('');
      setLinkText('');
      setIsLinkMenuOpen(false);
    }
  };

  const removeLink = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run();
    }
  };

  const setColor = (color: string) => {
    if (editor) {
      // Seçili text varsa ona renk uygula
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);

      if (selectedText) {
        // Seçili text'e renk uygula
        editor
          .chain()
          .focus()
          .setColor(color)
          .run();
      } else {
        // Cursor pozisyonuna renk uygula
        editor
          .chain()
          .focus()
          .setColor(color)
          .run();
      }

      setSelectedColor(color);
    }
  };

  // Fonksiyon ekleyelim: HTML'i görsel olarak daha güzel formatlayalım
  const formatHtml = (html: string): string => {
    // Basit bir şekilde HTML'i daha okunabilir hale getirelim
    let formatted = html
      .replace(/></g, '>\n<') // Her tag'ı yeni satıra geçir
      .replace(/<\/([^>]+)>/g, '</$1>\n') // Kapanış tag'larından sonra yeni satır
      .replace(/<([^\/][^>]+)>/g, '\n<$1>') // Açılış tag'larından önce yeni satır
      .replace(/\n\s*\n/g, '\n'); // Fazla boş satırları temizle

    // Girintileri ekleyelim
    let indentLevel = 0;
    const lines = formatted.split('\n');
    formatted = lines.map(line => {
      line = line.trim();
      if (!line) return line;

      // Kapanış tag'ı ise girinti azalt
      if (line.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Mevcut girinti seviyesine göre boşluk ekle
      const indent = '  '.repeat(indentLevel);
      const result = indent + line;

      // Açılış tag'ı ise (kapanışı aynı satırda değilse) girinti arttır
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>') && !line.includes('</')) {
        indentLevel++;
      }

      return result;
    }).join('\n');

    return formatted;
  };

  // HTML içerik değiştiğinde formatlayalım
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  // HTML kod editörüne geçerken formatla
  const switchToCodeView = () => {
    if (viewMode !== 'code') {
      const formattedHtml = editor ? formatHtml(editor.getHTML()) : htmlContent;
      setHtmlContent(formattedHtml);
      setViewMode('code');
    }
  };

  // Focus the editor on mount
  useEffect(() => {
    setTimeout(() => {
      editor?.commands.focus('end');


      // Görüntü ve video boyutlandırma sorununu düzeltmek için ölçeklendirilmesini sağlayalım
      if (editor) {
        // Görüntüleri boyutlandır
        const images = document.querySelectorAll('.ProseMirror img');
        images.forEach((img) => {
          // TypeScript için HTMLImageElement türünü belirtelim
          const imageElement = img as HTMLImageElement;

          // Görüntünün orijinal boyutlarını koruyalım, ancak çok büyükse ölçeklendirelim
          if (imageElement.naturalWidth > 800) {
            imageElement.setAttribute('width', '800');
            imageElement.style.height = 'auto';
            imageElement.style.maxWidth = '100%';
          } else {
            // Orijinal boyutunu koruyalım
            imageElement.setAttribute('width', imageElement.naturalWidth.toString());
            imageElement.style.height = 'auto';
          }
        });

        // Video yeniden boyutlandırma işlemleri
        const videos = document.querySelectorAll('.ProseMirror .video-embed');
        videos.forEach((videoContainer) => {
          // Video containerına boyutlandırma işaretçilerini ekle
          const iframe = videoContainer.querySelector('iframe');
          if (iframe) {
            videoContainer.classList.add('resizable-container');

            // Video boyutlarını sakla
            const width = iframe.getAttribute('width') || '100%';
            const height = iframe.getAttribute('height') || '400px';

            videoContainer.setAttribute('data-original-width', width);
            videoContainer.setAttribute('data-original-height', height);

            // Video'ya tıklanmadığında seçimi engelle
            videoContainer.addEventListener('mousedown', (e) => {
              // Eğer iframe'e tıklanmışsa seçimi engelle
              if (e.target === iframe) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            });

            // Video container'a tıklanmadığında seçimi engelle
            videoContainer.addEventListener('click', (e) => {
              if (e.target === videoContainer || e.target === iframe) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            });
          }
        });

        // Video boyutlandırma özelliğini kaldırdık - video'lar tam genişlikte görünecek
      }
    }, 100);
  }, [editor]);

  // To avoid issues with menu popping up when creating links or images
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isLinkMenuOpen && linkInputRef.current && !linkInputRef.current.contains(event.target as Node)) {
        setIsLinkMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLinkMenuOpen]);

  const colorOptions = [
    '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
    '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6',
    '#f2f2f2', '#ffffff', '#ff0000', '#ff9900', '#ffff00',
    '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff'
  ];

  // Function to set alignment for selected node
  const setNodeAlignment = (align: string) => {
    if (!editor) return;

    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { align }).run();
      setSelectedNodeAlign(align);
      updateSelectedImage();
    } else if (editor.isActive('video')) {
      editor.chain().focus().updateAttributes('video', { align }).run();
      setSelectedNodeAlign(align);
      updateSelectedVideo();
    } else if (editor.isActive('audio')) {
      editor.chain().focus().updateAttributes('audio', { align }).run();
      setSelectedNodeAlign(align);
      updateSelectedAudio();
    } else if (editor.isActive('iframe')) {
      editor.chain().focus().updateAttributes('iframe', { align }).run();
      setSelectedNodeAlign(align);
      updateSelectedIframe();
    }
  };

  // Özel CSS stili ekleyelim
  useEffect(() => {
    // Görüntü boyutlandırma için özel CSS ekle
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Ana resim stilleri */
      .tiptap-resize-image {
        display: inline-block;
        max-width: 100%;
        height: auto;
        transition: all 0.2s ease;
      }
      
      /* TipTap tarafından eklenen boyutlandırma işaretlerini ve kontrolleri iyileştir */
      .ProseMirror-selectednode {
        outline: 2px solid #0096fd;
        border-radius: 2px;
      }
      
      /* Resize kontrollerini özelleştir */
      .image-resizer {
        display: inline-flex;
        position: relative;
        flex-grow: 0;
      }
      
      .image-resizer .resize-trigger {
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 12px;
        height: 12px;
        background-color: #0096fd;
        border-radius: 50%;
        border: 2px solid white;
        opacity: 1;
        cursor: se-resize;
        z-index: 10;
      }
      
      /* Boyutlandırma sırasında tıklama olaylarını engelle */
      .image-resizer.resizing * {
        pointer-events: none;
      }
      
      /* Görüntü seçildiğinde çerçeve ekle */
      .image-resizer.ProseMirror-selectednode img {
        border: 2px solid #0096fd;
        border-radius: 2px;
      }
      
      /* Video boyutlandırma stilleri */
      .resizable-video {
        position: relative;
        display: block;
        width: 100%;
        margin: 1em auto;
        transition: all 0.2s ease;
      }
      
      .resizable-video.resizing {
        outline: 2px dashed #0096fd;
      }
      
      .resizable-video iframe {
        display: block;
        width: 100%;
        height: 400px;
        margin: 0 auto;
      }
      
      .video-resize-handle {
        position: absolute;
        right: -10px;
        bottom: 0;
        width: 20px;
        height: 20px;
        background-color: #0096fd;
        border-radius: 50%;
        border: 2px solid white;
        cursor: e-resize;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 10;
      }
      
      .resizable-video:hover .video-resize-handle {
        opacity: 1;
      }
      
      .resizable-container {
        position: relative;
        width: 100%;
        max-width: 100%;
      }
      
      /* ProseMirror seçimi video için */
      .ProseMirror-selectednode.video-embed {
        outline: 2px solid #0096fd;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rounded-md ${className}`}>
      <div className="flex flex-col border-b bg-gray-50">
        {/* Text formatting toolbar - First row */}
        <div className="flex flex-wrap gap-1 p-2 border-b">
          <div className="flex gap-1 items-center mr-2">
            <Button
              size="icon"
              variant={editor.isActive('bold') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleBold().run()}
              type="button"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive('italic') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              type="button"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive('underline') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              type="button"
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive('code') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleCode().run()}
              type="button"
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1 items-center mr-2">
            <Button
              size="icon"
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              type="button"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              type="button"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              type="button"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              type="button"
              title="Align Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1 items-center mr-2">
            <div className="relative group">
              <Button
                size="icon"
                variant="outline"
                onClick={() => { }}
                onMouseOver={() => setSelectedColor(editor.getAttributes('textStyle').color || '#000000')}
                type="button"
                title="Text Color"
              >
                <Palette className="h-4 w-4" style={{ color: selectedColor }} />
              </Button>
              <div className="absolute hidden group-hover:flex top-full left-0 mt-1 p-2 bg-white border rounded-md shadow-md z-10 flex-wrap gap-1 max-w-[220px]">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-5 h-5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setColor(color);
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Structure formatting toolbar - Second row */}
        <div className="flex flex-wrap gap-1 p-2">
          <div className="flex gap-1 items-center mr-2">
            <Button
              size="icon"
              variant={editor?.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              type="button"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor?.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              type="button"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor?.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              type="button"
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1 items-center mr-2">
            <Button
              size="icon"
              variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              type="button"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              type="button"
              title="Ordered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1 items-center mr-2">
            <div className="relative">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsLinkMenuOpen(!isLinkMenuOpen)}
                type="button"
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              {isLinkMenuOpen && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded-md shadow-md z-10 flex flex-col gap-2 min-w-[300px]" ref={linkInputRef}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Link Text (Optional)</label>
                    <Input
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Link text..."
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">URL</label>
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full"
                      onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLinkUrl('');
                        setLinkText('');
                        setIsLinkMenuOpen(false);
                      }}
                      type="button"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={insertLink}
                      type="button"
                      disabled={!linkUrl}
                      className="flex-1"
                    >
                      Add Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {editor?.isActive('link') && (
              <Button
                size="icon"
                variant="outline"
                onClick={removeLink}
                type="button"
                title="Remove Link"
              >
                <Unlink className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-1 items-center">
            <div className="relative">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsImageMenuOpen(!isImageMenuOpen)}
                type="button"
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              {isImageMenuOpen && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-md shadow-md z-10 flex flex-col gap-2 min-w-[300px]">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-medium">Image URL</label>
                    <div className="flex gap-2">
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full"
                        onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                      />
                    </div>
                  </div>

                  <Button size="sm" onClick={insertImage} type="button" disabled={!imageUrl}>
                    Insert Image
                  </Button>

                  <Separator className="my-2" />

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-medium">Upload Image</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    {!isUploading && !imageUrl && (
                      <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        className="w-full"
                      >
                        Choose Image
                      </Button>
                    )}

                    {isUploading && (
                      <div className="flex items-center justify-center p-2 bg-gray-50 rounded border">
                        <div className="animate-pulse text-sm">Uploading...</div>
                      </div>
                    )}

                    {imageUrl && (
                      <div className="space-y-2">
                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-medium">Image Preview</label>
                          <div className="relative aspect-video border rounded overflow-hidden bg-gray-50">
                            <img
                              src={imageUrl}
                              alt="Image preview"
                              className="object-contain w-full h-full"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-medium">Cloudinary URL</label>
                          <Input
                            value={imageUrl}
                            readOnly
                            className="text-xs bg-gray-50"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                        </div>

                        <div className="flex justify-between gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setImageUrl("");
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            type="button"
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            onClick={insertImage}
                            type="button"
                          >
                            Insert Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Button */}
            <div className="relative">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsVideoMenuOpen(!isVideoMenuOpen)}
                type="button"
                title="Insert Video"
              >
                <VideoIcon className="h-4 w-4" />
              </Button>
              {isVideoMenuOpen && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-md shadow-md z-10 flex flex-col gap-2 min-w-[300px]">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-medium">Video URL (YouTube or Vimeo)</label>
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={videoProvider === 'youtube' ? 'default' : 'outline'}
                      onClick={() => setVideoProvider('youtube')}
                      type="button"
                      className="flex-1"
                    >
                      <Youtube className="h-4 w-4 mr-1" />
                      YouTube
                    </Button>
                    <Button
                      size="sm"
                      variant={videoProvider === 'vimeo' ? 'default' : 'outline'}
                      onClick={() => setVideoProvider('vimeo')}
                      type="button"
                      className="flex-1"
                    >
                      <VideoIcon className="h-4 w-4 mr-1" />
                      Vimeo
                    </Button>
                  </div>

                  <Button size="sm" onClick={insertVideo} type="button" disabled={!videoUrl}>
                    Insert Video
                  </Button>
                </div>
              )}
            </div>

            {/* Audio Button */}
            <div className="relative">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                type="button"
                title="Insert Audio"
              >
                <Music className="h-4 w-4" />
              </Button>
              {isAudioMenuOpen && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded-md shadow-md z-10 flex flex-col gap-2 min-w-[300px]">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-medium">Upload Audio File</label>
                    <input
                      type="file"
                      ref={audioInputRef}
                      onChange={handleAudioUpload}
                      className="hidden"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm,.wma"
                    />
                    {!isAudioUploading && !audioUrl && (
                      <Button
                        size="sm"
                        onClick={() => audioInputRef.current?.click()}
                        type="button"
                        className="w-full"
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Choose Audio File
                      </Button>
                    )}

                    {isAudioUploading && (
                      <div className="flex items-center justify-center p-2 bg-gray-50 rounded border">
                        <div className="animate-pulse text-sm">Uploading audio...</div>
                      </div>
                    )}

                    {audioUrl && (
                      <div className="space-y-2">
                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-medium">Cloudinary URL</label>
                          <Input
                            value={audioUrl}
                            readOnly
                            className="text-xs bg-gray-50"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                        </div>

                        <div className="flex justify-between gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAudioUrl("");
                              if (audioInputRef.current) audioInputRef.current.value = "";
                            }}
                            type="button"
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            onClick={insertAudio}
                            type="button"
                          >
                            Insert Audio
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-2" />

                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-medium">Or Enter Audio URL</label>
                    <Input
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      className="w-full"
                      onKeyDown={(e) => e.key === 'Enter' && insertAudio()}
                    />
                    <Button size="sm" onClick={insertAudio} type="button" disabled={!audioUrl}>
                      Insert Audio
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Button */}
            <div className="relative">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsPdfMenuOpen(!isPdfMenuOpen)}
                type="button"
                title="Insert PDF"
              >
                <FileText className="h-4 w-4" />
              </Button>
              {isPdfMenuOpen && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded-md shadow-md z-10 flex flex-col gap-2 min-w-[300px]">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-medium">Upload PDF Document</label>
                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      className="hidden"
                      accept=".pdf,application/pdf"
                    />
                    {!isPdfUploading && (
                      <Button
                        size="sm"
                        onClick={() => pdfInputRef.current?.click()}
                        type="button"
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Choose PDF File
                      </Button>
                    )}

                    {isPdfUploading && (
                      <div className="flex items-center justify-center p-2 bg-gray-50 rounded border">
                        <div className="animate-pulse text-sm">Uploading PDF...</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resize controls for selected image, video or audio */}
        {(selectedImageNode || selectedVideoNode || selectedAudioNode || selectedIframeNode) && (
          <div className="flex flex-wrap gap-1 p-2 border-t bg-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Move className="h-4 w-4" />
              {selectedImageNode ? 'Görsel' : selectedVideoNode ? 'Video' : selectedAudioNode ? 'Ses' : 'Embed'} Hizalama:
            </div>

            <div className="flex gap-1 items-center ml-2">
              <Button
                size="icon"
                variant={selectedNodeAlign === 'left' ? 'default' : 'outline'}
                onClick={() => setNodeAlignment('left')}
                type="button"
                title="Sola Hizala"
                className="h-6 w-6"
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant={selectedNodeAlign === 'center' ? 'default' : 'outline'}
                onClick={() => setNodeAlignment('center')}
                type="button"
                title="Ortala"
                className="h-6 w-6"
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant={selectedNodeAlign === 'right' ? 'default' : 'outline'}
                onClick={() => setNodeAlignment('right')}
                type="button"
                title="Sağa Hizala"
                className="h-6 w-6"
              >
                <AlignRight className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant={selectedNodeAlign === 'full' ? 'default' : 'outline'}
                onClick={() => setNodeAlignment('full')}
                type="button"
                title="Tam Genişlik"
                className="h-6 w-6"
              >
                <AlignJustify className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Third row - View mode toggle */}
        <div className="flex flex-wrap gap-1 p-2 border-t">
          <div className="flex gap-1 items-center">
            <div className="border rounded-md overflow-hidden flex shadow-sm">
              <Button
                size="sm"
                variant={viewMode === 'edit' ? "default" : "ghost"}
                onClick={() => setViewMode('edit')}
                type="button"
                className="rounded-none border-0 py-1 px-3 h-8"
              >
                <Eye className="h-4 w-4 mr-1" />
                Görsel Editör
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <Button
                size="sm"
                variant={viewMode === 'code' ? "default" : "ghost"}
                onClick={switchToCodeView}
                type="button"
                className="rounded-none border-0 py-1 px-3 h-8"
              >
                <Code className="h-4 w-4 mr-1" />
                HTML Kodu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'edit' && (
        <div className="relative border-0 outline-none" ref={editorContainerRef}>
          <EditorContent
            editor={editor}
            className={`editor-content ${editorClasses} focus-visible:outline-none focus-visible:ring-0 border-0`}
          />
          {!editor?.getText() && (
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
              {placeholder}
            </div>
          )}
        </div>
      )}

      {viewMode === 'code' && (
        <div className="relative border-0">
          <Textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className="min-h-[400px] max-h-full font-mono p-4 w-full border-0 focus-visible:ring-0 focus-visible:outline-none whitespace-pre-wrap text-sm"
            placeholder="HTML kodunu buraya girin..."
          />
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white"
              onClick={() => {
                if (editor) {
                  const formattedHtml = formatHtml(editor.getHTML());
                  setHtmlContent(formattedHtml);
                }
              }}
            >
              HTML Düzenle
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Root element */
        .tiptap {
          outline: none !important;
          border: none !important;
        }
        
        /* Editor content */
        .editor-content {
          min-height: 300px;
          padding: 1rem;
          overflow-y: auto;
          outline: none !important;
          border: none !important;
        }
        
        /* ProseMirror content spacing */
        .ProseMirror {
          min-height: 300px;
          padding: 1rem;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: inherit;
          line-height: 1.6;
        }
        
        /* ProseMirror text nodes */
        .ProseMirror .text {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: inherit;
        }
        
        /* ProseMirror paragraph content */
        .ProseMirror p .text {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* Space character handling */
        .ProseMirror p {
          white-space: pre-wrap;
          word-spacing: normal;
        }
        
        /* Ensure spaces are preserved */
        .ProseMirror * {
          white-space: inherit;
        }
        
        /* Link styles */
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .ProseMirror a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        /* Video spacing - tam genişlik */
        .ProseMirror .video-embed {
          margin: 1.5rem 0;
          clear: both;
          width: 100%;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Video iframe - tam genişlik */
        .ProseMirror .video-embed iframe {
          width: 100% !important;
          height: 400px;
          pointer-events: auto;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* Video container hover - sadece hafif outline */
        .ProseMirror .video-embed:hover {
          outline: 1px solid #e5e7eb;
          border-radius: 4px;
        }
        
        /* Video seçili değilken */
        .ProseMirror .video-embed:not(.ProseMirror-selectednode) {
          outline: none;
        }
        
        /* Video seçimini engelle */
        .ProseMirror .video-embed {
          cursor: default;
        }
        
        .ProseMirror .video-embed:hover {
          cursor: default;
        }
        
        /* Video seçimini engelle */
        .ProseMirror .video-embed * {
          pointer-events: none;
        }
        
        /* Iframe embed styles (Spotify, SoundCloud, etc.) */
        .ProseMirror .iframe-embed {
          margin: 1.5rem 0;
          clear: both;
          width: 100%;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .ProseMirror .iframe-embed iframe {
          width: 100% !important;
          border-radius: 12px;
          display: block;
        }
        
        .ProseMirror .iframe-embed:hover {
          outline: 1px solid #e5e7eb;
          border-radius: 12px;
        }
        
        .ProseMirror .iframe-embed.ProseMirror-selectednode {
          outline: 2px solid #0096fd;
          border-radius: 12px;
        }
        
        /* Audio styles */
        .ProseMirror .audio-embed {
          margin: 1.5rem 0;
          clear: both;
          width: 100%;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .ProseMirror .audio-embed audio {
          width: 100%;
          max-width: 600px;
          display: block;
        }
        
        .ProseMirror .audio-embed:hover {
          outline: 1px solid #e5e7eb;
          border-radius: 4px;
        }
        
        .ProseMirror .audio-embed.ProseMirror-selectednode {
          outline: 2px solid #0096fd;
          border-radius: 4px;
        }
        
        /* PDF styles */
        .ProseMirror .pdf-embed {
          margin: 1.5rem 0;
          clear: both;
          width: 100%;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
เกี่ยวข้อง}
        
        .ProseMirror .pdf-embed iframe {
          width: 100% !important;
          height: 1200px !important;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .ProseMirror .pdf-embed:hover iframe {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Image spacing */
        .ProseMirror img {
          margin: 1rem 0;
          clear: both;
        }
        
        /* Paragraph spacing */
        .ProseMirror p {
          margin: 0.75rem 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* Heading spacing */
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, 
        .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
          margin: 1.5rem 0 0.75rem 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* Text content whitespace handling */
        .ProseMirror .text {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* List items whitespace */
        .ProseMirror li {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* Base styles for ProseMirror */
        .ProseMirror {
          outline: none !important;
          border: none !important;
        }
        
        /* Basic content styling */
        .editor-content h1, .editor-content h2, .editor-content h3, 
        .editor-content h4, .editor-content h5, .editor-content h6 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .editor-content p {
          margin-bottom: 0.75rem;
        }
        
        .editor-content ul, .editor-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        /* Video styles */
        .video-embed {
          position: relative;
          margin: 1rem 0;
          border-radius: 0.375rem;
          width: 100%;
        }
        
        .video-embed iframe {
          border-radius: 0.375rem;
          width: 100%;
          min-height: 315px;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;