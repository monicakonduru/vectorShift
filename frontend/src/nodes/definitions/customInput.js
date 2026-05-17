import { buildVariableProviderHandles, onProviderFieldsChange } from '../nodeEffects';

export const customInput = {
  title: 'Input',
  variant: 'io',
  icon: 'input',
  handles: buildVariableProviderHandles,
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
  onFieldsChange: onProviderFieldsChange,
};
