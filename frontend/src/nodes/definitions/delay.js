export const delay = {
  title: 'Delay',
  variant: 'utility',
  description: 'Pause execution for a duration.',
  handles: [
    { type: 'target', position: 'left', id: 'in' },
    { type: 'source', position: 'right', id: 'out' },
  ],
  fields: [
    {
      name: 'milliseconds',
      label: 'Delay (ms)',
      type: 'number',
      defaultValue: '1000',
      min: 0,
      step: 100,
    },
  ],
};
