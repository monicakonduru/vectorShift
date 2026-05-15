import { createNode } from './createNode';

export const ConditionNode = createNode({
  title: 'Condition',
  variant: 'process',
  minHeight: 100,
  description: 'Route flow based on a comparison.',
  handles: [
    { type: 'target', position: 'left', id: 'value' },
    { type: 'source', position: 'right', id: 'true', style: { top: '35%' } },
    { type: 'source', position: 'right', id: 'false', style: { top: '65%' } },
  ],
  fields: [
    {
      name: 'operator',
      label: 'Operator',
      type: 'select',
      defaultValue: 'eq',
      options: [
        { value: 'eq', label: '==' },
        { value: 'neq', label: '!=' },
        { value: 'gt', label: '>' },
        { value: 'lt', label: '<' },
      ],
    },
    {
      name: 'compareTo',
      label: 'Compare to',
      type: 'text',
      defaultValue: '',
    },
  ],
});
