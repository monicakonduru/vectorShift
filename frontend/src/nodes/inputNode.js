import { createNode } from './createNode';
import { isValidJsIdentifier } from './parseTemplateVariables';
import { useStore } from '../store';

const resolveInputHandleId = (inputName) =>
  isValidJsIdentifier(inputName) ? inputName : 'value';

export const InputNode = createNode({
  title: 'Input',
  variant: 'io',
  handles: ({ fieldValues }) => [
    {
      type: 'source',
      position: 'right',
      id: resolveInputHandleId(fieldValues?.inputName),
    },
  ],
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
  onFieldsChange: (id, name) => {
    if (name === 'inputName' || name === '__mount__') {
      useStore.getState().resyncAllTextVariableEdges();
    }
  },
});
