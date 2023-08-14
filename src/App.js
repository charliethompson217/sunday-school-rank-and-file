import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { API, Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import FormContainer from './FormContainer';
import AuthWrapper from './AuthWrapper';
import Home from './Home';
import Rules from './Rules'
import NotFound from './NotFound';
import Results from './Results';
import SubmissionInstructions from './SubmissionInstructions';

Amplify.configure(awsExports);

function App() {
  const [players, setPlayers] = useState([]);
  useEffect( () => {
    const fetchPlayers = async () => {
      setPlayers([]);
      try {
        const response = await API.get('playerApi', '/player/get-players');
        setPlayers(response);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    }
    fetchPlayers();
  }, []);
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/*" element={<NotFound/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/" element={<Home/>}/>
        <Route path="/admin" element={<AuthWrapper/>}/>
        <Route path="/rules" element={<Rules/>}/>
        <Route path="/results" element={<Results/>}/>
        <Route path="/submitpicks/*" element={<SubmissionInstructions/>}/>
        {players.map(player => (
          <Route key={player.playerId} path={`/submitpicks/${player.playerId}`} element={<FormContainer />} />
        ))}
      </Routes>
    </Router>
    </div>
  );
}

export default App;
