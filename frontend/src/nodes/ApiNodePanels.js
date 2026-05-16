import { useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
import { parseTemplateVariables } from './parseTemplateVariables';
import { formatVariable } from './templateEditor';

const selectNodes = (state) => state.nodes;

const resolveVariableValue = (nodes, varName) => {
  const provider = nodes.find(
    (n) => n.type === 'customInput' && n.data?.inputName === varName
  );
  if (!provider) return null;
  return provider.data?.defaultValue ?? provider.data?.value ?? null;
};

const JsonPreview = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <span className="pipeline-json-preview__empty">No response yet</span>;
  }

  return (
    <dl className="pipeline-json-preview">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="pipeline-json-preview__row">
          <dt>{key}</dt>
          <dd data-type={typeof value}>{formatJsonValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
};

const formatJsonValue = (value) => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    return value.length > 42 ? `${value.slice(0, 42)}…` : value;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const SavedVariablesPanel = ({ fieldValues }) => {
  const nodes = useStore(selectNodes, shallow);

  const variables = useMemo(() => {
    const text = [fieldValues?.url, fieldValues?.headers, fieldValues?.body]
      .filter(Boolean)
      .join('\n');
    return parseTemplateVariables(text);
  }, [fieldValues?.url, fieldValues?.headers, fieldValues?.body]);

  if (variables.length === 0) return null;

  return (
    <section className="pipeline-node__saved-vars nodrag nopan">
      <h4 className="pipeline-node__saved-vars-title">Saved variables</h4>
      <ul className="pipeline-node__saved-vars-list">
        {variables.map((name) => {
          const resolved = resolveVariableValue(nodes, name);
          return (
            <li key={name} className="pipeline-node__saved-var">
              <span className="pipeline-node__var-name">{formatVariable(name)}</span>
              <span className="pipeline-node__var-eq">=</span>
              <span className="pipeline-node__var-value">
                {resolved ?? <em className="pipeline-node__var-unset">not set</em>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export const ResponsePreviewPanel = ({ fieldValues, setField }) => {
  const [hidden, setHidden] = useState(false);
  const status = fieldValues?.lastStatus;
  const body = fieldValues?.lastResponse;
  const hasResponse = status != null && status !== '';

  if (!hasResponse && !body) {
    return (
      <p className="pipeline-node__response-hint nodrag nopan">
        Run this node to preview the response body here.
      </p>
    );
  }

  let parsed = body;
  if (typeof body === 'string') {
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = { body };
    }
  }

  return (
    <section className="pipeline-node__response nodrag nopan">
      <div className="pipeline-node__response-toolbar">
        {status ? (
          <span
            className={`pipeline-node__status-badge ${
              Number(status) >= 200 && Number(status) < 300
                ? 'pipeline-node__status-badge--ok'
                : 'pipeline-node__status-badge--err'
            }`}
          >
            {status}
          </span>
        ) : null}
        <button
          type="button"
          className="pipeline-node__text-btn"
          onClick={() => setHidden((v) => !v)}
        >
          {hidden ? 'Show' : 'Hide'}
        </button>
        <button
          type="button"
          className="pipeline-node__text-btn pipeline-node__text-btn--muted"
          onClick={() => {
            setField('lastStatus', '');
            setField('lastResponse', '');
          }}
        >
          Clear
        </button>
      </div>
      {!hidden ? (
        <>
          <p className="pipeline-node__response-hint">
            Click any field to save as {'{{variable}}'}
          </p>
          <div className="pipeline-node__response-body">
            <JsonPreview data={parsed} />
          </div>
        </>
      ) : null}
    </section>
  );
};
