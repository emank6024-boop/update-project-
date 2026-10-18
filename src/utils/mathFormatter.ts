/**
 * Math and Chemical Formula Formatter & Clipboard Sanitizer
 * Converts LaTeX formulas, subscripts, superscripts, fractions, and symbols
 * into clean, universally readable Unicode text for copying, and normalizes
 * markdown so KaTeX renders all equations, fractions, powers, roots, and chemical formulas properly.
 */

import katex from 'katex';

// Subscript and superscript Unicode conversion maps
const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
};

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 't': 'ᵗ',
};

const GREEK_AND_SYMBOLS: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\Gamma': 'Γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\epsilon': 'ε',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\Theta': 'Θ',
  '\\lambda': 'λ',
  '\\Lambda': 'Λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\Pi': 'Π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\tau': 'τ',
  '\\phi': 'φ',
  '\\Phi': 'Φ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
  '\\pm': '±',
  '\\mp': '∓',
  '\\times': '×',
  '\\cdot': '·',
  '\\div': '÷',
  '\\approx': '≈',
  '\\neq': '≠',
  '\\ne': '≠',
  '\\leq': '≤',
  '\\le': '≤',
  '\\geq': '≥',
  '\\ge': '≥',
  '\\infty': '∞',
  '\\to': '→',
  '\\rightarrow': '→',
  '\\leftarrow': '←',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\leftrightarrow': '↔',
  '\\rightleftharpoons': '⇌',
  '\\degree': '°',
  '\\circ': '°',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\int': '∫',
  '\\sum': '∑',
  '\\prod': '∏',
};

function toSubscript(digits: string): string {
  return digits
    .split('')
    .map((ch) => SUBSCRIPTS[ch] || ch)
    .join('');
}

function toSuperscript(digits: string): string {
  return digits
    .split('')
    .map((ch) => SUPERSCRIPTS[ch] || ch)
    .join('');
}

/**
 * Safely renders a LaTeX mathematical string directly to KaTeX HTML.
 * Includes graceful error handling so no crash or raw error breaks the UI.
 */
