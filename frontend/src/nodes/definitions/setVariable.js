import { buildSetVariableHandles, onProviderFieldsChange } from '../nodeEffects';

export const setVariable = {
  title: 'Set Variable',
  variant: 'process',
  icon: 'setVariable',
  width: 300,
  minHeight: 110,
  description: 'Extract from upstream JSON (JSON path) and expose as {{variable}}.',
  handles: buildSetVariableHandles,
  fields: [
    {
      name: 'varName',
      label: 'Save as',
      type: 'text',
      defaultValue: (id) => id.replace('setVariable-', 'token'),
    },
    {
      name: 'jsonPath',
      label: 'JSON path',
      type: 'text',
      defaultValue: '$.token',
      placeholder: '$.Session or $.user.id',
    },
    {
      name: 'defaultValue',
      label: 'Fallback if path missing',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'extractedValue',
      label: 'Extracted value',
      type: 'static',
      defaultValue: '',
    },
  ],
  onFieldsChange: onProviderFieldsChange,
};
