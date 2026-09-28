import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { User } from '../types';
import { UserRole } from '../types';
import * as api from './api';
import { Card, Header, Sidebar, Button, RotationPrompt, Spinner, SkeletonCard } from './SharedComponents';
import AIAssistant from './AIAssistant';

// Main Dashboard Component
interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onInstall: () => void;
  canInstall: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, onInstall, canInstall }) => {
  const [activeView, setActiveView] = useState('analytics');
  const [isBilingual, setIsBilingual] = useState(false);
  const [showRotationPrompt, setShowRotationPrompt] = useState(false);
  const [stats, setStats] = useState<{ label: string; value: string | number }[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        setShowRotationPrompt(isTouchDevice && isPortrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    api.getStudents().then(students => {
        setStats([
            { label: 'Total Schools', value: 1 },
            { label: 'Total Students', value: students.length },
            { label: 'Average Performance', value: '85%' },
        ]);
        setIsLoadingStats(false);
    });
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'schools':
        return <SchoolManagementView />;
      case 'assistant':
        return <AIAssistant isBilingual={isBilingual} role={user.role} />;
      default:
        return <AnalyticsView />;
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen bg-slate-900 text-slate-200">
      {showRotationPrompt && <RotationPrompt isBilingual={isBilingual} />}
      <div className={`flex h-full w-full ${showRotationPrompt ? 'hidden' : ''}`}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} role={UserRole.Admin} isBilingual={isBilingual} isSidebarOpen={isSidebarOpen} onInstall={onInstall} canInstall={canInstall} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Header user={user} onLogout={onLogout} isBilingual={isBilingual} onToggleBilingual={() => setIsBilingual(!isBilingual)} onToggleSidebar={toggleSidebar} title="Admin Dashboard" stats={!isLoadingStats ? stats: undefined} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// --- Analytics View ---
const AnalyticsView: React.FC = () => {
    // This data would be fetched from a real API
    const performanceData = [
        { name: 'Maths', performance: 88 },
        { name: 'Physics', performance: 92 },
        { name: 'English', performance: 78 },
    ];
    const literacyData = [
        { name: 'High Proficiency', value: 400 },
        { name: 'Medium Proficiency', value: 300 },
        { name: 'Low Proficiency', value: 100 },
    ];
    const COLORS = ['#4f46e5', '#6366f1', '#a5b4fc'];

    return (
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">School-wise Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="font-bold text-base md:text-lg mb-4">Subject Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                            <Bar dataKey="performance" fill="#6366f1" name="Avg. Performance (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <h3 className="font-bold text-base md:text-lg mb-4">Literacy Rate</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={literacyData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label>
                                {literacyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
             <Card className="mt-8">
                <h3 className="font-bold text-base md:text-lg mb-4">Dropout Rate Analysis</h3>
                <p className="text-slate-400">Dropout Rate: <span className="font-bold text-xl text-white">2.5%</span> (Below national average)</p>
                <p className="text-sm text-slate-500 mt-2">Insights: Dropout rates are lowest among students engaging with weekly contests. This suggests gamification is an effective retention strategy.</p>
            </Card>
        </div>
    );
};

// --- Reports View ---
const ReportsView: React.FC = () => (
    <Card>
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">Report Generator</h2>
        <div className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <span className="text-sm md:text-base">Annual Performance Report</span>
                <div className="flex gap-2 self-end sm:self-auto">
                    <Button variant="secondary">Export as PDF</Button>
                    <Button variant="secondary">Export as Excel</Button>
                </div>
            </div>
             <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <span className="text-sm md:text-base">School-wise Attendance Report</span>
                 <div className="flex gap-2 self-end sm:self-auto">
                    <Button variant="secondary">Export as PDF</Button>
                    <Button variant="secondary">Export as Excel</Button>
                </div>
            </div>
        </div>
    </Card>
);

// --- School Management ---
const SchoolManagementView: React.FC = () => (
    <Card>
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">School Management</h2>
        <p className="text-slate-400 text-sm md:text-base">This section will provide tools for adding and managing multiple schools in the system, enabling scalability and centralized administration.</p>
    </Card>
);


export default AdminDashboard;