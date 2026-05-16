const TEMPLATE_VAR_PATTERN = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

export const VAR_PILL_CLASS = 'template-var-pill';

export const formatVariable = (name) => `{{ ${name} }}`;

export const parseTemplateSegments = (text) => {
  if (!text) return [];

  const segments = [];
  let lastIndex = 0;
  const re = new RegExp(TEMPLATE_VAR_PATTERN.source, 'g');
  let match;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'variable', name: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
};

export const serializeTemplateSegments = (segments) =>
  segments
    .map((segment) =>
      segment.type === 'variable' ? formatVariable(segment.name) : segment.value
    )
    .join('');

export const serializeFromEditor = (root) => {
  if (!root) return '';

  let result = '';
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else if (node.classList?.contains(VAR_PILL_CLASS)) {
      result += formatVariable(node.dataset.var);
    } else {
      result += serializeFromEditor(node);
    }
  });

  return result;
};

export const getCaretSerializedOffset = (root) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !root) return 0;

  const { endContainer, endOffset } = selection.getRangeAt(0);
  if (!root.contains(endContainer)) return 0;

  let offset = 0;
  let found = false;

  const walk = (node) => {
    if (found) return;

    if (node === endContainer) {
      if (node.nodeType === Node.TEXT_NODE) {
        offset += endOffset;
      } else if (node.classList?.contains(VAR_PILL_CLASS)) {
        offset += formatVariable(node.dataset.var).length;
      }
      found = true;
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      offset += node.textContent.length;
      return;
    }

    if (node.classList?.contains(VAR_PILL_CLASS)) {
      offset += formatVariable(node.dataset.var).length;
      return;
    }

    [...node.childNodes].forEach(walk);
  };

  [...root.childNodes].forEach(walk);
  return offset;
};

export const pillStyle = {
  display: 'inline-block',
  padding: '1px 6px',
  margin: '0 2px',
  borderRadius: '4px',
  background: '#334155',
  border: '1px solid #64748b',
  color: '#e2e8f0',
  fontSize: '11px',
  fontWeight: '500',
  lineHeight: '16px',
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'baseline',
};

export const createVariablePill = (name) => {
  const pill = document.createElement('span');
  pill.className = VAR_PILL_CLASS;
  pill.contentEditable = 'false';
  pill.dataset.var = name;
  pill.textContent = name;
  pill.title = 'Click to remove';
  Object.assign(pill.style, pillStyle);
  return pill;
};

export const renderEditorContent = (root, text) => {
  if (!root) return;

  root.innerHTML = '';
  const segments = parseTemplateSegments(text);

  if (segments.length === 0) {
    return;
  }

  segments.forEach((segment) => {
    if (segment.type === 'text') {
      root.appendChild(document.createTextNode(segment.value));
    } else {
      root.appendChild(createVariablePill(segment.name));
    }
  });
};

export const placeCaretAtEnd = (root) => {
  if (!root) return;

  const selection = window.getSelection();
  const range = document.createRange();

  if (root.childNodes.length === 0) {
    range.setStart(root, 0);
  } else {
    const last = root.childNodes[root.childNodes.length - 1];
    if (last.nodeType === Node.TEXT_NODE) {
      range.setStart(last, last.textContent.length);
    } else {
      range.setStartAfter(last);
    }
  }

  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

export const placeCaretAfterNode = (node) => {
  if (!node) return;

  const selection = window.getSelection();
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};
