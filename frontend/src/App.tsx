import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ConfigList from './pages/ConfigList';
import CreateConfig from './pages/CreateConfig';
import Settings from './pages/Settings';
import About from './pages/About';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="configs" element={<ConfigList />} />
        <Route path="create" element={<CreateConfig />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}