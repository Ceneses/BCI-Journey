import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BCIJourney from './components/BCIJourney';
import NeuralNavigatorPage from './pages/NeuralNavigatorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/journey" element={<BCIJourney />} />
        <Route path="/journey/:worldName" element={<NeuralNavigatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;