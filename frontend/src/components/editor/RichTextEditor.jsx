import { useState, useRef, useMemo, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { motion } from "framer-motion";
import {
  HiOutlinePhoto,
  HiOutlineCodeBracket,
  HiOutlineLink,
  HiOutlineListBullet,
} from "react-icons/hi2";

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing your story...",
  minHeight = "400px",
}) => {
  const quillRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be under 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", reader.result);
          quill.setSelection(range.index + 1);
        }
      };
      reader.readAsDataURL(file);
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          [{ font: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler],
  );

  const formats = [
    "header",
    "font",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
    "indent",
    "direction",
    "clean",
  ];

  const handleChange = (content, delta, source, editor) => {
    onChange(content);
    const text = editor.getText().trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
    setCharCount(text.length);
  };

  return (
    <div className="rich-editor-wrapper">
      <style>{`
        .rich-editor-wrapper .ql-toolbar.ql-snow {
          border: 2px solid var(--border-color, #e2e8f0);
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          border-radius: 16px 16px 0 0;
          background: var(--toolbar-bg, #f8fafc);
          padding: 8px 12px;
          position: sticky;
          top: 64px;
          z-index: 10;
        }
        .rich-editor-wrapper .ql-container.ql-snow {
          border: 2px solid var(--border-color, #e2e8f0);
          border-top: none;
          border-radius: 0 0 16px 16px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 16px;
          line-height: 1.8;
          min-height: ${minHeight};
        }
        .rich-editor-wrapper .ql-editor {
          padding: 24px;
          min-height: ${minHeight};
        }
        .rich-editor-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #94a3b8;
          left: 24px;
          right: 24px;
        }
        .rich-editor-wrapper .ql-editor h1 { font-size: 2em; font-weight: 800; margin: 1em 0 0.5em; font-family: 'Plus Jakarta Sans', sans-serif; }
        .rich-editor-wrapper .ql-editor h2 { font-size: 1.5em; font-weight: 700; margin: 0.8em 0 0.4em; font-family: 'Plus Jakarta Sans', sans-serif; }
        .rich-editor-wrapper .ql-editor h3 { font-size: 1.25em; font-weight: 600; margin: 0.6em 0 0.3em; font-family: 'Plus Jakarta Sans', sans-serif; }
        .rich-editor-wrapper .ql-editor p { margin-bottom: 0.8em; }
        .rich-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #6366f1;
          padding: 12px 20px;
          margin: 16px 0;
          background: #eef2ff;
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: #475569;
        }
        .rich-editor-wrapper .ql-editor pre.ql-syntax {
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          overflow-x: auto;
        }
        .rich-editor-wrapper .ql-editor code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
          color: #6366f1;
        }
        .rich-editor-wrapper .ql-editor img {
          border-radius: 12px;
          max-width: 100%;
          margin: 16px 0;
        }
        .rich-editor-wrapper .ql-editor a {
          color: #6366f1;
          text-decoration: underline;
        }
        .rich-editor-wrapper .ql-editor ul, .rich-editor-wrapper .ql-editor ol {
          padding-left: 1.5em;
          margin-bottom: 0.8em;
        }
        .rich-editor-wrapper .ql-snow .ql-tooltip {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .rich-editor-wrapper .ql-toolbar button:hover,
        .rich-editor-wrapper .ql-toolbar button.ql-active {
          color: #6366f1 !important;
        }
        .rich-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #64748b;
        }
        .rich-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #6366f1 !important;
        }
        .rich-editor-wrapper .ql-toolbar .ql-fill {
          fill: #64748b;
        }
        .rich-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #6366f1 !important;
        }

        /* Dark mode */
        .dark .rich-editor-wrapper .ql-toolbar.ql-snow {
          --border-color: #334155;
          --toolbar-bg: #1e293b;
          border-color: #334155;
          background: #1e293b;
        }
        .dark .rich-editor-wrapper .ql-container.ql-snow {
          border-color: #334155;
          color: #e2e8f0;
          background: #0f172a;
        }
        .dark .rich-editor-wrapper .ql-editor.ql-blank::before { color: #475569; }
        .dark .rich-editor-wrapper .ql-toolbar .ql-stroke { stroke: #94a3b8; }
        .dark .rich-editor-wrapper .ql-toolbar .ql-fill { fill: #94a3b8; }
        .dark .rich-editor-wrapper .ql-toolbar .ql-picker-label { color: #94a3b8; }
        .dark .rich-editor-wrapper .ql-toolbar .ql-picker-options { background: #1e293b; border-color: #334155; }
        .dark .rich-editor-wrapper .ql-editor blockquote { background: #1e1b4b30; color: #a5b4fc; }
        .dark .rich-editor-wrapper .ql-editor code { background: #1e293b; color: #a5b4fc; }
        .dark .rich-editor-wrapper .ql-snow .ql-tooltip { background: #1e293b; border-color: #334155; color: #e2e8f0; }
        .dark .rich-editor-wrapper .ql-snow .ql-tooltip input { background: #0f172a; border-color: #334155; color: #e2e8f0; }
      `}</style>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      {/* Footer Stats */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-dark-50 dark:bg-dark-800 
                      border-x-2 border-b-2 border-dark-200 dark:border-dark-700 
                      rounded-b-2xl -mt-[2px] relative z-0"
      >
        <div className="flex items-center gap-4 text-xs text-dark-400">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>~{Math.ceil(wordCount / 200)} min read</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const range = quill.getSelection(true);
                quill.insertText(range.index, "\n", "user");
              }
            }}
            className="p-1 rounded text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
            title="Insert line break"
          >
            <HiOutlineListBullet className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
