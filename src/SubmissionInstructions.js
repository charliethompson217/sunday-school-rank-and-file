import React from 'react';
import Navbar from './Navbar';
import './App.css';
export default function SubmissionInstructions() {
  return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container SubmissionInstructions'>
            <h1>Submission Instructions</h1>
            <p>Please check your email. Players should have recived a unique link to submit their picks. This link is case sensitive and looks like:<br></br>
            sundayschoolrankandfile.com/submitpicks/SSPaZ1By2cX3
            </p>
        </div>
    </>
  )
}
