import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { PipelineHelpPanel } from './PipelineHelpPanel';

function App() {
  return (
    <div className="app-shell">
      <header className="pipeline-topbar">
        <div className="pipeline-topbar-toolbar">
          <PipelineToolbar />
        </div>
        <div className="pipeline-topbar-actions">
          <SubmitButton />
        </div>
      </header>
      <PipelineHelpPanel />
      <main className="pipeline-main">
        <PipelineUI />
      </main>
    </div>
  );
}

export default App;
