import json

from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Lets the React app (localhost:3000) call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

def pipeline_is_dag(nodes, edges):
    node_ids = {node['id'] for node in nodes if 'id' in node}
    if not node_ids:
        return True

    adjacency = {node_id: [] for node_id in node_ids}
    in_degree = {node_id: 0 for node_id in node_ids}

    for edge in edges:
        source = edge.get('source')
        target = edge.get('target')
        if source in node_ids and target in node_ids:
            adjacency[source].append(target)
            in_degree[target] += 1

    queue = [node_id for node_id in node_ids if in_degree[node_id] == 0]
    visited = 0

    while queue:
        node_id = queue.pop(0)
        visited += 1
        for neighbor in adjacency[node_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited == len(node_ids)


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: str = Form(...)):
    data = json.loads(pipeline)
    nodes = data.get('nodes', [])
    edges = data.get('edges', [])
    return {
        'num_nodes': len(nodes),
        'num_edges': len(edges),
        'is_dag': pipeline_is_dag(nodes, edges),
    }
