export interface GodPromiseCardInput {
  readonly title: string;
  readonly corpusRef: string;
  readonly translationAttribution: string;
  readonly personalReflection: string;
  readonly closingDua: string;
  readonly visualPrompt?: string;
}

export interface ValidationIssue {
  readonly rule: string;
  readonly field: string;
  readonly message: string;
}

export interface GodPromiseValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly renderedHtml?: string;
}

const CORPUS_SHA256_REF_PATTERN = /^mw-corpus:sha256:[a-f0-9]{64}$/i;

const CAN_0011_VISUAL_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /\ballah\b/i,
  /\bprophet\s+muhammad\b/i,
  /\bmuhammad\b/i,
  /\bnabi\s+muhammad\b/i,
  /\brasulullah\b/i,
  /\bisa\b/i,
  /\byesus\b/i,
  /\bjesus\b/i,
  /\bnabi\s+isa\b/i
];

const VISUAL_INTENT_PATTERN =
  /\b(depict|depiction|draw|drawing|paint|painting|illustrate|illustration|portrait|face|image|visual|render|photo|photograph|avatar|statue|figure|sketch|artwork)\b/i;

export function validateCan0011VisualBoundary(prompt: string): {
  readonly allowed: boolean;
  readonly rule: 'CAN-0011';
  readonly reason?: string;
} {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return { allowed: true, rule: 'CAN-0011' };
  }

  for (const forbiddenPattern of CAN_0011_VISUAL_FORBIDDEN_PATTERNS) {
    if (forbiddenPattern.test(trimmed)) {
      return {
        allowed: false,
        rule: 'CAN-0011',
        reason: 'Visual depiction of Allah, Prophet Muhammad, or Isa/Yesus is strictly forbidden under CAN-0011.'
      };
    }
  }

  return { allowed: true, rule: 'CAN-0011' };
}

function escapeHtml(rawText: string): string {
  return rawText
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function validateAndRenderGodPromiseCard(input: GodPromiseCardInput): GodPromiseValidationResult {
  const issues: ValidationIssue[] = [];

  if (!input.title || input.title.trim().length === 0) {
    issues.push({
      rule: 'CAN-0009',
      field: 'title',
      message: 'Card title is required.'
    });
  }

  if (!CORPUS_SHA256_REF_PATTERN.test(input.corpusRef?.trim() ?? '')) {
    issues.push({
      rule: 'CAN-0003',
      field: 'corpusRef',
      message: 'corpusRef must be a valid mw-corpus SHA-256 reference (mw-corpus:sha256:<64-hex>). Raw scripture text is not permitted.'
    });
  }

  if (!input.translationAttribution || input.translationAttribution.trim().length === 0) {
    issues.push({
      rule: 'CAN-0009',
      field: 'translationAttribution',
      message: 'translationAttribution is required and must remain separate from personalReflection.'
    });
  }

  if (!input.personalReflection || input.personalReflection.trim().length === 0) {
    issues.push({
      rule: 'CAN-0009',
      field: 'personalReflection',
      message: 'personalReflection is required.'
    });
  }

  if (!input.closingDua || input.closingDua.trim().length === 0) {
    issues.push({
      rule: 'CAN-0010',
      field: 'closingDua',
      message: 'closingDua is required in its dedicated field.'
    });
  }

  if (
    input.personalReflection &&
    input.translationAttribution &&
    input.personalReflection.trim() === input.translationAttribution.trim()
  ) {
    issues.push({
      rule: 'CAN-0009',
      field: 'personalReflection',
      message: 'personalReflection must remain strictly distinct from translationAttribution.'
    });
  }

  if (
    input.closingDua &&
    input.personalReflection &&
    input.closingDua.trim() === input.personalReflection.trim()
  ) {
    issues.push({
      rule: 'CAN-0010',
      field: 'closingDua',
      message: 'closingDua must remain strictly distinct from personalReflection.'
    });
  }

  if (input.visualPrompt && input.visualPrompt.trim().length > 0) {
    const visualCheck = validateCan0011VisualBoundary(input.visualPrompt);
    if (!visualCheck.allowed) {
      issues.push({
        rule: 'CAN-0011',
        field: 'visualPrompt',
        message: visualCheck.reason ?? 'Blocked by CAN-0011.'
      });
    }
  }

  if (input.personalReflection && VISUAL_INTENT_PATTERN.test(input.personalReflection)) {
    const reflectionVisualCheck = validateCan0011VisualBoundary(input.personalReflection);
    if (!reflectionVisualCheck.allowed) {
      issues.push({
        rule: 'CAN-0011',
        field: 'personalReflection',
        message: reflectionVisualCheck.reason ?? 'Blocked by CAN-0011.'
      });
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  const renderedHtml = [
    '<article class="god-promise-card" data-canon="CAN-0003,CAN-0009,CAN-0010,CAN-0011">',
    `  <header><h2>${escapeHtml(input.title.trim())}</h2></header>`,
    `  <section data-field="corpusRef"><code>${escapeHtml(input.corpusRef.trim())}</code></section>`,
    `  <section data-field="translationAttribution"><p>${escapeHtml(input.translationAttribution.trim())}</p></section>`,
    `  <section data-field="personalReflection"><p>${escapeHtml(input.personalReflection.trim())}</p></section>`,
    `  <footer data-field="closingDua"><p>${escapeHtml(input.closingDua.trim())}</p></footer>`,
    '</article>'
  ].join('\n');

  return {
    valid: true,
    issues: [],
    renderedHtml
  };
}
