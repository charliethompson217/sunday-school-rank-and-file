import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AdminAuthWrapper from './AdminAuthWrapper';
import Home from './Home';
import Rules from './Rules'
import NotFound from './NotFound';
import Results from './Results';
import SubmissionAuthWrapper from './SubmissionAuthWrapper';
import Forgotpassword from './Forgotpassword';
import VerifyEmail from './VerifyEmail';
import AccountAuthWrapper from './AccountAuthWrapper';

function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/*" element={<NotFound/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/" element={<Home/>}/>
        <Route path="/admin" element={<AdminAuthWrapper/>}/>
        <Route path="/rules" element={<Rules/>}/>
        <Route path="/results" element={<Results/>}/>
        <Route path="/forgotpassword" element={<Forgotpassword/>}/>
        <Route path="/verifyemail" element={<VerifyEmail/>}/>
        <Route path="/account" element={<AccountAuthWrapper/>}/>
        <Route path="/submitpicks" element={<SubmissionAuthWrapper/>}/>
      </Routes>
    </Router>
    </div>
  );
}

export default App;
