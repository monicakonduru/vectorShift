// BaseNode: declarative nodes — define config once; layout, state, store sync, and fields are handled here.

import { useRef, useState, useLayoutEffect, useCallback, useEffect, useMemo } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { useStore } from '../store';
import {
  nodeContainerStyle,
  getTitleStyle,
  fieldLabelStyle,
  fieldInputStyle,
  NODE_DEFAULTS,
} from './nodeTheme';
import { VariableAutocompleteTextarea } from './VariableAutocompleteTextarea';

const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const resolvePosition = (position) =>
  typeof position === 'string' ? POSITION_MAP[position] ?? Position.Left : position;

const resolveDefault = (defaultValue, id, data) => {
  if (typeof defaultValue === 'function') return defaultValue(id, data);
  if (defaultValue !== undefined) return defaultValue;
  return '';
};

const buildInitialFieldValues = (fields, id, data) =>
  fields.reduce((acc, field) => {
    acc[field.name] = data?.[field.name] ?? resolveDefault(field.defaultValue, id, data);
    return acc;
  }, {});

/** Static list or (ctx) => Handle[] */
export const resolveHandles = (handles, context) => {
  if (typeof handles === 'function') return handles(context) ?? [];
  return handles ?? [];
};

const AutoGrowTextarea = ({ field, value, onChange }) => {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={field.rows ?? 1}
      style={{ ...fieldInputStyle, resize: 'none', overflow: 'hidden' }}
    />
  );
};

const NodeDeleteButton = ({ nodeId }) => {
  const deleteNode = useStore((state) => state.deleteNode);

  return (
    <button
      type="button"
      className="node-delete-btn nodrag nopan"
      aria-label="Remove node"
      onClick={(event) => {
        event.stopPropagation();
        deleteNode(nodeId);
      }}
    >
      ×
    </button>
  );
};

const FieldControl = ({ field, value, onChange }) => {
  if (field.type === 'static') {
    return <span>{field.content ?? value}</span>;
  }

  if (field.type === 'select') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldInputStyle}>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'variable-textarea') {
    return <VariableAutocompleteTextarea field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'textarea') {
    return <AutoGrowTextarea field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={value}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(e) => onChange(e.target.value)}
        style={fieldInputStyle}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={fieldInputStyle}
    />
  );
};

const BaseNodeView = ({
  id,
  title,
  variant = 'default',
  width = NODE_DEFAULTS.width,
  minHeight = NODE_DEFAULTS.minHeight,
  handles = [],
  fields = [],
  fieldValues = {},
  onFieldChange,
  description,
  data,
  children,
  onHandlesUpdated,
}) => {
  const containerStyle = nodeContainerStyle(width, minHeight, variant);
  const titleStyle = getTitleStyle(variant);

  const resolvedHandles = useMemo(
    () =>
      resolveHandles(handles, {
        id,
        title,
        variant,
        width,
        minHeight,
        fields,
        fieldValues,
        description,
        data,
      }),
    [handles, id, title, variant, width, minHeight, fields, fieldValues, description, data]
  );

  const handleSignature = useMemo(
    () => resolvedHandles.map((h) => `${h.type}:${h.id}`).join('|'),
    [resolvedHandles]
  );

  const updateNodeInternals = useUpdateNodeInternals();

  // React Flow must recalculate handle positions when handles are added/removed (e.g. {{var}} in Text node).
  useLayoutEffect(() => {
    updateNodeInternals(id);
    onHandlesUpdated?.(id, fieldValues);
    // Only re-run when handle set changes, not on every field keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, handleSignature, updateNodeInternals, onHandlesUpdated]);

  return (
    <div style={containerStyle}>
      <NodeDeleteButton nodeId={id} />
      {resolvedHandles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={resolvePosition(handle.position)}
          id={`${id}-${handle.id}`}
          style={handle.style}
          isConnectable
        />
      ))}

      <header style={{ ...titleStyle, margin: 0, paddingRight: '26px' }}>{title}</header>

      {description ? (
        <div style={{ marginTop: '4px', opacity: 0.85 }}>{description}</div>
      ) : null}

      {fields.map((field) => (
        <label key={field.name} style={fieldLabelStyle}>
          {field.label}:
          <FieldControl
            field={field}
            value={fieldValues[field.name] ?? ''}
            onChange={(val) => onFieldChange(field.name, val)}
          />
        </label>
      ))}

      {children}
    </div>
  );
};

/**
 * Create a React Flow node component from a declarative config.
 * Handles local field state, Zustand sync, handles, and optional side effects.
 */
export function defineNode(config) {
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

    const onHandlesUpdated = onFieldsChange
      ? (nodeId, values) => onFieldsChange(nodeId, '__handles__', null, values)
      : undefined;

    return (
      <BaseNodeView
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
        onHandlesUpdated={onHandlesUpdated}
      >
        {customBody}
      </BaseNodeView>
    );
  };

  NodeComponent.displayName = `${title.replace(/\s+/g, '')}Node`;
  return NodeComponent;
}

/** @deprecated Use defineNode */
export const createNode = defineNode;

/** Build nodeTypes map from a definitions registry */
export const buildNodeTypes = (definitions) =>
  Object.fromEntries(
    Object.entries(definitions).map(([type, config]) => [type, defineNode(config)])
  );