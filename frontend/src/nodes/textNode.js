import { createNode } from './createNode';
import { parseTemplateVariables } from './parseTemplateVariables';
import { useStore } from '../store';

const textEdgeSyncTimers = new Map();

const scheduleTextEdgeSync = (nodeId, text) => {
  clearTimeout(textEdgeSyncTimers.get(nodeId));
  textEdgeSyncTimers.set(
    nodeId,
    setTimeout(() => {
      const variables = parseTemplateVariables(text);
      useStore.getState().syncTextVariableEdges(nodeId, variables);
    }, 200)
  );
};

const buildTextHandles = ({ fieldValues }) => {
  const variables = parseTemplateVariables(fieldValues?.text ?? '');
  const targets = variables.map((name, index) => ({
    type: 'target',
    position: 'left',
    id: name,
    style: { top: `${((index + 1) / (variables.length + 1)) * 100}%` },
  }));

  return [...targets, { type: 'source', position: 'right', id: 'output' }];
};

const onTextFieldsChange = (id, name, value, fieldValues) => {
  if (name === 'text' || name === '__mount__') {
    const text = name === 'text' ? value : fieldValues?.text ?? '';
    scheduleTextEdgeSync(id, text);
  }
};

export const TextNode = createNode({
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
});
