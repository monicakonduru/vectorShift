import { onInputFieldsChange, resolveInputHandleId } from '../nodeEffects';

export const customInput = {
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
  onFieldsChange: onInputFieldsChange,
};
