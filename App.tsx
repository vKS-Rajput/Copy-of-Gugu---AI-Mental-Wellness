import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Therapists from './pages/Therapists';
import Videos from './pages/Videos';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;