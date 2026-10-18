import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';
import {
  formatTextForClipboard,
  normalizeMathInMarkdown,
  renderKaTeXSafely,
} from '../utils/mathFormatter';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  isRTL?: boolean;
  renderHeadingAction?: (headingText: string) => React.ReactNode;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({
  content,
  className = '',
  isRTL = false,
  renderHeadingAction,
}) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleCopyFormula = (rawText: string) => {
    const formatted = formatTextForClipboard(rawText);
    navigator.clipboard.writeText(formatted);
    setCopiedFormula(rawText);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Pre-process markdown so that all equations, fractions, roots, powers,
  // and chemical formulas are properly formatted for KaTeX rendering
  const normalizedContent = useMemo(() => {
    return normalizeMathInMarkdown(content);
  }, [content]);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none text-[var(--text-primary)] ${
        isRTL ? 'text-right leading-[1.95]' : 'text-left leading-relaxed'
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              throwOnError: false,
              strict: false,
              errorColor: '#ef4444',
            },
          ],
        ]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] mt-4 mb-2">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-3.5 mb-1.5">
              {children}
            </h3>
          ),
          h3: ({ children }) => {
            const headingText = String(children || '');
            const actionNode = renderHeadingAction ? renderHeadingAction(headingText) : null;
            return (
              <div className="flex items-center justify-between gap-2 mt-4 mb-1.5">
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] m-0">
                  {children}
                </h3>
                {actionNode && <div className="shrink-0">{actionNode}</div>}
              </div>
            );
          },
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-3 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3.5 mt-0 text-[var(--text-primary)] leading-relaxed text-sm sm:text-base">
              {children}
            </p>
          ),
          hr: () => null,
          ul: ({ children }) => (
            <ul
              className={`mb-3 mt-1.5 space-y-1 list-disc ${
                isRTL ? 'pr-5' : 'pl-5'
              } text-[var(--text-primary)] text-sm sm:text-base`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`mb-3 mt-1.5 space-y-1 list-decimal ${
                isRTL ? 'pr-5' : 'pl-5'
              } text-[var(--text-primary)] font-medium text-sm sm:text-base`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-[var(--text-primary)] mb-0.5">{children}</li>
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
            const textContent = String(children || '').trim();

            // If the code content contains LaTeX math commands, render via KaTeX instead of raw code!
            const containsLatex =
              /\\(frac|sqrt|pm|times|cdot|approx|ne|leq|geq|sum|int|partial|alpha|beta|gamma|theta|pi|infty|mu|sigma|to|right|left)/.test(
                textContent
              ) ||
              (textContent.includes('^') && textContent.includes('=')) ||
              (textContent.includes('_{') || textContent.includes('^{'));

            if (!isBlock && containsLatex) {
              const katexHtml = renderKaTeXSafely(textContent, false);
              return (
                <span
                  dir="ltr"
                  className="inline-block px-1 align-baseline font-serif text-[1.05em] text-[var(--text-primary)]"
                  dangerouslySetInnerHTML={{ __html: katexHtml }}
                />
              );
            }

            if (isBlock && (containsLatex || codeClassName?.includes('math') || codeClassName?.includes('latex'))) {
              const katexHtml = renderKaTeXSafely(textContent, true);
              return (
                <div className="relative group my-3 p-3.5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] overflow-x-auto text-center shadow-xs">
                  <div
                    dir="ltr"
                    className="inline-block py-1 text-base sm:text-lg text-[var(--text-primary)]"
                    dangerouslySetInnerHTML={{ __html: katexHtml }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyFormula(textContent)}
                    className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] text-[11px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs border border-[var(--border)]"
                    title="Copy formula"
                  >
                    {copiedFormula === textContent ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
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
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};
