import { nodeDefinitions } from './nodeDefinitions';

/** Seed store node.data with field defaults so handles match edges immediately. */
export const buildDefaultNodeData = (nodeId, type) => {
  const definition = nodeDefinitions[type];
  const data = { id: nodeId, nodeType: type };

  if (!definition?.fields?.length) {
    return data;
  }

  definition.fields.forEach((field) => {
    if (typeof field.defaultValue === 'function') {
      data[field.name] = field.defaultValue(nodeId, data);
    } else if (field.defaultValue !== undefined) {
      data[field.name] = field.defaultValue;
    } else {
      data[field.name] = '';
    }
  });

  return data;
};
