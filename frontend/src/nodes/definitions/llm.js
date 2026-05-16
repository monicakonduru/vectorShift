export const llm = {
  title: 'LLM',
  variant: 'process',
  description: 'This is a LLM.',
  handles: [
    { type: 'target', position: 'left', id: 'system', style: { top: '33%' } },
    { type: 'target', position: 'left', id: 'prompt', style: { top: '66%' } },
    { type: 'source', position: 'right', id: 'response' },
  ],
};
