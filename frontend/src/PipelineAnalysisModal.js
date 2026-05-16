import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildPipelineSummary } from './pipeline/buildPipelineSummary';

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  background: 'rgba(2, 6, 23, 0.72)',
  backdropFilter: 'blur(6px)',
  animation: 'pipelineModalFadeIn 0.2s ease-out',
};

const cardStyle = {
  width: '100%',
  maxWidth: '440px',
  borderRadius: '12px',
  border: '1px solid #334155',
  background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  color: '#e2e8f0',
  animation: 'pipelineModalSlideIn 0.25s ease-out',
};

const MetricsRow = ({ result, summary }) => {
  const dagValid = Boolean(result.is_dag);
  return (
    <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          marginTop: '14px',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid #334155',
          background: '#0f172a',
          fontSize: '13px',
        }}
      >
        <span style={{ color: '#7dd3fc', fontWeight: 600 }}>{result.num_nodes}</span>
        <span style={{ color: '#64748b' }}>nodes</span>
        <span style={{ color: '#475569' }}>·</span>
        <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{result.num_edges}</span>
        <span style={{ color: '#64748b' }}>edges</span>
        <span style={{ color: '#475569' }}>·</span>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 500,
            color: dagValid ? '#86efac' : '#fdba74',
            background: dagValid ? 'rgba(22, 101, 52, 0.35)' : 'rgba(154, 52, 18, 0.35)',
            border: `1px solid ${dagValid ? '#166534' : '#9a3412'}`,
          }}
        >
          {dagValid ? 'Valid DAG' : 'Has cycle'}
        </span>
        {summary.disconnectedCount > 0 && (
          <>
            <span style={{ color: '#475569' }}>·</span>
            <span style={{ fontSize: '12px', color: '#fdba74' }}>
              {summary.disconnectedCount} Unconnected Node
              {summary.disconnectedCount === 1 ? '' : 's'}
            </span>
          </>
        )}
      </div>
  );
};

const PipelineContentsSummary = ({ summary }) => {
  const [expanded, setExpanded] = useState(false);

  if (summary.isEmpty) {
    return (
      <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: 1.45 }}>
        No nodes yet — drag components from the toolbar onto the canvas.
      </p>
    );
  }

  const hasDetails =
    summary.nodeItems.length > 0 || summary.connections.length > 0;

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {summary.typeCounts.map(({ type, count }) => (
          <span
            key={type}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: '#1e293b',
              fontSize: '11px',
              color: '#cbd5e1',
            }}
          >
            {count}× {type}
          </span>
        ))}
      </div>

      {summary.flowLine && (
        <p
          style={{
            margin: '10px 0 0',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid #334155',
            background: '#0f172a',
            fontSize: '12px',
            color: '#cbd5e1',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={summary.flowLine}
        >
          {summary.flowLine}
        </p>
      )}

      {hasDetails && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            style={{
              marginTop: '10px',
              padding: 0,
              border: 'none',
              background: 'none',
              color: '#94a3b8',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            {expanded ? 'Hide details' : `Show details (${summary.nodeItems.length} nodes)`}
          </button>

          {expanded && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0f172a',
                maxHeight: '110px',
                overflowY: 'auto',
                fontSize: '12px',
              }}
            >
              {summary.nodeItems.map((node) => (
                <div
                  key={node.id}
                    style={{
                      padding: '3px 0',
                      color: '#e2e8f0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={`${node.type}: ${node.label}`}
                  >
                    <span style={{ color: '#64748b' }}>{node.type}</span>
                    <span style={{ color: '#475569' }}> · </span>
                    {node.label}
                </div>
              ))}
              {summary.connections.length > 0 && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #1e293b' }}>
                  {summary.connections.map((connection, index) => (
                    <div
                      key={`${connection.from}-${connection.to}-${index}`}
                      style={{
                        padding: '2px 0',
                        color: '#94a3b8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={`${connection.from} → ${connection.to}`}
                    >
                      {connection.from} → {connection.to}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ErrorBanner = ({ message }) => (
  <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#fecaca', lineHeight: 1.45 }}>
    {message}
  </p>
);

export const PipelineAnalysisModal = ({ open, onClose, result, error, nodes = [], edges = [] }) => {
  const pipelineSummary = useMemo(
    () => buildPipelineSummary(nodes, edges),
    [nodes, edges]
  );

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div style={backdropStyle} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-analysis-title"
        style={cardStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: '18px 18px 14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748b',
                }}
              >
                Analysis complete
              </p>
              <h2
                id="pipeline-analysis-title"
                style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}
              >
                Pipeline summary
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                border: 'none',
                background: '#334155',
                color: '#cbd5e1',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {error ? (
            <ErrorBanner message={error} />
          ) : (
            <>
              <MetricsRow result={result} summary={pipelineSummary} />
              <PipelineContentsSummary summary={pipelineSummary} />
            </>
          )}
        </div>

        <div style={{ padding: '0 18px 16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #475569',
              background: '#334155',
              color: '#e2e8f0',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
