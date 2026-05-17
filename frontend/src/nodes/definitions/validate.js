export const validate = {
  title: 'Validate',
  variant: 'process',
  icon: 'validate',
  width: 280,
  minHeight: 100,
  description: 'Check required fields exist before continuing.',
  handles: [
    { type: 'target', position: 'left', id: 'input', tone: 'input' },
    {
      type: 'source',
      position: 'right',
      id: 'pass',
      label: 'Pass',
      tone: 'success',
      style: { top: '38%' },
    },
    {
      type: 'source',
      position: 'right',
      id: 'fail',
      label: 'Fail',
      tone: 'fail',
      style: { top: '62%' },
    },
  ],
  fields: [
    {
      name: 'requiredFields',
      label: 'Required fields',
      type: 'text',
      defaultValue: 'username,token',
      placeholder: 'comma-separated: username, token',
    },
    {
      name: 'requireJson',
      label: 'Input must be JSON',
      type: 'select',
      defaultValue: 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
  ],
};
