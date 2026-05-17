export const transform = {
  title: 'Transform',
  variant: 'process',
  icon: 'transform',
  width: 300,
  minHeight: 110,
  description: 'Reshape payload using a JSON template with {{variables}}.',
  handles: [
    { type: 'target', position: 'left', id: 'input', tone: 'input' },
    { type: 'source', position: 'right', id: 'output', label: 'Out', tone: 'success' },
    {
      type: 'source',
      position: 'right',
      id: 'fail',
      label: 'Fail',
      tone: 'fail',
      style: { top: '68%' },
    },
  ],
  fields: [
    {
      name: 'template',
      label: 'Output JSON template',
      type: 'variable-textarea',
      rows: 4,
      defaultValue: '{\n  "email": "{{username}}",\n  "token": "{{token}}"\n}',
    },
  ],
};
