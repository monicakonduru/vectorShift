import { isValidJsIdentifier } from '../nodes/parseTemplateVariables';
import {
  getVariableNameFromNode,
  isVariableProvider,
  VARIABLE_PROVIDER_TYPES,
} from './variableRegistry';

export const variableHandleId = (nodeId, varName) => `${nodeId}-${varName}`;

export { VARIABLE_PROVIDER_TYPES, getVariableNameFromNode, isVariableProvider };

export const findVariableProviders = (nodes, varName) =>
  nodes.filter(
    (n) => isVariableProvider(n) && getVariableNameFromNode(n) === varName && isValidJsIdentifier(varName)
  );

export const collectAvailableVariables = (nodes) => {
  const names = new Set();
  nodes.forEach((node) => {
    if (!isVariableProvider(node)) return;
    const name = getVariableNameFromNode(node);
    if (isValidJsIdentifier(name)) names.add(name);
  });
  return [...names].sort();
};
