import React from 'react';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Account from './Account';
import Navbar from './Navbar';

export default function AccountAuthWrapper({ onSignOut, user, theme, toggleTheme}) {
    if (user) {
        return (
            <>
                <Account toggleTheme={toggleTheme} theme={theme} signout={onSignOut} user={user} />
            </>
        );
    } else {
        return (
            <>
                <Navbar></Navbar>
                <div className='navbar-offset-container'>
                    <SignIn />
                    <SignUp />
                    <button style={{marginTop: '50px'}} onClick={toggleTheme}>
                        Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                    </button>
                </div>
            </>
        );
    }
}
