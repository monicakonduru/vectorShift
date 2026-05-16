export const condition = {
  title: 'Condition',
  variant: 'process',
  icon: 'condition',
  minHeight: 100,
  description: 'Route flow based on a comparison.',
  handles: [
    { type: 'target', position: 'left', id: 'value', tone: 'input' },
    {
      type: 'source',
      position: 'right',
      id: 'true',
      label: 'True',
      tone: 'success',
      style: { top: '38%' },
    },
    {
      type: 'source',
      position: 'right',
      id: 'false',
      label: 'False',
      tone: 'fail',
      style: { top: '62%' },
    },
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
};
