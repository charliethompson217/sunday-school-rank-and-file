import './App.css';
import {React, useState, useEffect} from 'react';
import {Amplify, Auth, API } from 'aws-amplify';
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

Amplify.configure(awsExports);

function App() {
  const [user, setUser] = useState(null);
  const [picks, setPicks] = useState(null);
  const [rankPicks, setRankPicks] = useState([]);
  const [filePicks, setFilePicks] = useState([]);
  const [rankedRanks, setRankedRanks] = useState([]);

  useEffect(() => {
    const updateUser = async () => {
      try {
        const curUser = await Auth.currentAuthenticatedUser();
        setUser(curUser);
      } catch (error) {
        console.error(error);
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

  const parseJsonString = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        const response = await API.put('sundaySchoolSubmissions', `/submission/get-picks-for-player`,{
          body: {
            jwt_token: `${idToken}`,
            playerId: user.attributes['custom:playerId'],
            teamName: user.attributes['custom:team_name'],
          },
        });
        setPicks(response);
        const fetchedRankPicks = parseJsonString(response.rankPicks);
        const fetchedRankedRanks = parseJsonString(response.rankedRanks);
        const fetchedFilePicks = parseJsonString(response.filePicks);
        setRankPicks([...fetchedRankPicks]);
        setRankedRanks([...fetchedRankedRanks]);
        setFilePicks([...fetchedFilePicks]);
      } catch (error) {
        console.error(error);
      }
    };
    if(user){
      fetchPicks();
    }
  }, [user]);

  const setNewPicks = (newRankedPicks, newRankedRanks, newFilePicks) => {
    setRankPicks(newRankedPicks);
    setRankedRanks(newRankedRanks);
    setFilePicks(newFilePicks);
  }

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
        <Route path="/account" element={<AccountAuthWrapper onSignOut={handleSignOut}/>}/>
        <Route
          path="/submitpicks"
          element={user ? 
          <FormContainer
            User={user} 
            picks={picks}
            fetchedRankPicks={rankPicks}
            fetchedRankedRanks={rankedRanks}
            fetchedFilePicks={filePicks}
            setNewPicks={setNewPicks}
          /> : <SubmissionAuthWrapper/>}
        />
        <Route 
          path="/endofform"
          element={
            <EndOfForm 
              rankPicks={rankPicks}
              rankedRanks={rankedRanks}
              filePicks={filePicks}
            />
          }
        />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
