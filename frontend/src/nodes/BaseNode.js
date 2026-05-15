// Presentational shell: layout, handles, and declarative fields.

import { Handle, Position } from 'reactflow';
import {
  nodeContainerStyle,
  getTitleStyle,
  fieldLabelStyle,
  fieldInputStyle,
  NODE_DEFAULTS,
} from './nodeTheme';

const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const resolvePosition = (position) =>
  typeof position === 'string' ? POSITION_MAP[position] ?? Position.Left : position;

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

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={field.rows ?? 3}
        style={{ ...fieldInputStyle, resize: 'vertical' }}
      />
    );
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
  children,
}) => {
  const containerStyle = nodeContainerStyle(width, minHeight, variant);
  const titleStyle = getTitleStyle(variant);

  return (
    <div style={containerStyle}>
      {handles.map((handle) => (
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
