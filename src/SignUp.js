import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, Amplify, API } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

export default function SignUp() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [teamName, setTeamName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordIsValid, setPasswordIsValid] = useState(false);
    const [teamNameIsValid, setTeamNameIsValid] = useState(false);
    const [teams, setTeams] = useState([]);
    const [warning, setWarning] = useState('');

    useEffect( () => {
        const fetchPlayers = async () => {
          try {
            const response = await API.get('playerApi', '/player/get-players');
            const players = response.map(team => team);
            setTeams([...players]);
          } catch (error) {
            console.error('Error fetching taken team names:', error);
          }
        }
        fetchPlayers();
      }, []);

    useEffect(() => {
        if(password!==''&&confirmPassword!==''){
            var passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{10,}$/;
            if(password!==confirmPassword){
                setWarning("Passwords do not match!");
            } else if (password.length<10){
                setWarning("Password must be longer than 10 characters!");
            } else if(!passwordRegex.test(password)){
                setWarning("Password must contain at least one special character, number, uppercase letter, and lowercase letter!");
            } else { 
                setWarning("");
                setPasswordIsValid(true);
            }
        } else { 
            setWarning("");
        }
    }, [password, confirmPassword]);

    useEffect(() => {
        if(teamName!==''){
            var teamNameRegex = /^[a-zA-Z0-9_\-.,:]+$/;
            if(teamNameRegex.test(teamName)){
                for(const team of teams) {
                    if(team.teamName===teamName){
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
    }, [teamName, teams]);

    const makeId = (length) => {
        let result = 'SSP';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        for(const player of teams){
          if(result===player.playerId){
            return makeId(length);
          }
        }
        return result;
      }

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    }
    async function signUp(e) {
        e.preventDefault();
        if(!teamNameIsValid){
            return;
        }
        if(!passwordIsValid){
            return;
        }
        if (!validateEmail(email)) {
            setWarning("Please enter a valid email address!");
            return;
        }
        setWarning("");
        try {
            const newId = makeId(7);
            await API.post('playerApi', `/player/add-player`,{
                body: {
                    playerId: newId,
                    email: email,
                    teamName: teamName,
                    fullName: fullName,
                }
            });
            await API.post('sundaySchoolSubmissions', `/submission/${newId}`, {
                body: {
                    team: teamName,
                    configId: "1",
                }
            });
            await Auth.signUp({
                username: email,
                password: password,
                attributes: {
                    name: fullName,
                    email: email,
                    'custom:team_name': teamName,
                    'custom:playerId': newId,
                }
            });
            navigate('/verifyemail');
        } catch (error) {
            console.error('error signing up:', error);
            setWarning('An error occurred while signing up.');
            
        }
    }

    return (
        <div>
            <form onSubmit={signUp} className="SignUp">
                <h1>Sign Up</h1>
                <div>
                    <input className="SignUp-form-control" placeholder="Full Name" onChange={e => setFullName(e.target.value)} required />
                </div>
                <div>
                    <input className="SignUp-form-control" placeholder="Team_Name" onChange={e => setTeamName(e.target.value)} required />
                </div>
                <div>
                    <input className="SignUp-form-control" placeholder="E-Mail" type="email" onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <input className="SignUp-form-control" placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} required />
                </div>
                <div>
                    <input className="SignUp-form-control" placeholder="Confirm Password" type="password" onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                <div className='warning'>
                    {warning}
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}
