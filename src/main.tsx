import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateConfig } from './engine/common/validate-config';

const configErrors = validateConfig();
if (configErrors.length > 0) console.error('config.ts problems:\n' + configErrors.join('\n'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {configErrors.length > 0 ? (
      <div className="mx-auto mt-16 max-w-[800px] rounded border border-red-800 bg-red-950 p-6 text-sm text-red-200">
        <p className="mb-3 font-bold">config.ts has {configErrors.length} problem(s):</p>
        <ul className="list-disc space-y-1 pl-5">
          {configErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
