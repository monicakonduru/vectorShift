// Side effects for nodes that sync handles/edges with the pipeline store.

import { useStore } from '../store';
import {
  parseTemplateVariables,
  isValidJsIdentifier,
  hasCompleteTemplateVariables,
} from './parseTemplateVariables';
import { resolveVariableHandleId } from '../pipeline/variableRegistry';

export { resolveVariableHandleId };

const textEdgeSyncTimers = new Map();

export const syncTextVariableEdgesNow = (nodeId, text) => {
  const variables = parseTemplateVariables(text);
  useStore.getState().syncTextVariableEdges(nodeId, variables);
};

export const scheduleTextEdgeSync = (nodeId, text) => {
  clearTimeout(textEdgeSyncTimers.get(nodeId));
  textEdgeSyncTimers.set(
    nodeId,
    setTimeout(() => syncTextVariableEdgesNow(nodeId, text), 200)
  );
};

export const buildVariableProviderHandles = ({ fieldValues }) => {
  const name = fieldValues?.varName ?? fieldValues?.inputName;
  const id = resolveVariableHandleId(name);
  return [{ type: 'source', position: 'right', id, tone: 'success' }];
};

export const buildSetVariableHandles = ({ fieldValues }) => {
  const name = fieldValues?.varName;
  const sourceId = isValidJsIdentifier(name)
    ? resolveVariableHandleId(name)
    : 'output';
  return [
    { type: 'target', position: 'left', id: 'input', tone: 'input' },
    { type: 'source', position: 'right', id: sourceId, tone: 'success' },
  ];
};

export const buildTextHandles = ({ fieldValues }) => {
  const variables = parseTemplateVariables(fieldValues?.text ?? '');
  const targets = variables.map((name, index) => ({
    type: 'target',
    position: 'left',
    id: name,
    tone: 'input',
    style: { top: `${((index + 1) / (variables.length + 1)) * 100}%` },
  }));

  return [...targets, { type: 'source', position: 'right', id: 'output', tone: 'success' }];
};

export const onTextFieldsChange = (id, name, value, fieldValues) => {
  if (name === 'text' || name === '__mount__' || name === '__handles__') {
    const text = name === 'text' ? value : fieldValues?.text ?? '';
    if (
      name === '__handles__' ||
      name === '__mount__' ||
      hasCompleteTemplateVariables(text)
    ) {
      syncTextVariableEdgesNow(id, text);
    } else {
      scheduleTextEdgeSync(id, text);
    }
  }
};

export const onProviderFieldsChange = (id, name) => {
  if (
    name === 'varName' ||
    name === 'inputName' ||
    name === '__mount__' ||
    name === '__handles__'
  ) {
    useStore.getState().resyncAllTextVariableEdges();
  }
};

/** @deprecated Use onProviderFieldsChange */
export const onInputFieldsChange = onProviderFieldsChange;

/** @deprecated Use resolveVariableHandleId from variableRegistry */
export const resolveInputHandleId = (inputName) => resolveVariableHandleId(inputName);
