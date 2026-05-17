import { SavedVariablesPanel, ResponsePreviewPanel } from '../ApiNodePanels';

export const api = {
  title: 'API',
  variant: 'io',
  icon: 'api',
  width: 320,
  minHeight: 120,
  showStatus: true,
  handles: [
    { type: 'target', position: 'left', id: 'payload', tone: 'input' },
    {
      type: 'source',
      position: 'right',
      id: 'success',
      label: 'Success',
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
      name: 'method',
      label: 'Method',
      type: 'select',
      layout: 'method-badge',
      group: 'request-row',
      defaultValue: 'GET',
      options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' },
      ],
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      group: 'request-row',
      hideLabel: true,
      placeholder: 'https://api.example.com/...',
      defaultValue: 'https://api.example.com',
    },
    {
      name: 'headersBody',
      type: 'section',
      label: 'Headers & Body (supports {{vars}})',
      collapsed: true,
      fields: [
        {
          name: 'headers',
          label: 'Headers',
          type: 'variable-textarea',
          rows: 2,
          defaultValue: '',
          placeholder: 'Content-Type: application/json',
        },
        {
          name: 'body',
          label: 'Body',
          type: 'variable-textarea',
          rows: 3,
          defaultValue: '',
          placeholder: '{ "key": "{{value}}" }',
        },
      ],
    },
    {
      name: 'lastStatus',
      label: 'Last status',
      type: 'static',
      defaultValue: '',
    },
    {
      name: 'lastResponse',
      label: 'Last response',
      type: 'static',
      defaultValue: '',
    },
  ],
  render: ({ values, setField }) => (
    <>
      <SavedVariablesPanel fieldValues={values} />
      <ResponsePreviewPanel fieldValues={values} setField={setField} />
    </>
  ),
};
