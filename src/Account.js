import React, { useState, useEffect } from 'react';
import { Auth, Amplify, API } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
import './App.css';
Amplify.configure(awsconfig);

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [playerId, setPlayerId] = useState();
  const [teamName, setTeamName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamNameIsValid, setTeamNameIsValid] = useState(false);
  const [warning, setWarning] = useState('');
  const [emailNeedsVerification, setEmailNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  const changePassword = () => {
    navigate('/forgotpassword');
  }
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const curUser = await Auth.currentAuthenticatedUser();
        setUser(curUser);
        setTeamName(curUser.attributes['custom:team_name']);
        setFullName(curUser.attributes['name']);
        setEmail(curUser.attributes['email']);
        setPlayerId(curUser.attributes['custom:playerId']);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect( () => {
    const fetchPlayers = async () => {
      const response = await API.get('playerApi', '/player/get-players');
      const players = response.map(team => team);
      setTeams([...players]);
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    if(teamName!==''){
        var teamNameRegex = /^[a-zA-Z0-9_\-.,:]+$/;
        if(teamNameRegex.test(teamName)){
            for(const team of teams) {
                if(team.teamName===teamName&&team.playerId!==playerId){
                    setWarning("Team Name Taken!");
                    setTeamNameIsValid(false);
                    break;
                }
                setWarning("");
                setTeamNameIsValid(true);
            }
        }
        else{
            setWarning("Team Name can only contain alphanumeric characters, underscores, hyphens, periods, commas, and colons!");
            setTeamNameIsValid(false);
        }
    } else { 
      setWarning("");
      setTeamNameIsValid(false);
    }
  }, [teamName, teams, playerId]);

  const sendToServer = async () => {
    try {
      if(email!==user.attributes['email']){
        setEmailNeedsVerification(true);
      }
      if(teamName!==user.attributes['custom:team_name']){
        await API.post('sundaySchoolSubmissions', `/submission/${user.attributes['custom:playerId']}`, {
          body: {
            team: teamName,
            configId: "1",
          }
        });
      }
      await Auth.updateUserAttributes(user, {
        name: fullName,
        email: email,
        'custom:team_name': teamName,
      });
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      await API.put('playerApi', `/player/edit-player`,{
        body: {
          jwt_token: `${idToken}`,
          playerId: playerId,
          email: email,
          teamName: teamName,
          fullName: fullName,
        }
      });
    } catch (error){
      console.error(error);
    }
  }

  const handleSubmit = async () => {
    setIsEditMode(!isEditMode);
    if(!teamNameIsValid){
      return;
    }
    sendToServer();
  };
  const handleVerifyEmail = async () => {
    try{
      await Auth.verifyCurrentUserAttributeSubmit('email', verificationCode);
    } catch (error){
      console.error(error);
    }
    setEmailNeedsVerification(false);
  };
  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <div className='account'>
          <h1>Account</h1>
          <p>
            If you change your Team-Name, your current picks will be reset. <br></br>
            If you change your Email, you will have to re-verify your Email. 
          </p>
          <div>
            <label className='user-attribute-label'>Team-Name</label>
            {isEditMode ? (
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
              />
            ) : (
              <label>{teamName}</label>
            )}
          </div>
          <div>
            <label className='user-attribute-label'>Full Name</label>
            {isEditMode ? (
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            ) : (
              <label>{fullName}</label>
            )}
          </div>
          <div>
            <label className='user-attribute-label'>Email</label>
            {isEditMode ? (
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            ) : (
              <label>{email}</label>
            )}
          </div>
          <div className='warning'>
              {warning}
          </div>
          <div>
            {emailNeedsVerification ? (
              <>
                <input 
                  type="text" 
                  placeholder="Verification Code"
                  onChange={e => setVerificationCode(e.target.value)}
                />
                <button onClick={handleVerifyEmail}>Verify Email</button>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        {isEditMode ? (
          <button onClick={handleSubmit}>Submit</button>
        ) : (
          <button onClick={toggleEditMode}>Edit</button>
        )}
        <div>
        <button onClick={changePassword}>change Password</button>
        </div>
      </div>
    </>
  )
}
