import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { OopPage } from './pages/OopPage';
import { RelationshipsPage } from './pages/RelationshipsPage';
import { SolidPage } from './pages/SolidPage';
import { PatternsPage } from './pages/PatternsPage';
import { PatternDetailPage } from './pages/PatternDetailPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/oop" element={<OopPage />} />
          <Route path="/relationships" element={<RelationshipsPage />} />
          <Route path="/solid" element={<SolidPage />} />
          <Route path="/patterns" element={<PatternsPage />} />
          <Route path="/patterns/:slug" element={<PatternDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
