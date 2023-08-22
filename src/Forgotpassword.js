import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import Navbar from './Navbar';
Amplify.configure(awsconfig);

export default function Forgotpassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordIsValid, setPasswordIsValid] = useState(false);
    const [warning, setWarning] = useState('');
    const [step, setStep] = useState(1);

    useEffect(() => {
        if(newPassword!==''&&confirmPassword!==''){
            var passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{10,}$/;
            if(newPassword!==confirmPassword){
                setWarning("Passwords do not match!");
            } else if (newPassword.length<10){
                setWarning("Password must be longer than 10 characters!");
            } else if(!passwordRegex.test(newPassword)){
                setWarning("Password must contain at least one special character, number, uppercase letter, and lowercase letter!");
            } else { 
                setWarning("");
                setPasswordIsValid(true);
            }
        } else { 
            setWarning("");
        }
    }, [newPassword, confirmPassword]);

    const handleSubmitStep1 = async (e) => {
        e.preventDefault();
        try {
            Auth.forgotPassword(email);
            setStep(2);
        } catch (error) {
            console.error(error);
            setWarning('An error occurred while requesting verification code.');
        }
    }

    const handleSubmitStep2 = async (e) => {
        e.preventDefault();
        if(!passwordIsValid){
            return;
        }
        try {
            Auth.forgotPasswordSubmit(email, verificationCode, newPassword);
            navigate('/');
        } catch (error) {
            console.error(error);
            setWarning('An error occurred while reseting your password.');
        }
    }

    if (step===1){
        return (
            <>
                <Navbar></Navbar>
                <div className='navbar-offset-container'>
                    <form onSubmit={handleSubmitStep1} className="Forgotpassword">
                        <h1>Reset Password</h1>
                        <div>
                            <input className="signin-form-control" placeholder="E-Mail" onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className='warning'>
                            {warning}
                        </div>
                        <button type="submit">Next</button>
                    </form>
                </div>
            </>
        )
    }
    else if (step===2){
        return (
            <>
                <Navbar></Navbar>
                <div className='navbar-offset-container'>
                    <form onSubmit={handleSubmitStep2} className="Forgotpassword">
                        <h1>Forgot Password</h1>
                        <div>
                            <input className="signin-form-control" placeholder="E-Mail" onChange={e => setEmail(e.target.value)} required />
                            <input className="signin-form-control" placeholder="Verification Code" onChange={e => setVerificationCode(e.target.value)} required />
                            <input className="signin-form-control" placeholder="New Password" type="password" onChange={e => setNewPassword(e.target.value)} required />
                            <input className="signin-form-control" placeholder="Confirm New Password" type="password" onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className='warning'>
                            {warning}
                        </div>
                        <button type="submit">Reset Password</button>
                    </form>
                </div>
            </>
        )
    }
}
