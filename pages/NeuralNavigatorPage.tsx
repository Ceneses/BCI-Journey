import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { WORLDS } from '../constants';
import NeuralNavigator from '../components/NeuralNavigator';

const NeuralNavigatorPage: React.FC = () => {
    const { worldName, questionSlug, mode } = useParams<{
        worldName: string;
        questionSlug?: string;
        mode?: string;
    }>();

    // Find the world by converting the URL param back to the region name
    const world = WORLDS.find(w =>
        w.region.toLowerCase().replace(/\s+/g, '-') === worldName?.toLowerCase()
    );

    if (!world) {
        return <Navigate to="/journey" replace />;
    }

    return (
        <NeuralNavigator
            worldId={world.id}
            initialQuestionSlug={questionSlug}
            initialMode={mode as 'listen' | 'talk' | 'summary' | 'quiz' | undefined}
        />
    );
};

export default NeuralNavigatorPage;
