// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import DashboardApp from './dashboard/DashboardApp.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes everyone can see */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* * All dashboard routes (like /tenant, /orders, etc.) 
         * are now nested inside the DashboardApp component.
         * We use "/*" to pass control to it.
         */}
        <Route path="/*" element={<DashboardApp />} />

      </Routes>
    </BrowserRouter>
  );
}