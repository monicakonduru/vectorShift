import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'rgba(2, 6, 23, 0.72)',
  backdropFilter: 'blur(6px)',
  animation: 'pipelineModalFadeIn 0.2s ease-out',
};

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  borderRadius: '14px',
  border: '1px solid #334155',
  background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.45)',
  color: '#e2e8f0',
  overflow: 'hidden',
  animation: 'pipelineModalSlideIn 0.25s ease-out',
};

const statGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
  marginTop: '18px',
};

const statCardStyle = {
  borderRadius: '10px',
  border: '1px solid #334155',
  background: '#0f172a',
  padding: '14px 10px',
  textAlign: 'center',
};

const StatCard = ({ label, value, accent }) => (
  <div style={statCardStyle}>
    <div style={{ fontSize: '28px', fontWeight: 700, color: accent, lineHeight: 1.1 }}>
      {value}
    </div>
    <div
      style={{
        fontSize: '11px',
        marginTop: '6px',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </div>
  </div>
);

const DagBanner = ({ isDag }) => {
  const valid = Boolean(isDag);
  return (
    <div
      style={{
        marginTop: '16px',
        padding: '14px 16px',
        borderRadius: '10px',
        border: `1px solid ${valid ? '#166534' : '#9a3412'}`,
        background: valid ? 'rgba(22, 101, 52, 0.2)' : 'rgba(154, 52, 18, 0.2)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          background: valid ? '#14532d' : '#7c2d12',
        }}
        aria-hidden
      >
        {valid ? '✓' : '!'}
      </span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: valid ? '#86efac' : '#fdba74' }}>
          {valid ? 'Valid DAG' : 'Contains a cycle'}
        </div>
        <div style={{ marginTop: '4px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.45 }}>
          {valid
            ? 'Your pipeline has no circular dependencies and can run in order.'
            : 'Remove loops between nodes so the pipeline can execute safely.'}
        </div>
      </div>
    </div>
  );
};

const ErrorBanner = ({ message }) => (
  <div
    style={{
      marginTop: '16px',
      padding: '14px 16px',
      borderRadius: '10px',
      border: '1px solid #991b1b',
      background: 'rgba(153, 27, 27, 0.25)',
      fontSize: '13px',
      color: '#fecaca',
      lineHeight: 1.45,
    }}
  >
    {message}
  </div>
);

export const PipelineAnalysisModal = ({ open, onClose, result, error }) => {
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
        <div style={{ padding: '22px 22px 20px' }}>
          <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
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
                  style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 600, color: '#f8fafc' }}
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {error ? (
              <ErrorBanner message={error} />
            ) : (
              <>
                <div style={statGridStyle}>
                  <StatCard label="Nodes" value={result.num_nodes} accent="#7dd3fc" />
                  <StatCard label="Edges" value={result.num_edges} accent="#c4b5fd" />
                  <StatCard
                    label="DAG"
                    value={result.is_dag ? 'Yes' : 'No'}
                    accent={result.is_dag ? '#86efac' : '#fdba74'}
                  />
                </div>
                <DagBanner isDag={result.is_dag} />
              </>
            )}
        </div>

        <div style={{ padding: '0 22px 22px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
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
