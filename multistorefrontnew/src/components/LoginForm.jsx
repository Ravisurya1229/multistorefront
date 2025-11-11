import React, { useState } from 'react';
import FormHeader from './FormHeader.jsx';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // <-- This was missing

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Data:', { email, password });
    // TODO: Send this data to your login API
  };

  return (
    <div className="form-container" id="login-form">
      <FormHeader />
      
      <h2>Welcome Back!</h2>
      <p>Please sign in to your account</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* This is the field for "Email Address" */}
          <label htmlFor="login-email">Email Address</label>
          <input 
            type="email" 
            id="login-email"
            value={email} // Controlled by email state
            onChange={(e) => setEmail(e.target.value)} // Updates email state
            required 
          />
        </div>
        
        <div className="input-group">
          {/* This is the field for "Password" */}
          <label htmlFor="login-password">Password</label>
          <input 
            type="password" // <-- Was "email", now "password"
            id="login-password"
            value={password} // Controlled by password state
            onChange={(e) => setPassword(e.target.value)} // Updates password state
            required 
          />
        </div>
        
        <div className="form-options">
          <div className="remember-me">
            <input type="checkbox" id="remember-me" />
            <label htmlFor="remember-me">Remember me</label>
          </div>
          <a href="#" className="forgot-password">Forgot Password?</a>
        </div>
        
        <button type="submit" className="btn btn-primary">Sign In</button>
      </form>
      
      <div className="form-footer">
        <p>Don't have an account? <a href="#">Register Here</a></p>
      </div>
    </div>
  );
};

export default LoginForm;