// Presentational shell: layout, handles, and declarative fields.

import { useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
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

/**
 * @param {Array|function} handles - Static list or (ctx) => Handle[]
 * @param {object} context
 * @returns {Array}
 */
export const resolveHandles = (handles, context) => {
  if (typeof handles === 'function') {
    return handles(context) ?? [];
  }
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

const FieldControl = ({ field, value, onChange }) => {
  if (field.type === 'static') {
    return <span>{field.content ?? value}</span>;
  }

  if (field.type === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={fieldInputStyle}
      >
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'variable-textarea') {
    return (
      <VariableAutocompleteTextarea field={field} value={value} onChange={onChange} />
    );
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

export const BaseNode = ({
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

  return (
    <div style={containerStyle}>
      {resolvedHandles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={resolvePosition(handle.position)}
          id={`${id}-${handle.id}`}
          style={handle.style}
        />
      ))}

      <header style={{ ...titleStyle, margin: 0 }}>{title}</header>

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
