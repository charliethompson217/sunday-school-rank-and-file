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


  const sendToServer = async () => {
    try {
      if(email!==user.attributes['email']){
        setEmailNeedsVerification(true);
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
      console.error('Error submiting updates:',error);
    }
  }

  const handleSubmit = async () => {
    setIsEditMode(!isEditMode);
    sendToServer();
  };
  const handleVerifyEmail = async () => {
    try{
      await Auth.verifyCurrentUserAttributeSubmit('email', verificationCode);
    } catch (error){
      console.error('Error verifiying email:',error);
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
            If you change your email, you will have to re-verify your email. 
          </p>
          <div className='user-attribute'>
            <label className='user-attribute-label'>Team Name</label>
            <label>{teamName}</label>
          </div>
          <div className='user-attribute'>
            <label className='user-attribute-label'>Full Name</label>
            <label>{fullName}</label>
          </div>
          <div className='user-attribute'>
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
          <div className='user-attribute'>
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
          <div>
          {isEditMode ? (
            <button onClick={handleSubmit}>Submit</button>
          ) : (
            <button onClick={toggleEditMode}>Change Email</button>
          )}
          <div>
          <button onClick={changePassword}>Change Password</button>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}
