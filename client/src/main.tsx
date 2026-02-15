import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import AdminPage from './AdminPage';
import InviteAcceptPage from './InviteAcceptPage';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/invite/accept" element={<InviteAcceptPage />} />
    </Routes>
  </BrowserRouter>
);
