import { buildTextHandles, onTextFieldsChange } from '../nodeEffects';

export const text = {
  title: 'Text',
  variant: 'default',
  handles: buildTextHandles,
  fields: [
    {
      name: 'text',
      label: 'Text',
      type: 'variable-textarea',
      rows: 1,
      defaultValue: '',
    },
  ],
  onFieldsChange: onTextFieldsChange,
};
