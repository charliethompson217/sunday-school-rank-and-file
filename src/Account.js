import React, { useState, useEffect, useRef } from 'react';
import { Auth, Amplify, API } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
import './App.css';
import defaultProfilePic from './assets/avatar.svg';
Amplify.configure(awsconfig);

export default function Account({signout}) {
  const navigate = useNavigate();
  const [user, setUser] = useState();
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
        const response = await API.get('playerApi', '/player/get-players');
        let curPlayer;
        for(var player of response){
          if(player.playerId===curUser.attributes['custom:playerId']){
            curPlayer=player;
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
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if(playerId){
        try {
          const profilePictureUrl = `https://sunday-school-profile-pictures.s3.us-east-2.amazonaws.com/${playerId}`;
          const response = await fetch(profilePictureUrl, { method: 'GET' });
          if (response.ok) {
            setProfilePicUrl(profilePictureUrl);
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
      
    };
    fetchProfilePicture();
  }, [playerId]);


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Allowed image MIME types
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
              <button onClick={changePassword}>Change Password</button>
            </div>
            <div>
              <button className="sign-out-button" onClick={signout}>Sign Out</button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  )
}
