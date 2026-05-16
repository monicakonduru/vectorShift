import { nodeDefinitions } from './definitions';

/** Seed store node.data with field defaults so handles match edges immediately. */
export const buildDefaultNodeData = (nodeId, type) => {
  const definition = nodeDefinitions[type];
  const data = { id: nodeId, nodeType: type };

  if (!definition?.fields?.length) {
    return data;
  }

  const seedField = (field) => {
    if (field.type === 'section') {
      (field.fields ?? []).forEach(seedField);
      return;
    }
    if (typeof field.defaultValue === 'function') {
      data[field.name] = field.defaultValue(nodeId, data);
    } else if (field.defaultValue !== undefined) {
      data[field.name] = field.defaultValue;
    } else {
      data[field.name] = '';
    }
  };

  definition.fields.forEach(seedField);

  return data;
};
