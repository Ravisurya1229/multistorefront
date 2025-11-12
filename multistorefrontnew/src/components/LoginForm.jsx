import React, { useState } from 'react';
import FormHeader from './FormHeader.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [phoneOrEmail, setPhoneOrEmail] = useState(''); // you used phone earlier, accept phone or email
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // change body keys to what your backend expects (phoneNumber vs email)
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api'}/users/login`, {
        phoneNumber: phoneOrEmail,
        password
      }, {
        headers: {
          'x-tenant-id': tenantId || undefined,
          'x-store-id': storeId || undefined
        }
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tenantId', user?.tenantId || user?.tenant || tenantId || '');
      localStorage.setItem('storeId', user?.storeId || user?.store || storeId || '');

      // navigate to tenant dashboard if user is a tenant-level admin, else store pages
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" id="login-form">
      <FormHeader />

      <h2>Welcome Back!</h2>
      <p>Please sign in to your account</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="login-identifier">Phone or Email</label>
          <input
            type="text"
            id="login-identifier"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="login-password">Password</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="login-tenant">Tenant ID (optional)</label>
          <input type="text" id="login-tenant" value={tenantId} onChange={(e)=>setTenantId(e.target.value)} />
        </div>

        <div className="input-group">
          <label htmlFor="login-store">Store ID (optional)</label>
          <input type="text" id="login-store" value={storeId} onChange={(e)=>setStoreId(e.target.value)} />
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input type="checkbox" id="remember-me" />
            <label htmlFor="remember-me">Remember me</label>
          </div>
          <a href="#" className="forgot-password">Forgot Password?</a>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="form-footer">
        <p>Don't have an account? <a href="/register">Register Here</a></p>
      </div>
    </div>
  );
};

export default LoginForm;
