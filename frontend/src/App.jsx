import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ExpensePage from './pages/ExpensePage';
import BudgetPage from './pages/BudgetPage';
import CalculatorsPage from './pages/CalculatorsPage';
import EMITrackerPage from './pages/EMITrackerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Protected Route Placeholder */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/calculators" element={<CalculatorsPage />} />
        <Route path="/emitracker" element={<EMITrackerPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
