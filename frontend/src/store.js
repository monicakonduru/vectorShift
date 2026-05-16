// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';
import { variableHandleId, findVariableProviders } from './pipeline/variableEdges';
import { parseTemplateVariables, isValidJsIdentifier } from './nodes/parseTemplateVariables';

const EDGE_DEFAULTS = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
};

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
        if (node.type === 'customInput' || node.type === 'text') {
          queueMicrotask(() => get().resyncAllTextVariableEdges());
        }
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
          const connection = {
            source: provider.id,
            sourceHandle: variableHandleId(provider.id, varName),
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
        if (provider?.type !== 'customInput') return true;
        const name = provider.data?.inputName;
        const handleId = isValidJsIdentifier(name) ? name : 'value';
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
