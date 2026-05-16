export const llm = {
  title: 'LLM',
  variant: 'process',
  icon: 'llm',
  description: 'This is a LLM.',
  handles: [
    { type: 'target', position: 'left', id: 'system', tone: 'input', style: { top: '33%' } },
    { type: 'target', position: 'left', id: 'prompt', tone: 'input', style: { top: '66%' } },
    { type: 'source', position: 'right', id: 'response', tone: 'success' },
  ],
};
