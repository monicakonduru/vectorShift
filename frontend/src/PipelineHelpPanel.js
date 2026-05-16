import { useState } from 'react';

const tips = [
  { label: 'Add', text: 'Drag blocks from the top toolbar onto the canvas' },
  { label: 'Move', text: 'Drag a node to reposition it' },
  { label: 'Connect', text: 'Drag from one handle (dot) to another' },
  { label: 'Variables', text: 'In Text nodes, type {{input_name}} to link Inputs' },
  { label: 'Delete node', text: 'Click × on the top-right (red on hover)' },
  { label: 'Delete wire', text: 'Double-click the line, or select + Delete' },
  { label: 'Canvas', text: 'Pan empty space · zoom with scroll wheel' },
  { label: 'Run', text: 'Top-right Run — counts nodes/edges & checks DAG' },
];

export const PipelineHelpPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="pipeline-help-strip">
      <button
        type="button"
        className="pipeline-help-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="pipeline-help-panel"
      >
        <span className="pipeline-help-toggle__icon" aria-hidden="true">
          i
        </span>
        How to use
      </button>
      {open && (
        <div id="pipeline-help-panel" className="pipeline-help-panel">
          <dl className="pipeline-help-tips">
            {tips.map((tip) => (
              <div key={tip.label} className="pipeline-help-tip">
                <dt>{tip.label}</dt>
                <dd>{tip.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};
