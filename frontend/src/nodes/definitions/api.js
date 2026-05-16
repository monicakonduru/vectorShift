export const api = {
  title: 'API',
  variant: 'io',
  minHeight: 110,
  handles: [
    { type: 'target', position: 'left', id: 'payload' },
    { type: 'source', position: 'right', id: 'response' },
  ],
  fields: [
    {
      name: 'method',
      label: 'Method',
      type: 'select',
      defaultValue: 'GET',
      options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
      ],
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      defaultValue: 'https://api.example.com',
    },
  ],
};
