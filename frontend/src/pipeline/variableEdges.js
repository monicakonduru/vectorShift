import { isValidJsIdentifier } from '../nodes/parseTemplateVariables';

export const variableHandleId = (nodeId, varName) => `${nodeId}-${varName}`;

export const findVariableProviders = (nodes, varName) =>
  nodes.filter(
    (n) =>
      n.type === 'customInput' &&
      n.data?.inputName === varName &&
      isValidJsIdentifier(varName)
  );

export const collectAvailableVariables = (nodes) => {
  const names = new Set();
  nodes.forEach((node) => {
    if (node.type !== 'customInput') return;
    const name = node.data?.inputName;
    if (isValidJsIdentifier(name)) names.add(name);
  });
  return [...names].sort();
};
