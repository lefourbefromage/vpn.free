import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ToastProvider } from './components/Toast';
import { ProtoProvider } from './state/proto';
import './styles/tokens.css';
import './styles/base.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProtoProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ProtoProvider>
    </BrowserRouter>
  </StrictMode>,
);
