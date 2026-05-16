import { nodeDefinitions } from '../nodes/nodeDefinitions';

const getTypeTitle = (type) => nodeDefinitions[type]?.title ?? type;

const truncate = (text, max = 36) => {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
};

const getNodeLabel = (node) => {
  const data = node.data ?? {};

  switch (node.type) {
    case 'customInput':
      return data.inputName || getTypeTitle(node.type);
    case 'customOutput':
      return data.outputName || getTypeTitle(node.type);
    case 'text': {
      const text = (data.text ?? '').trim();
      return text ? `"${truncate(text)}"` : getTypeTitle(node.type);
    }
    case 'api':
      return data.url ? `${data.method || 'GET'} ${truncate(data.url, 28)}` : getTypeTitle(node.type);
    case 'filter':
      return data.pattern ? `${data.rule || 'contains'}: ${truncate(data.pattern, 24)}` : getTypeTitle(node.type);
    case 'merge':
      return data.strategy ? `Strategy: ${data.strategy}` : getTypeTitle(node.type);
    case 'delay':
      return data.milliseconds != null ? `${data.milliseconds} ms` : getTypeTitle(node.type);
    case 'condition':
      return data.compareTo
        ? `${data.operator || 'eq'} ${truncate(String(data.compareTo), 20)}`
        : getTypeTitle(node.type);
    default:
      return getTypeTitle(node.type);
  }
};

export const buildPipelineSummary = (nodes, edges) => {
  if (!nodes.length) {
    return {
      isEmpty: true,
      typeCounts: [],
      nodeItems: [],
      connections: [],
      disconnectedCount: 0,
      flowLine: '',
    };
  }

  const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));

  const typeCountMap = {};
  nodes.forEach((node) => {
    const title = getTypeTitle(node.type);
    typeCountMap[title] = (typeCountMap[title] || 0) + 1;
  });

  const nodeItems = nodes.map((node) => ({
    id: node.id,
    type: getTypeTitle(node.type),
    label: getNodeLabel(node),
  }));

  const connectedIds = new Set();
  edges.forEach((edge) => {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  });

  const seenPairs = new Set();
  const connections = [];
  edges.forEach((edge) => {
    const source = nodeById[edge.source];
    const target = nodeById[edge.target];
    if (!source || !target) return;

    const pairKey = `${edge.source}->${edge.target}`;
    if (seenPairs.has(pairKey)) return;
    seenPairs.add(pairKey);

    connections.push({
      from: getNodeLabel(source),
      to: getNodeLabel(target),
    });
  });

  const flowOrder = [];
  const flowSeen = new Set();
  connections.forEach(({ from, to }) => {
    if (!flowSeen.has(from)) {
      flowOrder.push(from);
      flowSeen.add(from);
    }
    if (!flowSeen.has(to)) {
      flowOrder.push(to);
      flowSeen.add(to);
    }
  });
  nodeItems.forEach((node) => {
    if (!flowSeen.has(node.label)) {
      flowOrder.push(node.label);
    }
  });

  return {
    isEmpty: false,
    typeCounts: Object.entries(typeCountMap).map(([type, count]) => ({ type, count })),
    nodeItems,
    connections,
    flowLine: flowOrder.join(' → '),
    disconnectedCount: nodes.filter((node) => !connectedIds.has(node.id)).length,
  };
};
