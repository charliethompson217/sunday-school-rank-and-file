import React, { useState, useEffect, useRef, useContext } from 'react';
import { Auth, Amplify, API } from 'aws-amplify';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
import defaultProfilePic from './assets/avatar.svg';
import { DataContext } from './DataContext';

Amplify.configure(awsconfig);

export default function Account({ signout, user, theme, toggleTheme}) {
  const { fetchedPlayers } = useContext(DataContext);
  const [playerId, setPlayerId] = useState();
  const [teamName, setTeamName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rankPoints, setRankPoints] = useState('');
  const [fileWins, setFileWins] = useState('');
  const [playoffsBucks, setPlayoffsBucks] = useState('');
  const [totalDollarPayout, setTotalDollarPayout] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState(defaultProfilePic);
  const fileInputRef = useRef(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordIsValid, setPasswordIsValid] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [warning, setWarning] = useState('');


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const setUserData = async () => {
      try {
        setTeamName(user.attributes['custom:team_name']);
        setFullName(user.attributes['name']);
        setEmail(user.attributes['email']);
        setPlayerId(user.attributes['custom:playerId']);
        let curPlayer;
        for (var player of fetchedPlayers) {
          if (player.playerId === user.attributes['custom:playerId']) {
            curPlayer = player;
            setRankPoints(curPlayer.RankPoints);
            setFileWins(curPlayer.FileWins);
            setPlayoffsBucks(curPlayer.PlayoffsBucks);
            setTotalDollarPayout(curPlayer.TotalDollarPayout);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    if (fetchedPlayers) setUserData();
  }, [fetchedPlayers, user]);

  useEffect(() => {
    if (newPassword !== '' && confirmPassword !== '') {
      const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{10,}$/;
      if (newPassword !== confirmPassword) {
        setWarning("Passwords do not match!");
      } else if (newPassword.length < 10) {
        setWarning("Password must be longer than 10 characters!");
      } else if (!passwordRegex.test(newPassword)) {
        setWarning("Password must contain at least one special character, number, uppercase letter, and lowercase letter!");
      } else {
        setWarning("");
        setPasswordIsValid(true);
      }
    } else {
      setWarning("");
    }
  }, [newPassword, confirmPassword]);

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
  };

  const changePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !passwordIsValid) {
        setPasswordChangeError('Please provide valid current and new passwords');
        return;
      }
      const curUser = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(curUser, currentPassword, newPassword);
      setPasswordChangeSuccess(true);
      setPasswordChangeError(null);
    } catch (error) {
      setPasswordChangeError(`Error changing password: ${error.message}`);
      setPasswordChangeSuccess(false);
      console.error('Error changing password:', error);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, BMP, WebP).');
      return;
    }

    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const response = await API.put('sundaySchoolAuthorized', `/player/edit-profile-picture`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        },
        body: {
          operation: 'edit-profile-picture',
          contentType: file.type,
        },
      });
      const uploadUrl = response.upload_url;
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      setProfilePicUrl(`https://sunday-school-profile-pictures.s3.us-east-2.amazonaws.com/${playerId}`);
    } catch (error) {
      console.error('Failed to upload profile picture', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };



  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <div className='account'>
          <div className='profile-picture'>
            <img src={profilePicUrl} alt=''></img>
            <div className='user-attribute'>
              <label className='user-attribute-label-left'>Rank Points</label>
              <label className='user-attribute-label-right'>{rankPoints}</label>
            </div>
            <div className='user-attribute'>
              <label className='user-attribute-label-left'>File Wins</label>
              <label className='user-attribute-label-right'>{fileWins}</label>
            </div>
            <div className='user-attribute'>
              <label className='user-attribute-label-left'>Playoffs Bucks</label>
              <label className='user-attribute-label-right'>{playoffsBucks}</label>
            </div>
            <div className='user-attribute'>
              <label className='user-attribute-label-left'>Total Dollar Payout</label>
              <label className='user-attribute-label-right'>{totalDollarPayout}</label>
            </div>
          </div>
          <div className='profile-info'>
            <div className='user-attribute'>
              <label className='user-attribute-label-left'>Team Name</label>
              <label className='user-attribute-label-right'>{teamName}</label>
            </div>
            <div className='user-attribute'>
              <label className='user-attribute-label-left'>Full Name</label>
              <label className='user-attribute-label-right'>{fullName}</label>
            </div>
            <div className='user-attribute'>
              <label className='user-attribute-label-left'>Email</label>
              <label className='user-attribute-label-right'>{email}</label>
            </div>

            <div>
              <button className="change-profile-image-button" onClick={triggerFileInput}>Change Picture</button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}  // Hide the file input
                onChange={handleFileChange}
              />
            </div>
            <div>
              <button onClick={togglePasswordFields}>Change Password</button>
              {showPasswordFields && (
                <div className="password-change-section">
                  <div className='user-attribute'>
                    <label className='user-attribute-label-left'>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className='user-attribute'>
                    <label className='user-attribute-label-left'>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className='user-attribute'>
                    <label className='user-attribute-label-left'>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  {warning && <p className="warning">{warning}</p>}
                  <button className="change-password-button" onClick={changePassword}>
                    Submit Password Change
                  </button>
                  {passwordChangeError && <p className="warning">{passwordChangeError}</p>}
                  {passwordChangeSuccess && <p className="success-message">Password changed successfully!</p>}
                </div>
              )}
            </div>
            <div>
              <button className="sign-out-button" onClick={signout}>Sign Out</button>
            </div>
            <div>
              <button onClick={toggleTheme}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};