import React, { useState } from 'react';
import { Auth, Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await Auth.signIn(email, password);
            console.log(user);
            window.location.reload();
        } catch (error) {
            console.log('error signing in:', error);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="SignIn">
                <h1>Sign In</h1>
                <div>
                    <input className="signin-form-control" placeholder="E-Mail" onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <input className="signin-form-control" placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Sign In</button>
            </form>
        </div>
    )
}
