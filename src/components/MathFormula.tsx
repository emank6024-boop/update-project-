import React, { useMemo } from 'react';
import { renderKaTeXSafely, formatTextForClipboard } from '../utils/mathFormatter';

interface MathFormulaProps {
  formula: string;
  isBlock?: boolean;
  className?: string;
  showCopy?: boolean;
}

/**
 * Renders mathematical equations, quadratic formulas, chemical reactions,
 * and scientific identities using KaTeX without displaying raw code, hashtags,
 * curly brackets, dollar signs, backslashes, or LaTeX syntax.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  isBlock = false,
  className = '',
  showCopy = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const cleanFormula = useMemo(() => {
    if (!formula) return '';
    // Strip hashtags, wrapping dollar signs, or markdown ticks
    return formula
      .replace(/^#+\s*/g, '')
      .replace(/^`+|`+$/g, '')
      .replace(/^(\${1,2})([\s\S]*?)\1$/g, '$2')
      .trim();
  }, [formula]);

  const renderedHtml = useMemo(() => {
    if (!cleanFormula) return '';
    return renderKaTeXSafely(cleanFormula, isBlock);
  }, [cleanFormula, isBlock]);

  const fallbackReadable = useMemo(() => {
    return formatTextForClipboard(cleanFormula);
  }, [cleanFormula]);

  if (!cleanFormula) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fallbackReadable);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 group ${
        isBlock ? 'my-2.5 p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] overflow-x-auto w-full justify-center' : ''
      } ${className}`}
    >
      {renderedHtml ? (
        <span
          className="math-rendered font-sans text-sm sm:text-base text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      ) : (
        <span className="font-mono text-xs sm:text-sm text-[var(--text-primary)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
          {fallbackReadable}
        </span>
      )}

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title="Copy readable formula"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--text-muted)] hover:text-emerald-600 rounded cursor-pointer"
        >
          {copied ? (
            <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
          ) : (
            <span className="text-[10px]">Copy</span>
          )}
        </button>
      )}
    </div>
  );
};
