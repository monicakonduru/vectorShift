import { isValidJsIdentifier } from '../nodes/parseTemplateVariables';

export const VARIABLE_PROVIDER_TYPES = ['customInput', 'constant', 'setVariable'];

export const resolveVariableHandleId = (name) =>
  isValidJsIdentifier(name) ? name : 'value';

export const getVariableNameFromNode = (node) => {
  if (!node) return null;
  if (node.type === 'customInput') return node.data?.inputName;
  if (node.type === 'constant' || node.type === 'setVariable') return node.data?.varName;
  return null;
};

export const getVariableValueFromNode = (node) => {
  if (!node) return null;
  if (node.type === 'customInput') {
    return node.data?.value ?? node.data?.defaultValue ?? '';
  }
  if (node.type === 'constant') return node.data?.value ?? '';
  if (node.type === 'setVariable') {
    return node.data?.extractedValue ?? node.data?.defaultValue ?? '';
  }
  return null;
};

export const isVariableProvider = (node) =>
  VARIABLE_PROVIDER_TYPES.includes(node?.type);

export const resolveVariableValue = (nodes, varName) => {
  const provider = nodes.find(
    (n) => isVariableProvider(n) && getVariableNameFromNode(n) === varName
  );
  return provider ? getVariableValueFromNode(provider) : null;
};
