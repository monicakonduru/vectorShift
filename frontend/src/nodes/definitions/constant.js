import { buildVariableProviderHandles, onProviderFieldsChange } from '../nodeEffects';

export const constant = {
  title: 'Constant',
  variant: 'utility',
  icon: 'constant',
  width: 260,
  minHeight: 90,
  description: 'Publish a fixed value as {{variable}} for downstream nodes.',
  handles: buildVariableProviderHandles,
  fields: [
    {
      name: 'varName',
      label: 'Variable name',
      type: 'text',
      defaultValue: (id) => id.replace('constant-', 'var_'),
    },
    {
      name: 'value',
      label: 'Value',
      type: 'text',
      defaultValue: '',
    },
  ],
  onFieldsChange: onProviderFieldsChange,
};
