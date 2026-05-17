// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, Panel } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes } from './nodes';
import { buildDefaultNodeData } from './nodes/buildDefaultNodeData';

import 'reactflow/dist/style.css';

const gridSize = 24;
const proOptions = { hideAttribution: true };

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(
          event.dataTransfer.getData('application/reactflow')
        );
        const type = appData?.nodeType;

        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: buildDefaultNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onEdgeDoubleClick = useCallback(
    (_event, edge) => {
      onEdgesChange([{ type: 'remove', id: edge.id }]);
    },
    [onEdgesChange]
  );

  return (
    <div ref={reactFlowWrapper} className="pipeline-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        connectionLineType="smoothstep"
        connectionRadius={28}
        elementsSelectable
        nodesDeletable
        edgesDeletable
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background
          variant="dots"
          gap={gridSize}
          size={1.2}
          color="rgba(148, 163, 184, 0.14)"
        />
        <Controls showInteractive={false} />
        <Panel position="bottom-right" className="pipeline-corner-panel">
          <MiniMap
            pannable
            zoomable
            className="pipeline-minimap"
            nodeColor={(node) => {
              const colors = {
                customInput: '#f472b6',
                constant: '#94a3b8',
                customOutput: '#22d3ee',
                llm: '#a333ff',
                text: '#00aaff',
                filter: '#ffcc00',
                merge: '#00ff88',
                api: '#00aaff',
                setVariable: '#a855f7',
                transform: '#22d3ee',
                validate: '#4ade80',
                retry: '#fbbf24',
                switch: '#fb923c',
              };
              return colors[node.type] ?? '#64748b';
            }}
            maskColor="rgba(11, 14, 20, 0.72)"
          />
        </Panel>
      </ReactFlow>
    </div>
  );
};
