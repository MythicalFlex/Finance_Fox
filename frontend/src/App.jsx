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
import StocksPage from './pages/StocksPage';
import ExpenseHistoryPage from './pages/ExpenseHistoryPage';
import AIAssistantPage from './pages/AIAssistantPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
        <Route path="/expense-history" element={<ProtectedRoute><ExpenseHistoryPage /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
        <Route path="/calculators" element={<ProtectedRoute><CalculatorsPage /></ProtectedRoute>} />
        <Route path="/emitracker" element={<ProtectedRoute><EMITrackerPage /></ProtectedRoute>} />
        <Route path="/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
