import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { PipelineAnalysisModal } from './PipelineAnalysisModal';
import { useStore } from './store';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const closeModal = () => {
    setModalOpen(false);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAnalysisResult(null);
    setAnalysisError(null);

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
      setAnalysisResult(result);
      setModalOpen(true);
    } catch (error) {
      setAnalysisError(
        error.message || 'Could not reach the backend. Is it running on port 8000?'
      );
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PipelineAnalysisModal
        open={modalOpen}
        onClose={closeModal}
        result={analysisResult}
        error={analysisError}
      />
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
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '10px 28px',
            borderRadius: '8px',
            border: '1px solid #475569',
            background: loading ? '#1e293b' : '#334155',
            color: loading ? '#94a3b8' : '#e2e8f0',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Analyzing…' : 'Submit'}
        </button>
      </div>
    </>
  );
};
