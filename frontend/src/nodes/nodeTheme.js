// Shared node styling — update here to restyle every node at once.

export const NODE_DEFAULTS = {
  width: 200,
  minHeight: 80,
};

export const nodeContainerStyle = (width, minHeight, variant) => ({
  width,
  minHeight,
  position: 'relative',
  ...VARIANT_STYLES[variant]?.container,
});

const VARIANT_STYLES = {
  default: {
    container: {
      border: '1px solid #334155',
      borderRadius: '8px',
      background: '#0f172a',
      padding: '8px',
      boxSizing: 'border-box',
      color: '#e2e8f0',
      fontSize: '12px',
    },
    title: { fontWeight: 600, color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' },
  },
  io: {
    container: {
      border: '1px solid #0369a1',
      borderRadius: '8px',
      background: '#082f49',
      padding: '8px',
      boxSizing: 'border-box',
      color: '#e0f2fe',
      fontSize: '12px',
    },
    title: { fontWeight: 600, color: '#7dd3fc', fontSize: '11px', textTransform: 'uppercase' },
  },
  process: {
    container: {
      border: '1px solid #6d28d9',
      borderRadius: '8px',
      background: '#1e1b4b',
      padding: '8px',
      boxSizing: 'border-box',
      color: '#ede9fe',
      fontSize: '12px',
    },
    title: { fontWeight: 600, color: '#c4b5fd', fontSize: '11px', textTransform: 'uppercase' },
  },
  utility: {
    container: {
      border: '1px dashed #64748b',
      borderRadius: '8px',
      background: '#1e293b',
      padding: '8px',
      boxSizing: 'border-box',
      color: '#cbd5e1',
      fontSize: '12px',
    },
    title: { fontWeight: 600, color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' },
  },
};

export const getTitleStyle = (variant = 'default') =>
  VARIANT_STYLES[variant]?.title ?? VARIANT_STYLES.default.title;

export const fieldLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  marginTop: '6px',
};

export const fieldInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  borderRadius: '4px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f1f5f9',
  fontSize: '12px',
};
