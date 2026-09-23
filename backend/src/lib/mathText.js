/**
 * mathText.js — LaTeX to readable Unicode, for PDFs.
 * ============================================================
 * Question text carries mathematics as $...$ LaTeX (the MathField
 * convention). Browsers render it with KaTeX; a PDF has no browser,
 * so the generated question paper printed the raw source. This is
 * the server-side twin of the frontend's plainMath fallback - the
 * SAME symbol tables, so screen fallback and paper always agree:
 * $\frac{3}{4}$ -> (3)/(4), $x^{2}$ -> x², $\pi r^{2}$ -> πr².
 */

const SYM = {
  '\\pi': 'π', '\\theta': 'θ', '\\alpha': 'α', '\\beta': 'β', '\\Delta': 'Δ', '\\lambda': 'λ',
  '\\mu': 'μ', '\\rho': 'ρ', '\\Omega': 'Ω', '\\infty': '∞', '\\pm': '±', '\\times': '×',
  '\\div': '÷', '\\approx': '≈', '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\cdot': '·',
  '\\rightarrow': '→', '\\rightleftharpoons': '⇌', '\\sum': 'Σ', '\\int': '∫', '\\sqrt': '√',
  '\\circ': '°',
};
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'x': 'ˣ' };
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', 'n': 'ₙ', 'x': 'ₓ' };

function plainMath(tex) {
  let s = String(tex);
  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  s = s.replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g, '$1√($2)');
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
  s = s.replace(/\\text\{([^{}]*)\}/g, '$1');
  for (const [k, v] of Object.entries(SYM)) s = s.split(k).join(v);
  s = s.replace(/\^\{([^{}]+)\}/g, (_, g) => [...g].map(c => SUP[c] || '^' + c).join(''));
  s = s.replace(/_\{([^{}]+)\}/g, (_, g) => [...g].map(c => SUB[c] || '_' + c).join(''));
  s = s.replace(/\^(\w)/g, (_, c) => SUP[c] || '^' + c);
  s = s.replace(/_(\w)/g, (_, c) => SUB[c] || '_' + c);
  return s.replace(/[{}]/g, '');
}

/** Convert every $...$ segment of a string; plain text passes through. */
function mathToText(text) {
  if (!text) return text;
  return String(text).split(/(\$[^$]+\$)/g).map(part => {
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 3) return plainMath(part.slice(1, -1));
    return part;
  }).join('');
}

module.exports = { mathToText, plainMath };
