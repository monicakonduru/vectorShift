// Factory: declare a node with config instead of duplicating boilerplate.

import { useState, useCallback } from 'react';
import { BaseNode } from './BaseNode';
import { NODE_DEFAULTS } from './nodeTheme';

const resolveDefault = (defaultValue, id, data) => {
  if (typeof defaultValue === 'function') {
    return defaultValue(id, data);
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  return '';
};

const buildInitialFieldValues = (fields, id, data) =>
  fields.reduce((acc, field) => {
    acc[field.name] = data?.[field.name] ?? resolveDefault(field.defaultValue, id, data);
    return acc;
  }, {});

/**
 * @param {object} config
 * @param {string} config.title - Header label
 * @param {'default'|'io'|'process'|'utility'} [config.variant]
 * @param {number} [config.width]
 * @param {number} [config.minHeight]
 * @param {string} [config.description] - Static helper text
 * @param {Array} [config.handles] - { id, type, position, style? }
 * @param {Array} [config.fields] - { name, label, type, defaultValue?, options?, ... }
 * @param {function} [config.render] - Optional custom body: ({ id, data, values, setField }) => ReactNode
 */
export function createNode(config) {
  const {
    title,
    variant = 'default',
    width = NODE_DEFAULTS.width,
    minHeight = NODE_DEFAULTS.minHeight,
    description,
    handles = [],
    fields = [],
    render,
  } = config;

  const NodeComponent = ({ id, data }) => {
    const [fieldValues, setFieldValues] = useState(() =>
      buildInitialFieldValues(fields, id, data)
    );

    const onFieldChange = useCallback((name, value) => {
      setFieldValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    const customBody = render
      ? render({ id, data, values: fieldValues, setField: onFieldChange })
      : null;

    return (
      <BaseNode
        id={id}
        title={title}
        variant={variant}
        width={width}
        minHeight={minHeight}
        handles={handles}
        fields={fields}
        fieldValues={fieldValues}
        onFieldChange={onFieldChange}
        description={description}
      >
        {customBody}
      </BaseNode>
    );
  };

  NodeComponent.displayName = `${title.replace(/\s+/g, '')}Node`;
  return NodeComponent;
}
