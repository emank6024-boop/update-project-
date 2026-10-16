/**
 * Math and Chemical Formula Formatter & Clipboard Sanitizer
 * Converts LaTeX formulas, subscripts, superscripts, fractions, and symbols
 * into clean, universally readable Unicode text so that copying never yields raw '$C_6H_{12}O_6$'
 * or '\frac{...}', but instead pristine 'C₆H₁₂O₆' and '(-b ± √(b² - 4ac)) / (2a)'.
 */

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
    // Escape backslashes for regex matching
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
