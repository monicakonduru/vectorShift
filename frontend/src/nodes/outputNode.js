import { createNode } from './createNode';

export const OutputNode = createNode({
  title: 'Output',
  variant: 'io',
  handles: [{ type: 'target', position: 'left', id: 'value' }],
  fields: [
    {
      name: 'outputName',
      label: 'Name',
      type: 'text',
      defaultValue: (id) => id.replace('customOutput-', 'output_'),
    },
    {
      name: 'outputType',
      label: 'Type',
      type: 'select',
      defaultValue: 'Text',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'File', label: 'Image' },
      ],
    },
  ],
});
