import { createNode } from './createNode';

export const InputNode = createNode({
  title: 'Input',
  variant: 'io',
  handles: [{ type: 'source', position: 'right', id: 'value' }],
  fields: [
    {
      name: 'inputName',
      label: 'Name',
      type: 'text',
      defaultValue: (id) => id.replace('customInput-', 'input_'),
    },
    {
      name: 'inputType',
      label: 'Type',
      type: 'select',
      defaultValue: 'Text',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'File', label: 'File' },
      ],
    },
  ],
});
