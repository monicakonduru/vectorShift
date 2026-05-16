// Factory: declare a node with config instead of duplicating boilerplate.

import { useState, useCallback, useEffect } from 'react';
import { BaseNode } from './BaseNode';
import { NODE_DEFAULTS } from './nodeTheme';
import { useStore } from '../store';

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
 * @param {Array|function} [config.handles] - Static list or (ctx) => { id, type, position, style? }[]
 * @param {Array} [config.fields] - { name, label, type, defaultValue?, options?, ... }
 * @param {function} [config.render] - Optional custom body: ({ id, data, values, setField }) => ReactNode
 * @param {function} [config.onFieldsChange] - (id, fieldName, value, fieldValues) => void
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
    onFieldsChange,
  } = config;

  const NodeComponent = ({ id, data }) => {
    const [fieldValues, setFieldValues] = useState(() =>
      buildInitialFieldValues(fields, id, data)
    );

    const onFieldChange = useCallback(
      (name, value) => {
        setFieldValues((prev) => {
          const next = { ...prev, [name]: value };
          useStore.getState().updateNodeField(id, name, value);
          onFieldsChange?.(id, name, value, next);
          return next;
        });
      },
      [id]
    );

    useEffect(() => {
      fields.forEach((field) => {
        useStore.getState().updateNodeField(id, field.name, fieldValues[field.name]);
      });
      onFieldsChange?.(id, '__mount__', null, fieldValues);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
        data={data}
      >
        {customBody}
      </BaseNode>
    );
  };

  NodeComponent.displayName = `${title.replace(/\s+/g, '')}Node`;
  return NodeComponent;
}
