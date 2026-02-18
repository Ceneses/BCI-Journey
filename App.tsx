import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BCIJourney from './components/BCIJourney';
import NeuralNavigatorPage from './pages/NeuralNavigatorPage';
import BCILabPage from './pages/BCILabPage';
import ExperimentSetupPage from './pages/ExperimentSetupPage';
import ExperimentStartPage from './pages/ExperimentStartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/bcilab" element={<BCILabPage />} />
        <Route path="/bcilab/:experimentId" element={<ExperimentSetupPage />} />
        <Route path="/bcilab/:experimentId/start" element={<ExperimentStartPage />} />
        <Route path="/journey" element={<BCIJourney />} />
        <Route path="/journey/:worldName" element={<NeuralNavigatorPage />} />
        <Route path="/journey/:worldName/:questionSlug" element={<NeuralNavigatorPage />} />
        <Route path="/journey/:worldName/:questionSlug/:mode" element={<NeuralNavigatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;