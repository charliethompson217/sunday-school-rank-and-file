import React, { useEffect } from 'react';

import Navbar from './Navbar';

export default function NotFound() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar></Navbar>
      <div className='navbar-offset-container'>
        <h1>Page Not Found</h1>
        <p>Ops, this page does not exist! Please check your URL.</p>
      </div>
    </>
  );
};