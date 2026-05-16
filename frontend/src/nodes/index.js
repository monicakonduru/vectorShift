import { InputNode } from './inputNode';
import { OutputNode } from './outputNode';
import { LLMNode } from './llmNode';
import { TextNode } from './textNode';
import { FilterNode } from './filterNode';
import { MergeNode } from './mergeNode';
import { DelayNode } from './delayNode';
import { ApiNode } from './apiNode';
import { ConditionNode } from './conditionNode';

export { createNode } from './createNode';
export { BaseNode, resolveHandles } from './BaseNode';

export const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  merge: MergeNode,
  delay: DelayNode,
  api: ApiNode,
  condition: ConditionNode,
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
