// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';
import { variableHandleId, findVariableProviders } from './pipeline/variableEdges';
import {
  getVariableNameFromNode,
  isVariableProvider,
  resolveVariableHandleId,
} from './pipeline/variableRegistry';
import { parseTemplateVariables } from './nodes/parseTemplateVariables';

const EDGE_DEFAULTS = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
};

const VARIABLE_SYNC_NODE_TYPES = new Set(['customInput', 'constant', 'setVariable', 'text']);

const edgesEqual = (a, b) =>
  a.length === b.length &&
  a.every(
    (edge, i) =>
      edge.source === b[i].source &&
      edge.target === b[i].target &&
      edge.sourceHandle === b[i].sourceHandle &&
      edge.targetHandle === b[i].targetHandle
  );

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
        if (VARIABLE_SYNC_NODE_TYPES.has(node.type)) {
          queueMicrotask(() => get().resyncAllTextVariableEdges());
        }
    },
    deleteNode: (nodeId) => {
      const { nodes, edges } = get();
      set({
        nodes: nodes.filter((node) => node.id !== nodeId),
        edges: edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      });
      queueMicrotask(() => get().resyncAllTextVariableEdges());
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
            : node
        ),
      });
    },
    syncTextVariableEdges: (textNodeId, variableNames) => {
      const { nodes, edges } = get();
      const activeTargets = new Set(
        variableNames.map((name) => variableHandleId(textNodeId, name))
      );

      let nextEdges = edges.filter((edge) => {
        if (edge.target !== textNodeId) return true;
        if (!edge.targetHandle?.startsWith(`${textNodeId}-`)) return true;
        return activeTargets.has(edge.targetHandle);
      });

      for (const varName of variableNames) {
        const providers = findVariableProviders(nodes, varName);
        for (const provider of providers) {
          const handleName = resolveVariableHandleId(getVariableNameFromNode(provider));
          const connection = {
            source: provider.id,
            sourceHandle: variableHandleId(provider.id, handleName),
            target: textNodeId,
            targetHandle: variableHandleId(textNodeId, varName),
            ...EDGE_DEFAULTS,
          };
          const exists = nextEdges.some(
            (edge) =>
              edge.source === connection.source &&
              edge.target === connection.target &&
              edge.sourceHandle === connection.sourceHandle &&
              edge.targetHandle === connection.targetHandle
          );
          if (!exists) {
            nextEdges = addEdge(connection, nextEdges);
          }
        }
      }

      if (!edgesEqual(edges, nextEdges)) {
        set({ edges: nextEdges });
      }
    },
    pruneStaleProviderEdges: () => {
      const { nodes, edges } = get();
      const nextEdges = edges.filter((edge) => {
        const provider = nodes.find((node) => node.id === edge.source);
        if (!isVariableProvider(provider)) return true;

        const targetNode = nodes.find((node) => node.id === edge.target);
        if (targetNode?.type !== 'text') return true;

        const varName = getVariableNameFromNode(provider);
        const handleId = resolveVariableHandleId(varName);
        return edge.sourceHandle === variableHandleId(provider.id, handleId);
      });
      if (!edgesEqual(edges, nextEdges)) {
        set({ edges: nextEdges });
      }
    },
    resyncAllTextVariableEdges: () => {
      const { nodes, syncTextVariableEdges, pruneStaleProviderEdges } = get();
      pruneStaleProviderEdges();
      nodes
        .filter((node) => node.type === 'text')
        .forEach((node) => {
          const variables = parseTemplateVariables(node.data?.text ?? '');
          syncTextVariableEdges(node.id, variables);
        });
    },
  }));
