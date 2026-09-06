import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MeetingsPage from './pages/MeetingsPage';
import TasksPage from './pages/TasksPage';
import MyTasksPage from './pages/MyTasksPage';
import UsersPage from './pages/UsersPage';
import ActivityLogPage from './pages/ActivityLogPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar />
        <main className="page-body">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'meetings' && <MeetingsPage />}
          {activeTab === 'tasks' && <TasksPage />}
          {activeTab === 'my-tasks' && <MyTasksPage />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'activity' && <ActivityLogPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}