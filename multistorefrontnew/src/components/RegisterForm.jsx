import React, { useState } from 'react';
import FormHeader from './FormHeader.jsx';

const RegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    console.log('Registration Data:', { fullName, email, password });
    // TODO: Send this data to your registration API
  };

  return (
    <div className="form-container" id="register-form">
      <FormHeader />
      
      <h2>Join the Team!</h2>
      <p>Create your account</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="reg-name">Full Name</label> {/* <-- Correct label */}
          <input 
            type="text" 
            id="reg-name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="reg-email">Work Email</label> {/* <-- Correct label */}
          <input 
            type="email" 
            id="reg-email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="reg-password">Password</label> {/* <-- Correct label */}
          <input 
            type="password" 
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="reg-confirm-password">Confirm Password</label> {/* <-- Correct label */}
          <input 
            type="password" 
            id="reg-confirm-password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
        </div>
        
        <button type="submit" className="btn btn-secondary">Create Account</button>
      </form>
      
      <div className="form-footer">
        <p>Already have an account? <a href="#">Login Here</a></p>
      </div>
    </div>
  );
};

export default RegisterForm;