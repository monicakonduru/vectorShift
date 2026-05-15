import { createNode } from './createNode';

export const FilterNode = createNode({
  title: 'Filter',
  variant: 'process',
  description: 'Keep rows matching a rule.',
  handles: [
    { type: 'target', position: 'left', id: 'input' },
    { type: 'source', position: 'right', id: 'output' },
  ],
  fields: [
    {
      name: 'rule',
      label: 'Rule',
      type: 'select',
      defaultValue: 'contains',
      options: [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Equals' },
        { value: 'regex', label: 'Regex' },
      ],
    },
    {
      name: 'pattern',
      label: 'Pattern',
      type: 'text',
      defaultValue: '',
    },
  ],
});
