import { DraggableNode } from './draggableNode';
import { toolbarNodes } from './nodes';

export const PipelineToolbar = () => {
  return (
    <nav className="toolbar-nodes" aria-label="Add nodes">
      {toolbarNodes.map(({ type, label }) => (
        <DraggableNode key={type} type={type} label={label} />
      ))}
    </nav>
  );
};
