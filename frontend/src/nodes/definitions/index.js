// Declarative registry — each entry becomes a React Flow node via defineNode.

import { customInput } from './customInput';
import { constant } from './constant';
import { llm } from './llm';
import { customOutput } from './customOutput';
import { text } from './text';
import { filter } from './filter';
import { merge } from './merge';
import { api } from './api';
import { setVariable } from './setVariable';
import { transform } from './transform';
import { validate } from './validate';
import { retry } from './retry';
import { switchNode } from './switch';

export const nodeDefinitions = {
  customInput,
  constant,
  llm,
  customOutput,
  text,
  filter,
  merge,
  api,
  setVariable,
  transform,
  validate,
  retry,
  switch: switchNode,
};

/** Toolbar display order — left-to-right matches typical pipeline build flow. */
const TOOLBAR_ORDER = [
  'customInput',
  'constant',
  'text',
  'api',
  'setVariable',
  'transform',
  'validate',
  'switch',
  'retry',
  'filter',
  'merge',
  'llm',
  'customOutput',
];

export const toolbarNodes = TOOLBAR_ORDER.map((type) => ({
  type,
  label: nodeDefinitions[type].title,
}));
