// Declarative registry — each entry becomes a React Flow node via defineNode.

import {
  buildTextHandles,
  onTextFieldsChange,
  onInputFieldsChange,
  resolveInputHandleId,
} from './nodeEffects';

export const nodeDefinitions = {
  customInput: {
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
  },

  llm: {
    title: 'LLM',
    variant: 'process',
    description: 'This is a LLM.',
    handles: [
      { type: 'target', position: 'left', id: 'system', style: { top: '33%' } },
      { type: 'target', position: 'left', id: 'prompt', style: { top: '66%' } },
      { type: 'source', position: 'right', id: 'response' },
    ],
  },

  customOutput: {
    title: 'Output',
    variant: 'io',
    handles: () => [{ type: 'target', position: 'left', id: 'value' }],
    fields: [
      {
        name: 'outputName',
        label: 'Name',
        type: 'text',
        defaultValue: (id) => id.replace('customOutput-', 'output_'),
      },
      {
        name: 'outputType',
        label: 'Type',
        type: 'select',
        defaultValue: 'Text',
        options: [
          { value: 'Text', label: 'Text' },
          { value: 'File', label: 'Image' },
        ],
      },
    ],
  },

  text: {
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
  },

  filter: {
    title: 'Filter',
    variant: 'process',
    description: 'Keep rows matching a rule.',
    handles: [
      { type: 'target', position: 'left', id: 'input' },
      { type: 'source', position: 'right', id: 'output' },
    ],
    fields: [
      {
        name: 'rule',
        label: 'Rule',
        type: 'select',
        defaultValue: 'contains',
        options: [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'regex', label: 'Regex' },
        ],
      },
      {
        name: 'pattern',
        label: 'Pattern',
        type: 'text',
        defaultValue: '',
      },
    ],
  },

  merge: {
    title: 'Merge',
    variant: 'process',
    minHeight: 100,
    description: 'Combine two inputs into one stream.',
    handles: [
      { type: 'target', position: 'left', id: 'a', style: { top: '35%' } },
      { type: 'target', position: 'left', id: 'b', style: { top: '65%' } },
      { type: 'source', position: 'right', id: 'merged' },
    ],
    fields: [
      {
        name: 'strategy',
        label: 'Strategy',
        type: 'select',
        defaultValue: 'concat',
        options: [
          { value: 'concat', label: 'Concatenate' },
          { value: 'zip', label: 'Zip' },
          { value: 'overwrite', label: 'Overwrite' },
        ],
      },
    ],
  },

  delay: {
    title: 'Delay',
    variant: 'utility',
    description: 'Pause execution for a duration.',
    handles: [
      { type: 'target', position: 'left', id: 'in' },
      { type: 'source', position: 'right', id: 'out' },
    ],
    fields: [
      {
        name: 'milliseconds',
        label: 'Delay (ms)',
        type: 'number',
        defaultValue: '1000',
        min: 0,
        step: 100,
      },
    ],
  },

  api: {
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
  },

  condition: {
    title: 'Condition',
    variant: 'process',
    minHeight: 100,
    description: 'Route flow based on a comparison.',
    handles: [
      { type: 'target', position: 'left', id: 'value' },
      { type: 'source', position: 'right', id: 'true', style: { top: '35%' } },
      { type: 'source', position: 'right', id: 'false', style: { top: '65%' } },
    ],
    fields: [
      {
        name: 'operator',
        label: 'Operator',
        type: 'select',
        defaultValue: 'eq',
        options: [
          { value: 'eq', label: '==' },
          { value: 'neq', label: '!=' },
          { value: 'gt', label: '>' },
          { value: 'lt', label: '<' },
        ],
      },
      {
        name: 'compareTo',
        label: 'Compare to',
        type: 'text',
        defaultValue: '',
      },
    ],
  },
};

export const toolbarNodes = [
  { type: 'customInput', label: 'Input' },
  { type: 'llm', label: 'LLM' },
  { type: 'customOutput', label: 'Output' },
  { type: 'text', label: 'Text' },
  { type: 'filter', label: 'Filter' },
  { type: 'merge', label: 'Merge' },
  { type: 'delay', label: 'Delay' },
  { type: 'api', label: 'API' },
  { type: 'condition', label: 'Condition' },
];
