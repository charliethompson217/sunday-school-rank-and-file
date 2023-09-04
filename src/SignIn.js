import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [warning, setWarning] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await Auth.signIn(email, password);
            window.location.reload();
        } catch (error) {
            console.error(error);
            if (error.code === 'UserNotConfirmedException') {
                setWarning('Please verify your email before signing in.');
            } else if(error.code==='NotAuthorizedException'){
                setWarning('Incorect Email or Password.');
            } else {
                setWarning('An error occurred while signing in.');
            }

        }
    }

    const forgotPassword = () => {
        navigate('/forgotpassword');
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="SignIn">
                <h1>Sign In</h1>
                <div>
                    <input className="signin-form-control" autoComplete="email" type="email" placeholder="E-Mail" onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <input className="signin-form-control" placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className='warning'>
                    {warning}
                </div>
                <button type="submit">Sign In</button>
                <button onClick={forgotPassword}>Forgot Password</button>
            </form>
        </div>
    )
}
