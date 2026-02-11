import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import BCIJourney from './components/BCIJourney';

function App() {
  const [page, setPage] = useState<'landing' | 'journey'>('landing');

  return (
    <>
      {page === 'landing' && <LandingPage onStart={() => setPage('journey')} />}
      {page === 'journey' && <BCIJourney />}
    </>
  );
}

export default App;