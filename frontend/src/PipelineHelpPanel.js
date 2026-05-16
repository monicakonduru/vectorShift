const tips = [
  { label: 'Add', text: 'Drag blocks from the top toolbar onto the canvas' },
  { label: 'Move', text: 'Drag a node to reposition it' },
  { label: 'Connect', text: 'Drag from one handle (dot) to another' },
  { label: 'Variables', text: 'In Text nodes, type {{input_name}} to link Inputs' },
  { label: 'Delete node', text: 'Click × on the top-right (red on hover)' },
  { label: 'Delete wire', text: 'Double-click the line, or select + Delete' },
  { label: 'Canvas', text: 'Pan empty space · zoom with scroll wheel' },
  { label: 'Submit', text: 'Button below — counts nodes/edges & checks DAG' },
];

export const PipelineHelpPanel = () => (
  <div className="pipeline-help-panel">
    <p className="pipeline-help-title">How to use</p>
    <dl className="pipeline-help-tips">
      {tips.map((tip) => (
        <div key={tip.label} className="pipeline-help-tip">
          <dt>{tip.label}</dt>
          <dd>{tip.text}</dd>
        </div>
      ))}
    </dl>
  </div>
);
