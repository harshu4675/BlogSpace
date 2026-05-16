import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { wakeUpServer } from './utils/api';
import './index.css';

// Wake up backend on app start (Render free tier)
wakeUpServer();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-center"
              gutter={12}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  maxWidth: '420px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
