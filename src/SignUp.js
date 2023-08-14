import React, { useState, useEffect } from 'react';
import { Auth, Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [warning, setWarning] = useState('');

    useEffect(() => {
        if(password!==''&&confirmPassword!==''){
            var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{10,}$/;
            if(password!==confirmPassword){
                setWarning("Passwords do not match!");
            } else if (password.length<10){
                setWarning("Password must be longer than 10 characters!");
            } else if(!re.test(password)){
                setWarning("Password must contain at least one special character, number, uppercase letter, and lowercase letter!");
            } else { 
                setWarning("");
            }
        } else { 
            setWarning("");
        }
    }, [password, confirmPassword]);

    async function signUp(e) {
        e.preventDefault();
        
        try {
            await Auth.signUp({
                username: email,
                password: password,
                attributes: {
                    email: email
                }
            });
            const verificationCode = prompt(
                "Please enter the verification code sent to your email address:"
            );
            // Call Auth.confirmSignUp to verify the user's email
            await Auth.confirmSignUp(email, verificationCode);
            const user = await Auth.signIn(email, password);
            console.log("User signed in:", user);
            if(user){
                window.location.reload();
            }
        } catch (error) {
            console.log('error signing up:', error);
        }
    }

    return (
        <div>
            <form onSubmit={signUp} className="SignUp">
                <h1>Sign Up</h1>
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
