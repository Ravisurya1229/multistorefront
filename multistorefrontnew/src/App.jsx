import React from 'react';
import './style.css'; // This was already imported in main.jsx, but is fine here too
import LoginForm from './components/LoginForm.jsx'; // Corrected import
import RegisterForm from './components/RegisterForm.jsx'; // Corrected import

function App() {
  return (
    <div className="page-container">
      {/* For now, we show both. Later, you will use React Router
        to show only one at a time.
      */}
      <LoginForm />
      <RegisterForm />
    </div>
  );
}

export default App;