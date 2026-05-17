// BaseNode: declarative nodes — define config once; layout, state, store sync, and fields are handled here.

import { useRef, useState, useLayoutEffect, useCallback, useEffect, useMemo } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { useStore } from '../store';
import {
  nodeContainerStyle,
  getVariantClasses,
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

const NODE_ICONS = {
  api: (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  input: '⇢',
  output: '⇠',
  llm: '✦',
  text: '¶',
  filter: '⧉',
  merge: '⊕',
  constant: '◆',
  setVariable: '⊛',
  transform: '⤨',
  validate: '✓',
  retry: '↻',
  switch: '⑂',
  default: '●',
};

const resolvePosition = (position) =>
  typeof position === 'string' ? POSITION_MAP[position] ?? Position.Left : position;

const resolveDefault = (defaultValue, id, data) => {
  if (typeof defaultValue === 'function') return defaultValue(id, data);
  if (defaultValue !== undefined) return defaultValue;
  return '';
};

const buildInitialFieldValues = (fields, id, data) => {
  const values = {};
  const walk = (list) => {
    list.forEach((field) => {
      if (field.type === 'section') {
        walk(field.fields ?? []);
        return;
      }
      values[field.name] = data?.[field.name] ?? resolveDefault(field.defaultValue, id, data);
    });
  };
  walk(fields);
  return values;
};

/** Static list or (ctx) => Handle[] */
export const resolveHandles = (handles, context) => {
  if (typeof handles === 'function') return handles(context) ?? [];
  return handles ?? [];
};

const flattenFields = (fields) =>
  fields.flatMap((field) => (field.type === 'section' ? field.fields ?? [] : [field]));

const AutoGrowTextarea = ({ field, value, onChange, className }) => {
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
      placeholder={field.placeholder}
      className={className}
      style={{ ...fieldInputStyle, resize: 'none', overflow: 'hidden' }}
    />
  );
};

const NodeDeleteButton = ({ nodeId }) => {
  const deleteNode = useStore((state) => state.deleteNode);

  return (
    <button
      type="button"
      className="pipeline-node__action pipeline-node__action--danger nodrag nopan"
      aria-label="Remove node"
      title="Delete"
      onClick={(event) => {
        event.stopPropagation();
        deleteNode(nodeId);
      }}
    >
      <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        />
      </svg>
    </button>
  );
};

const FieldControl = ({ field, value, onChange, className }) => {
  if (field.type === 'static') {
    return null;
  }

  if (field.type === 'select' && field.layout === 'method-badge') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pipeline-node__method-select nodrag nopan ${className ?? ''}`}
        aria-label={field.label ?? 'HTTP method'}
      >
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
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
    return <VariableAutocompleteTextarea field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'textarea') {
    return <AutoGrowTextarea field={field} value={value} onChange={onChange} className={className} />;
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
        className={className}
        style={fieldInputStyle}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={fieldInputStyle}
    />
  );
};

const CollapsibleSection = ({ field, fieldValues, onFieldChange }) => {
  const [open, setOpen] = useState(!field.collapsed);

  return (
    <section className="pipeline-node__section nodrag nopan">
      <button
        type="button"
        className="pipeline-node__section-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`pipeline-node__chevron ${open ? 'is-open' : ''}`} aria-hidden="true">
          ▸
        </span>
        {field.label}
      </button>
      {open ? (
        <div className="pipeline-node__section-body">
          {(field.fields ?? []).map((subField) => (
            <label key={subField.name} style={fieldLabelStyle}>
              {subField.label}:
              <FieldControl
                field={subField}
                value={fieldValues[subField.name] ?? ''}
                onChange={(val) => onFieldChange(subField.name, val)}
              />
            </label>
          ))}
        </div>
      ) : null}
    </section>
  );
};

const PipelineHandle = ({ handle, nodeId }) => {
  const tone = handle.tone ?? 'default';
  const position = resolvePosition(handle.position);
  const isRight = position === Position.Right;

  const groupStyle = {
    top: handle.style?.top ?? '50%',
    ...handle.style,
  };

  return (
    <div
      className={`pipeline-handle-group pipeline-handle-group--${tone} ${
        isRight ? 'pipeline-handle-group--right' : 'pipeline-handle-group--left'
      }`}
      style={groupStyle}
    >
      {handle.label && isRight ? (
        <span className={`pipeline-handle-label pipeline-handle-label--${tone}`}>
          {handle.label}
        </span>
      ) : null}
      <Handle
        type={handle.type}
        position={position}
        id={`${nodeId}-${handle.id}`}
        className={`pipeline-handle pipeline-handle--${tone}`}
        isConnectable
      />
    </div>
  );
};

const NodeHeader = ({ title, variant, icon, nodeId, showStatus }) => {
  const variantClasses = getVariantClasses(variant);
  const iconContent = NODE_ICONS[icon] ?? NODE_ICONS.default;

  return (
    <header className="pipeline-node__header">
      <span className="pipeline-node__icon" aria-hidden="true">
        {iconContent}
      </span>
      <h3 className={`pipeline-node__title ${variantClasses.titleClass}`}>{title}</h3>
      {showStatus ? (
        <span className="pipeline-node__status-dot" title="Configured" aria-label="Configured">
          ✓
        </span>
      ) : null}
      <div className="pipeline-node__actions nodrag nopan">
        <NodeDeleteButton nodeId={nodeId} />
      </div>
    </header>
  );
};

const NodeFields = ({ fields, fieldValues, onFieldChange }) => {
  const requestFields = fields.filter((f) => f.group === 'request-row');
  const otherFields = fields.filter(
    (f) => f.group !== 'request-row' && f.type !== 'section' && f.type !== 'static'
  );
  const sections = fields.filter((f) => f.type === 'section');

  return (
    <div className="pipeline-node__fields nodrag nopan">
      {requestFields.length > 0 ? (
        <div className="pipeline-node__request-row">
          {requestFields.map((field) => (
            <FieldControl
              key={field.name}
              field={field}
              value={fieldValues[field.name] ?? ''}
              onChange={(val) => onFieldChange(field.name, val)}
              className={field.name === 'url' ? 'pipeline-node__url-input' : undefined}
            />
          ))}
        </div>
      ) : null}

      {sections.map((field) => (
        <CollapsibleSection
          key={field.name}
          field={field}
          fieldValues={fieldValues}
          onFieldChange={onFieldChange}
        />
      ))}

      {otherFields.map((field) => (
        <label
          key={field.name}
          style={field.hideLabel ? { ...fieldLabelStyle, marginTop: '8px' } : fieldLabelStyle}
          className={field.hideLabel ? 'pipeline-node__field--bare' : undefined}
        >
          {!field.hideLabel ? `${field.label}:` : null}
          <FieldControl
            field={field}
            value={fieldValues[field.name] ?? ''}
            onChange={(val) => onFieldChange(field.name, val)}
          />
        </label>
      ))}
    </div>
  );
};

const BaseNodeView = ({
  id,
  title,
  variant = 'default',
  icon,
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
  showStatus,
}) => {
  const containerStyle = nodeContainerStyle(width, minHeight);
  const variantClasses = getVariantClasses(variant);

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

  useLayoutEffect(() => {
    updateNodeInternals(id);
    onHandlesUpdated?.(id, fieldValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, handleSignature, updateNodeInternals, onHandlesUpdated]);

  return (
    <div
      className={`pipeline-node ${variantClasses.containerClass}`}
      style={containerStyle}
    >
      {resolvedHandles.map((handle) => (
        <PipelineHandle key={handle.id} handle={handle} nodeId={id} />
      ))}

      <NodeHeader
        title={title}
        variant={variant}
        icon={icon}
        nodeId={id}
        showStatus={showStatus}
      />

      {description ? <p className="pipeline-node__description">{description}</p> : null}

      {fields.length > 0 ? (
        <NodeFields fields={fields} fieldValues={fieldValues} onFieldChange={onFieldChange} />
      ) : null}

      {children}
    </div>
  );
};

export function defineNode(config) {
  const {
    title,
    variant = 'default',
    icon,
    width = NODE_DEFAULTS.width,
    minHeight = NODE_DEFAULTS.minHeight,
    description,
    handles = [],
    fields = [],
    render,
    onFieldsChange,
    showStatus,
  } = config;

  const allFields = flattenFields(fields);

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
      allFields.forEach((field) => {
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
        icon={icon}
        width={width}
        minHeight={minHeight}
        handles={handles}
        fields={fields}
        fieldValues={fieldValues}
        onFieldChange={onFieldChange}
        description={description}
        data={data}
        onHandlesUpdated={onHandlesUpdated}
        showStatus={showStatus}
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

export const buildNodeTypes = (definitions) =>
  Object.fromEntries(
    Object.entries(definitions).map(([type, config]) => [type, defineNode(config)])
  );
