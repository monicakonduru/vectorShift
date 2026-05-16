export const merge = {
  title: 'Merge',
  variant: 'process',
  minHeight: 100,
  description: 'Combine two inputs into one stream.',
  handles: [
    { type: 'target', position: 'left', id: 'a', style: { top: '35%' } },
    { type: 'target', position: 'left', id: 'b', style: { top: '65%' } },
    { type: 'source', position: 'right', id: 'merged' },
  ],
  fields: [
    {
      name: 'strategy',
      label: 'Strategy',
      type: 'select',
      defaultValue: 'concat',
      options: [
        { value: 'concat', label: 'Concatenate' },
        { value: 'zip', label: 'Zip' },
        { value: 'overwrite', label: 'Overwrite' },
      ],
    },
  ],
};
