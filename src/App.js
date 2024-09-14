import './App.css';
import {React, useState, useEffect} from 'react';
import {Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
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
import FormContainer from './FormContainer';
import EndOfForm from './EndOfForm';
import { DataProvider } from './DataContext';

Amplify.configure(awsExports);

function App() {
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    const updateUser = async () => {
      try {
        const curUser = await Auth.currentAuthenticatedUser();
        setUser(curUser);
      } catch (error) {
        setUser(null);
      }
    };
    updateUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('error signing out: ', err);
    }
  };

  return (
    <div className="App">
      <DataProvider user={user} >
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
            <Route path="/account" element={<AccountAuthWrapper onSignOut={handleSignOut}/>}/>
            <Route
              path="/submitpicks"
              element={user ? 
              <FormContainer
                User={user} 
              /> : <SubmissionAuthWrapper/>}
            />
            <Route 
              path="/endofform"
              element={
                <EndOfForm />
              }
            />
          </Routes>
        </Router>
      </DataProvider>
    
    </div>
  );
}

export default App;
