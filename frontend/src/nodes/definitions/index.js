// Declarative registry — each entry becomes a React Flow node via defineNode.

import { customInput } from './customInput';
import { llm } from './llm';
import { customOutput } from './customOutput';
import { text } from './text';
import { filter } from './filter';
import { merge } from './merge';
import { delay } from './delay';
import { api } from './api';
import { condition } from './condition';

export const nodeDefinitions = {
  customInput,
  llm,
  customOutput,
  text,
  filter,
  merge,
  delay,
  api,
  condition,
};

/** Toolbar display order (labels come from each definition's title). */
const TOOLBAR_ORDER = [
  'customInput',
  'llm',
  'customOutput',
  'text',
  'filter',
  'merge',
  'delay',
  'api',
  'condition',
];

export const toolbarNodes = TOOLBAR_ORDER.map((type) => ({
  type,
  label: nodeDefinitions[type].title,
}));
