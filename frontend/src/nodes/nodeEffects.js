// Side effects for nodes that sync handles/edges with the pipeline store.

import { useStore } from '../store';
import {
  parseTemplateVariables,
  isValidJsIdentifier,
  hasCompleteTemplateVariables,
} from './parseTemplateVariables';

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

export const buildTextHandles = ({ fieldValues }) => {
  const variables = parseTemplateVariables(fieldValues?.text ?? '');
  const targets = variables.map((name, index) => ({
    type: 'target',
    position: 'left',
    id: name,
    style: { top: `${((index + 1) / (variables.length + 1)) * 100}%` },
  }));

  return [...targets, { type: 'source', position: 'right', id: 'output' }];
};

export const onTextFieldsChange = (id, name, value, fieldValues) => {
  if (name === 'text' || name === '__mount__' || name === '__handles__') {
    const text = name === 'text' ? value : fieldValues?.text ?? '';
    // Connect immediately when a full {{ var }} exists (dropdown pick / pill insert).
    // Debounce only while user is still typing a partial {{ ... without closing.
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

export const resolveInputHandleId = (inputName) =>
  isValidJsIdentifier(inputName) ? inputName : 'value';

export const onInputFieldsChange = (id, name) => {
  if (name === 'inputName' || name === '__mount__' || name === '__handles__') {
    useStore.getState().resyncAllTextVariableEdges();
  }
};