export function renderKaTeXSafely(expr: string, isBlock = false): string {
  if (!expr) return '';
  try {
    const clean = expr.replace(/^(\${1,2})([\s\S]*?)\1$/, '$2').trim();
    return katex.renderToString(clean, {
      displayMode: isBlock,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch (err) {
    console.warn('KaTeX render fallback:', err);
    return expr;
  }
}

/**
 * Helper to find matching closing bracket or brace handling nesting
 */
function findBalancedClosing(str: string, startIndex: number, openChar = '{', closeChar = '}'): number {
  if (str[startIndex] !== openChar) return -1;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === openChar) depth++;
    else if (str[i] === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Checks whether index is inside an active single-dollar math delimiter
 */
function isInsideMath(text: string, index: number): boolean {
  const before = text.slice(0, index);
  const singleDollars = (before.match(/(?<!\\)\$/g) || []).length;
  return singleDollars % 2 === 1;
}

/**
 * Pre-processes markdown text so that all mathematical formulas, fractions,
 * equations, roots, powers, LaTeX expressions, and chemical formulas are properly
 * converted into standard delimiters ($...$ and $$...$$) for KaTeX rendering.
 * Never displays raw $, $$, \frac, or LaTeX code to users.
 */
export function normalizeMathInMarkdown(content: string): string {
  if (!content || typeof content !== 'string') return '';

  let text = content;

  // 1. Convert display LaTeX brackets \[ ... \] and \\[ ... \\] to \n\n$$ ... $$\n\n
  text = text.replace(/\\{1,2}\[([\s\S]*?)\\{1,2}\]/g, (_m, inner) => `\n\n$$${inner.trim()}$$\n\n`);

  // 2. Convert inline LaTeX parentheses \( ... \) and \\( ... \\) to $ ... $
  text = text.replace(/\\{1,2}\(([\s\S]*?)\\{1,2}\)/g, (_m, inner) => `$${inner.trim()}$`);

  // 3. Convert standard LaTeX environments to $$ \begin{...} ... \end{...} $$
  text = text.replace(
    /\\begin\{(?:equation|align|gather|matrix|pmatrix|bmatrix|vmatrix|cases)\*?\}([\s\S]*?)\\end\{(?:equation|align|gather|matrix|pmatrix|bmatrix|vmatrix|cases)\*?\}/g,
    (fullBlock) => `\n\n$$${fullBlock.trim()}$$\n\n`
  );

  // 4. Convert inline backticks containing explicit LaTeX commands or equations to KaTeX formulas
  // e.g. `x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}` -> $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
  text = text.replace(/`([^`\n]*\\[a-zA-Z]+[^`\n]*)`/g, (_m, inner) => {
    if (
      /\\(frac|sqrt|pm|times|cdot|approx|ne|leq|geq|sum|int|partial|alpha|beta|gamma|theta|pi|infty|mu|sigma|to|right|left|mathbf|mathrm|text)/.test(
        inner
      )
    ) {
      return `$${inner.trim()}$`;
    }
    return _m;
  });

  // Convert inline backticks with equations having exponents/powers or formulas like `c² = a² + b²`, `LCM = 2² × 3² = 36`
  text = text.replace(/`([^`\n]*[²³\^][^`\n]*=[^`\n]*)`/g, (_m, inner) => {
    const mathClean = inner
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/×/g, '\\times ')
      .replace(/÷/g, '\\div ')
      .trim();
    return `$${mathClean}$`;
  });

  text = text.replace(/`([^`\n]*(?:LCM|HCF|GCD|\\times|×)[^`\n]*=[^`\n]*)`/gi, (_m, inner) => {
    const mathClean = inner
      .replace(/×/g, '\\times ')
      .replace(/÷/g, '\\div ')
      .trim();
    return `$${mathClean}$`;
  });

  // 5. Wrap raw standalone \frac{...}{...} using balanced brace parser so nested braces like \sqrt inside \frac never fail!
  let fracProcessed = '';
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('\\frac{', i) && !isInsideMath(text, i)) {
      const numEnd = findBalancedClosing(text, i + 5);
      if (numEnd !== -1 && text[numEnd + 1] === '{') {
        const denEnd = findBalancedClosing(text, numEnd + 1);
        if (denEnd !== -1) {
          const fracBody = text.slice(i, denEnd + 1);
          // Check if preceded by a single math variable / function assignment like "x = " or "y = " or "f(x) = "
          const prefixMatch = fracProcessed.match(/([a-zA-Z](?:\([a-zA-Z0-9]\))?\s*=\s*)$/);
          if (prefixMatch && !prefixMatch[1].includes('$')) {
            const prefix = prefixMatch[1];
            fracProcessed = fracProcessed.slice(0, fracProcessed.length - prefix.length);
            fracProcessed += `$${prefix.trim()} ${fracBody}$`;
          } else {
            fracProcessed += `$${fracBody}$`;
          }
          i = denEnd + 1;
          continue;
        }
      }
    }
    fracProcessed += text[i];
    i++;
  }
  text = fracProcessed;

  // 6. Wrap raw standalone \sqrt{...} or \sqrt[n]{...} using balanced brace parser
  let sqrtProcessed = '';
  i = 0;
  while (i < text.length) {
    if (text.startsWith('\\sqrt', i) && !isInsideMath(text, i)) {
      let argStart = i + 5;
      if (text[argStart] === '[') {
        const optEnd = findBalancedClosing(text, argStart, '[', ']');
        if (optEnd !== -1) argStart = optEnd + 1;
      }
      if (text[argStart] === '{') {
        const argEnd = findBalancedClosing(text, argStart, '{', '}');
        if (argEnd !== -1) {
          const sqrtBody = text.slice(i, argEnd + 1);
          sqrtProcessed += `$${sqrtBody}$`;
          i = argEnd + 1;
          continue;
        }
      }
    }
    sqrtProcessed += text[i];
    i++;
  }
  text = sqrtProcessed;

  // 7. Chemical reaction equations with arrows: e.g. 6CO2 + 6H2O -> C6H12O6 + 6O2, 2H2 + O2 -> 2H2O
  text = text.replace(
    /((?:\d*\s*[A-Z][a-zA-Z0-9\(\)]+\s*[\+\-]\s*)+[\d\s]*[A-Z][a-zA-Z0-9\(\)]+\s*(?:⟶|->|→|\\longrightarrow)\s*(?:[\d\s]*[A-Z][a-zA-Z0-9\(\)]+(?:\s*[\+\-]\s*[\d\s]*[A-Z][a-zA-Z0-9\(\)]+)*))/g,
    (match) => {
      if (match.includes('$') || match.includes('```')) return match;
      const clean = match
        .replace(/(?:⟶|->|→)/g, ' \\longrightarrow ')
        .replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
      return `\n\n$$\\mathrm{${clean.trim()}}$$\n\n`;
    }
  );

  // 8. Individual chemical formulas written in text: e.g. H2O, CO2, C6H12O6, Ca(OH)2, H2SO4, NaCl, CH4, NH3
  text = text.replace(
    /(^|[^\w\$])(H_?2O|CO_?2|C_?6H_?12O_?6|C_?6H_?\{12\}O_?6|O_?2|N_?2|H_?2|Cl_?2|NaCl|CaCO_?3|H_?2SO_?4|Ca\(OH\)_?2|NH_?3|CH_?4|HCl|NaOH|CaCl_?2|KMnO_?4|Fe_?2O_?3|HNO_?3)(?=[^\w\$]|$)/g,
    (_m, prefix, chem) => {
      const latexChem = chem
        .replace(/_?\{?(\d+)\}?/g, '_$1')
        .replace(/_(\d+)/g, '_{$1}');
      return `${prefix}$\\mathrm{${latexChem}}$`;
    }
  );

  // 9. Equations with powers and exponents like c² = a² + b² or a^2 + b^2 = c^2, y = x^2 - 4
  text = text.replace(
    /(^|[^\w\$])([a-zA-Z\d\s\+\-\*\/]+[²³\^][a-zA-Z\d\s\+\-\*\/]*=[a-zA-Z\d\s\+\-\*\/]+[²³\^]?[a-zA-Z\d\s\+\-\*\/]*)(?=[^\w\$]|$)/g,
    (_m, prefix, eq) => {
      if (eq.includes('$') || eq.includes('```') || eq.length < 5) return _m;
      const clean = eq
        .replace(/²/g, '^2')
        .replace(/³/g, '^3')
        .replace(/×/g, '\\times ')
        .replace(/÷/g, '\\div ')
        .trim();
      return `${prefix}$${clean}$`;
    }
  );

  // 10. Fix spaces inside $ ... $ delimiters so remark-math never skips them: e.g. `$ x = 5 $` -> `$x = 5$`
  text = text.replace(/\$([ \t]+)([^$\n]+?)([ \t]*)\$/g, (_m, _s1, inner) => `$${inner.trim()}$`);
  text = text.replace(/\$([^$\n]+?)([ \t]+)\$/g, (_m, inner) => `$${inner.trim()}$`);

  // 11. Escape isolated currency dollar amounts like "$50" or "$100" so remark-math doesn't open an unclosed math block
  text = text.replace(/\$(\d+(?:\.\d+)?)(?!\$)/g, 'Rs. $1');

  // 12. Text formatting, paragraph spacing, and divider cleanup:
  // Remove horizontal divider lines (---, ***, ___) between paragraphs
  text = text.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '');

  // Ensure headings have a proper blank line before and after
  text = text.replace(/([^\n])\n(#{1,6}\s+)/g, '$1\n\n$2');
  text = text.replace(/(^#{1,6}\s+[^\n]+)\n([^\n#\s])/gm, '$1\n\n$2');

  // Ensure bullet points and numbered lists start on a new block
  text = text.replace(/(^[^\n\-*+\d].*)\n([ \t]*[-*+]\s+)/gm, '$1\n\n$2');
  text = text.replace(/(^[^\n\-*+\d].*)\n([ \t]*\d+\.\s+)/gm, '$1\n\n$2');

  // Ensure single line gap at the end of each paragraph (collapse 3+ newlines to 2 newlines)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Transforms a single math/chemistry LaTeX formula into clean, readable Unicode text
 */
export function formatLatexFormula(expr: string): string {
  if (!expr) return '';
  let out = expr.trim();

  // Strip outer math delimiters $...$ or $$...$$
  out = out.replace(/^(\${1,2})([\s\S]*?)\1$/, '$2').trim();

  // Strip text wrappers like \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}
  out = out.replace(/\\(text|mathrm|mathbf|mathit|textbf|textrm)\{([^{}]+)\}/g, '$2');

  // Fractions: \frac{a}{b} -> (a)/(b) or a/b
  let prev = '';
  while (prev !== out) {
    prev = out;
    out = out.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_m, num, den) => {
      const cleanNum = num.trim();
      const cleanDen = den.trim();
      const wrapNum = cleanNum.includes(' ') || cleanNum.includes('+') || cleanNum.includes('-');
      const wrapDen = cleanDen.includes(' ') || cleanDen.includes('+') || cleanDen.includes('-');
      return `${wrapNum ? `(${cleanNum})` : cleanNum} / ${wrapDen ? `(${cleanDen})` : cleanDen}`;
    });
  }

  // Square roots: \sqrt[n]{x} -> ⁿ√(x) and \sqrt{x} -> √(x)
  out = out.replace(/\\sqrt\[([0-9]+)\]\{([^{}]+)\}/g, (_m, n, rad) => `${toSuperscript(n)}√(${rad.trim()})`);
  out = out.replace(/\\sqrt\{([^{}]+)\}/g, (_m, rad) => `√(${rad.trim()})`);

  // Subscripts: _{12} or _2
  out = out.replace(/_\{([0-9a-zA-Z+-]+)\}/g, (_m, sub) => toSubscript(sub));
  out = out.replace(/_([0-9a-zA-Z+-])/g, (_m, sub) => toSubscript(sub));

  // Superscripts: ^{12} or ^2
  out = out.replace(/\^\{([0-9a-zA-Z+-]+)\}/g, (_m, sup) => toSuperscript(sup));
  out = out.replace(/\^([0-9a-zA-Z+-])/g, (_m, sup) => toSuperscript(sup));

  // Replace LaTeX symbols and Greek characters
  for (const [cmd, unicode] of Object.entries(GREEK_AND_SYMBOLS)) {
    const regex = new RegExp(cmd.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g');
    out = out.replace(regex, unicode);
  }

  // Clean up standard chemical reaction state symbols e.g. \text{(s)}, (aq), (g), (l)
  out = out.replace(/\\left\(|\\right\)/g, '');
  out = out.replace(/\\left\[|\\right\]/g, '');
  out = out.replace(/\\left\{|\\right\}/g, '');
  out = out.replace(/\\,/g, ' ');
  out = out.replace(/\\;/g, ' ');
  out = out.replace(/\\quad/g, '  ');
  out = out.replace(/\\qquad/g, '   ');
  out = out.replace(/\\!/g, '');
  out = out.replace(/\\phantom\{[^{}]+\}/g, '');

  // Normalize spaces
  out = out.replace(/\s+/g, ' ').trim();

  return out;
}

/**
 * Prepares full markdown text for user clipboard copying:
 * Converts all embedded $...$ and $$...$$ LaTeX formulas into clean Unicode math,
 * ensuring no raw '$C_6H_{12}O_6$' remains, while preserving formatting.
 */
export function formatTextForClipboard(text: string): string {
  if (!text) return '';

  // 1. Process block math $$...$$
  let cleaned = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, expr) => {
    return `\n${formatLatexFormula(expr)}\n`;
  });

  // 2. Process inline math $...$
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, (_match, expr) => {
    return formatLatexFormula(expr);
  });

  // 3. Convert any remaining chemical formulas written with raw underscores/carets:
  // e.g. C_6H_{12}O_6 -> C₆H₁₂O₆
  cleaned = cleaned.replace(/([A-Z][a-z]?)_\{?([0-9]+)\}?/g, (_m, elem, num) => {
    return `${elem}${toSubscript(num)}`;
  });

  return cleaned.trim();
}
