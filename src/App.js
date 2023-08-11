import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import FormContainer from './FormContainer';
import Admin from './Admin'
function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
      <Route path="/admin" element={<Admin/>}/>
        <Route path="/*" element={<FormContainer/>}/>
      </Routes>
    </Router>
    </div>
  );
}

export default App;
