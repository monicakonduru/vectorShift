const TEMPLATE_VAR_PATTERN = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

export const isValidJsIdentifier = (name) =>
  typeof name === 'string' && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);

export const parseTemplateVariables = (text) => {
  if (!text) return [];
  const names = new Set();
  const re = new RegExp(TEMPLATE_VAR_PATTERN.source, 'g');
  let match;
  while ((match = re.exec(text)) !== null) {
    names.add(match[1]);
  }
  return [...names].sort();
};
