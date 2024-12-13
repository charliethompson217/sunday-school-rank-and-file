import { React, useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminAuthWrapper from './AdminAuthWrapper';
import Home from './Home';
import Rules from './Rules'
import NotFound from './NotFound';
import Results from './Results';
import SubmissionAuthWrapper from './SubmissionAuthWrapper';
import Forgotpassword from './Forgotpassword';
import VerifyEmail from './VerifyEmail';
import AccountAuthWrapper from './AccountAuthWrapper';
import PickFormDecider from './PickFormDecider';
import EndOfForm from './EndOfForm';
import { DataProvider } from './DataContext';
import Cookies from 'js-cookie'; 
import './App.css';

Amplify.configure(awsExports);

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const savedTheme = Cookies.get('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme) => {
    document.documentElement.style.setProperty('--main-bg-color', `var(--main-bg-color-${theme})`);
    document.documentElement.style.setProperty('--primary-button-color', `var(--primary-button-color-${theme})`);
    document.documentElement.style.setProperty('--secondary-button-color', `var(--secondary-button-color-${theme})`);
    document.documentElement.style.setProperty('--primary-txt-color', `var(--primary-txt-color-${theme})`);
    document.documentElement.style.setProperty('--secondary-txt-color', `var(--secondary-txt-color-${theme})`);
    document.documentElement.style.setProperty('--primary-border', `var(--primary-border-${theme})`);
    document.documentElement.style.setProperty('--empty-picks-color', `var(--empty-picks-color-${theme})`);
    document.documentElement.style.setProperty('--selected-picks-color', `var(--selected-picks-color-${theme})`);
    document.documentElement.style.setProperty('--unselected-picks-color', `var(--unselected-picks-color-${theme})`);
    document.documentElement.style.setProperty('--tie-picks-color', `var(--tie-picks-color-${theme})`);
    document.documentElement.style.setProperty('--navbar-txt-color', `var(--navbar-txt-color-${theme})`);
    document.documentElement.style.setProperty('--navbar-bg-color', `var(--navbar-bg-color-${theme})`);
    document.documentElement.style.setProperty('--account-bg-color', `var(--account-bg-color-${theme})`);
    document.documentElement.style.setProperty('--weekly-picks-correct', `var(--weekly-picks-correct-${theme})`);
    document.documentElement.style.setProperty('--weekly-picks-incorrect', `var(--weekly-picks-incorrect-${theme})`);
    document.documentElement.style.setProperty('--weekly-picks-undecided', `var(--weekly-picks-undecided-${theme})`);
    document.documentElement.style.setProperty('--weekly-picks-tie', `var(--weekly-picks-tie-${theme})`);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    Cookies.set('theme', newTheme);
  };

  useEffect(() => {
    const updateUser = async () => {
      try {
        const curUser = await Auth.currentAuthenticatedUser();
        setUser(curUser);
      } catch (error) {
        setUser(null);
      }
    };
    updateUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('error signing out: ', err);
    }
  };

  return (
    <div className="App">
      <DataProvider user={user} >
        <Router>
          <Routes>
            <Route path="/*" element={<NotFound />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminAuthWrapper handleSignOut={handleSignOut} user={user} />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/results" element={<Results />} />
            <Route path="/forgotpassword" element={<Forgotpassword />} />
            <Route path="/verifyemail" element={<VerifyEmail />} />
            <Route path="/account" element={<AccountAuthWrapper toggleTheme={toggleTheme} theme={theme} onSignOut={handleSignOut} user={user} />} />
            <Route
              path="/submitpicks"
              element={user ?
                <PickFormDecider
                  User={user}
                /> : <SubmissionAuthWrapper />}
            />
            <Route
              path="/endofform"
              element={
                <EndOfForm />
              }
            />
          </Routes>
        </Router>
      </DataProvider>
    </div>
  );
};