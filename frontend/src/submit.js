import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from './store';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('pipeline', JSON.stringify({ nodes, edges }));

      const response = await fetch(`${API_URL}/pipelines/parse`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      setMessage({
        type: 'success',
        text: `Pipeline sent! ${result.num_nodes} nodes, ${result.num_edges} edges.`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          'Could not reach the backend. Is it running on port 8000?',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '16px',
      }}
    >
      <button type="button" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Sending…' : 'Submit'}
      </button>
      {message && (
        <p
          style={{
            margin: 0,
            color: message.type === 'error' ? '#c0392b' : '#27ae60',
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};
