// Shared node styling — update here to restyle every node at once.

export const NODE_DEFAULTS = {
  width: 300,
  minHeight: 88,
};

export const NODE_COLORS = {
  bg: '#0b1120',
  borderDefault: '#334155',
  borderIo: '#4ade80',
  borderProcess: '#a855f7',
  borderUtility: '#64748b',
  titleIo: '#7dd3fc',
  titleProcess: '#c4b5fd',
  titleDefault: '#e2e8f0',
  titleUtility: '#94a3b8',
  purple: '#c084fc',
  green: '#4ade80',
  gold: '#fbbf24',
  blue: '#60a5fa',
  red: '#f87171',
};

const VARIANT_STYLES = {
  default: {
    containerClass: 'pipeline-node--default',
    titleClass: 'pipeline-node__title--default',
  },
  io: {
    containerClass: 'pipeline-node--io',
    titleClass: 'pipeline-node__title--io',
  },
  process: {
    containerClass: 'pipeline-node--process',
    titleClass: 'pipeline-node__title--process',
  },
  utility: {
    containerClass: 'pipeline-node--utility',
    titleClass: 'pipeline-node__title--utility',
  },
};

export const nodeContainerStyle = (width, minHeight) => ({
  width,
  minHeight,
  position: 'relative',
});

export const getVariantClasses = (variant = 'default') =>
  VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;

/** @deprecated inline styles — prefer CSS classes in index.css */
export const getTitleStyle = (variant = 'default') => ({
  fontWeight: 600,
  margin: 0,
  fontSize: '13px',
  letterSpacing: '0.01em',
  textTransform: 'none',
  color:
    variant === 'io'
      ? NODE_COLORS.titleIo
      : variant === 'process'
        ? NODE_COLORS.titleProcess
        : variant === 'utility'
          ? NODE_COLORS.titleUtility
          : NODE_COLORS.titleDefault,
});

export const fieldLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginTop: '8px',
  fontSize: '11px',
  color: NODE_COLORS.purple,
};

export const fieldInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #1e3a5f',
  background: '#060a14',
  color: '#e2e8f0',
  fontSize: '12px',
  fontFamily: 'var(--font-mono)',
};
