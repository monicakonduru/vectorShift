import { createNode } from './createNode';

export const TextNode = createNode({
  title: 'Text',
  variant: 'default',
  handles: [{ type: 'source', position: 'right', id: 'output' }],
  fields: [
    {
      name: 'text',
      label: 'Text',
      type: 'text',
      defaultValue: '{{input}}',
    },
  ],
});
