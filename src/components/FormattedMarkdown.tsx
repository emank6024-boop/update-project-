import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';
import { formatTextForClipboard } from '../utils/mathFormatter';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  isRTL?: boolean;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({
  content,
  className = '',
  isRTL = false,
}) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleCopyFormula = (rawText: string) => {
    const formatted = formatTextForClipboard(rawText);
    navigator.clipboard.writeText(formatted);
    setCopiedFormula(rawText);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none text-[var(--text-primary)] ${
        isRTL ? 'text-right leading-[1.95]' : 'text-left leading-relaxed'
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mt-5 mb-2 pb-1 border-b border-[var(--border)]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-3 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-2 text-[var(--text-primary)] leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className={`my-2 space-y-1 list-disc ${isRTL ? 'pr-5' : 'pl-5'} text-[var(--text-primary)]`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`my-2 space-y-1 list-decimal ${isRTL ? 'pr-5' : 'pl-5'} text-[var(--text-primary)] font-medium`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-[var(--text-primary)]">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[var(--text-primary)]">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`my-3 p-3.5 rounded-xl bg-[var(--surface-secondary)] border-[var(--accent)] ${
                isRTL ? 'border-r-4' : 'border-l-4'
              } text-xs sm:text-sm text-[var(--text-secondary)] shadow-2xs`}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--surface-secondary)] text-[var(--text-primary)] border-b border-[var(--border)] font-bold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold text-start border-r last:border-r-0 border-[var(--border)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 border-t border-r last:border-r-0 border-[var(--border)] text-[var(--text-primary)]">
              {children}
            </td>
          ),
          code: ({ className: codeClassName, children }) => {
            const isBlock = Boolean(codeClassName);
            const textContent = String(children || '');

            if (isBlock) {
              return (
                <div className="relative group my-3">
                  <pre
                    dir="ltr"
                    className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto text-left shadow-md border border-slate-800"
                  >
                    <code>{children}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopyFormula(textContent)}
                    className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                    title="Copy code or formula"
                  >
                    {copiedFormula === textContent ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] font-mono text-[11px] text-[var(--accent-text)]">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
