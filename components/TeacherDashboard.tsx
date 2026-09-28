import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { User, Doubt, StudentPerformance, Attendance, Subject } from '../types';
import { UserRole } from '../types';
import * as api from './api';
import { Card, Header, Sidebar, Modal, Button, RotationPrompt, Spinner, SkeletonCard } from './SharedComponents';
import AIAssistant from './AIAssistant';
import { PhoneIcon } from '../constants';

// Main Dashboard Component
interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  onInstall: () => void;
  canInstall: boolean;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout, onInstall, canInstall }) => {
  const [activeView, setActiveView] = useState('dashboard');
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
    
    return () => {
        window.removeEventListener('resize', checkOrientation);
    };
  }, []);
  
  useEffect(() => {
    Promise.all([
        api.getAllSubjects(),
        api.getStudents(),
        api.getAllDoubts()
    ]).then(([subjects, students, doubts]) => {
        const pendingDoubts = doubts.filter(d => !d.isResolved).length;
        setStats([
            { label: 'Courses Managed', value: subjects.length },
            { label: 'Students Enrolled', value: students.length },
            { label: 'Pending Doubts', value: pendingDoubts },
        ]);
        setIsLoadingStats(false);
    });
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'courses':
        return <CourseManagementView />;
      case 'progress':
        return <StudentProgressView />;
      case 'students':
        return <StudentInfoView isBilingual={isBilingual} />;
      case 'attendance':
        return <AttendanceView />;
      case 'doubts':
        return <DoubtsSection isBilingual={isBilingual} />;
      case 'contests':
        return <ContestManagementView />;
      case 'assistant':
        return <AIAssistant isBilingual={isBilingual} role={user.role} />;
      case 'help':
        return <HelpView />;
      default:
        return <DashboardHome />;
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen bg-slate-900 text-slate-200">
      {showRotationPrompt && <RotationPrompt isBilingual={isBilingual} />}
      <div className={`flex h-full w-full ${showRotationPrompt ? 'hidden' : ''}`}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} role={UserRole.Teacher} isBilingual={isBilingual} isSidebarOpen={isSidebarOpen} onInstall={onInstall} canInstall={canInstall} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Header user={user} onLogout={onLogout} isBilingual={isBilingual} onToggleBilingual={() => setIsBilingual(!isBilingual)} onToggleSidebar={toggleSidebar} title={activeView === 'dashboard' ? `Welcome, ${user.name}!` : undefined} stats={activeView === 'dashboard' && !isLoadingStats ? stats : undefined} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// --- Dashboard Home View ---
const DashboardHome: React.FC = () => (
  <div>
    <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">Quick Overview</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <h3 className="font-bold text-base md:text-lg mb-4">Recent Activity</h3>
        <ul className="space-y-3">
            <li className="text-sm">Pranav completed the 'Algebra Basics' quiz.</li>
            <li className="text-sm">Nithin asked a new doubt in 'Mathematics'.</li>
            <li className="text-sm">New contest 'Physics Olympiad Prep' has been created.</li>
        </ul>
      </Card>
      <Card>
        <h3 className="font-bold text-base md:text-lg mb-4">Pending Tasks</h3>
         <ul className="space-y-3">
            <li className="text-sm text-slate-300">Respond to Nithin's doubt on Algebra.</li>
            <li className="text-sm text-slate-300">Grade the latest contest submissions.</li>
         </ul>
      </Card>
    </div>
  </div>
);


// --- Course Management View ---
const CourseManagementView: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getAllSubjects().then(data => {
            setSubjects(data);
            setIsLoading(false);
        })
    }, []);

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-400">Course Management</h2>
                <Button>Add New Subject</Button>
            </div>
            {isLoading ? <Spinner /> : (
                <div className="space-y-6">
                    {subjects.map(subject => (
                        <div key={subject.id}>
                            <h3 className="text-lg md:text-xl font-semibold mb-2">{subject.name}</h3>
                            <div className="space-y-2">
                            {subject.chapters.map(chapter => (
                                <div key={chapter.id} className="bg-slate-700/50 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <span className="text-sm md:text-base">{chapter.title}</span>
                                    <div className="flex gap-2 self-end sm:self-auto">
                                        <Button variant="secondary" className="!p-2 text-xs">Edit</Button>
                                        <Button variant="danger" className="!p-2 text-xs">Delete</Button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

// --- Student Progress View ---
const StudentProgressView: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [performances, setPerformances] = useState<StudentPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getStudents(),
            api.getAllStudentPerformance()
        ]).then(([studentData, perfData]) => {
            setStudents(studentData);
            setPerformances(perfData);
            setIsLoading(false);
        });
    }, []);

    const chartData = useMemo(() => {
        return students.map(student => {
            const performance = performances.find(p => p.studentId === student.id);
            const totalScore = performance ? Object.values(performance.quizScores).reduce((sum, score) => sum + score, 0) : 0;
            const quizzesTaken = performance ? Object.keys(performance.quizScores).length : 0;
            return {
                name: student.name.split(' ')[0], // Use first name for smaller screens
                avgScore: quizzesTaken > 0 ? (totalScore / quizzesTaken) : 0,
                quizzesTaken: quizzesTaken
            };
        });
    }, [students, performances]);

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 gap-8">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-400">Student Progress</h2>
                <SkeletonCard count={2} className="h-48" />
             </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-8">
            <h2 className="text-xl md:text-2xl font-bold text-indigo-400">Student Progress</h2>
            <Card>
                <h3 className="font-bold text-base md:text-lg mb-4">Overall Quiz Performance</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Legend />
                        <Bar dataKey="avgScore" fill="#6366f1" name="Average Score" />
                        <Bar dataKey="quizzesTaken" fill="#818cf8" name="Quizzes Taken" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                <h3 className="font-bold text-base md:text-lg mb-4">Weak Areas & Reports</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="p-2 text-sm">Student</th>
                                <th className="p-2 text-sm">Weak Areas</th>
                                <th className="p-2 text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const perf = performances.find(p => p.studentId === student.id);
                                return (
                                <tr key={student.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="p-2 text-sm">{student.name}</td>
                                    <td className="p-2 text-sm text-amber-400">{perf?.weakAreas.join(', ') || 'N/A'}</td>
                                    <td className="p-2"><Button variant="secondary" className="!py-1 !px-2 text-xs">Download Report</Button></td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- Student Info View ---
const StudentInfoView: React.FC<{ isBilingual: boolean }> = ({ isBilingual }) => {
    const [students, setStudents] = useState<User[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getStudents().then(data => {
            setStudents(data);
            setIsLoading(false);
        });
    }, []);

    const handleStudentUpdate = (updatedStudent: User) => {
        // Update the student in the main list so notes are persisted without re-fetch
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        setSelectedStudent(updatedStudent); // also update the selected student
    };

    if (isLoading) {
        return <Card><Spinner /></Card>;
    }
    
    if (selectedStudent) {
        return <StudentDetailView student={selectedStudent} onBack={() => setSelectedStudent(null)} onUpdate={handleStudentUpdate} isBilingual={isBilingual} />;
    }

    return (
        <Card>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">{isBilingual ? 'ਸਾਰੇ ਵਿਦਿਆਰਥੀ' : 'All Students'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => (
                    <div key={student.id} className="bg-slate-800/50 p-4 rounded-lg flex flex-col items-center text-center">
                        <img src={student.profilePicture} alt={student.name} className="w-24 h-24 rounded-full mb-4 border-4 border-slate-700" />
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <p className="text-sm text-slate-400">{student.email}</p>
                        <Button onClick={() => setSelectedStudent(student)} className="mt-4 w-full">{isBilingual ? 'ਵੇਰਵੇ ਵੇਖੋ' : 'View Details'}</Button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// --- Student Detail View ---
const StudentDetailView: React.FC<{ student: User; onBack: () => void; onUpdate: (student: User) => void; isBilingual: boolean }> = ({ student, onBack, onUpdate, isBilingual }) => {
    const [notes, setNotes] = useState(student.teacherNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [isVoicemailModalOpen, setIsVoicemailModalOpen] = useState(false);
    const [voicemailReason, setVoicemailReason] = useState<'attendance' | 'marks' | 'counselling' | null>(null);

    const handleSaveNotes = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const updatedStudent = await api.updateTeacherNotes(student.id, notes);
            onUpdate(updatedStudent);
            setSaveStatus('saved');
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };
    
    const handleSendVoicemail = (reason: 'attendance' | 'marks' | 'counselling') => {
        setVoicemailReason(reason);
        setIsVoicemailModalOpen(true);
    };

    const voicemailReasonText = {
        attendance: { en: 'Attendance Issues', pa: 'ਹਾਜ਼ਰੀ ਸੰਬੰਧੀ ਮੁੱਦੇ'},
        marks: { en: 'Low Marks', pa: 'ਘੱਟ ਅੰਕ'},
        counselling: { en: 'Counselling Request', pa: 'ਕਾਉਂਸਲਿੰਗ ਬੇਨਤੀ'},
    };

    return (
        <div>
            <Button onClick={onBack} variant="secondary" className="mb-6">&larr; {isBilingual ? 'ਸਾਰੇ ਵਿਦਿਆਰਥੀਆਂ \'ਤੇ ਵਾਪਸ' : 'Back to All Students'}</Button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="text-center">
                        <img src={student.profilePicture} alt={student.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-indigo-500" />
                        <h2 className="text-2xl font-bold">{student.name}</h2>
                        <p className="text-slate-400">{student.email}</p>
                    </Card>
                    <Card>
                        <h3 className="font-bold text-lg mb-4">{isBilingual ? 'ਮਾਪਿਆਂ ਦੀ ਜਾਣਕਾਰੀ' : 'Parent Information'}</h3>
                        <p className="text-sm"><span className="font-semibold">{isBilingual ? 'ਨਾਮ:' : 'Name:'}</span> {student.parentName}</p>
                        <p className="text-sm"><span className="font-semibold">{isBilingual ? 'ਫੋਨ:' : 'Phone:'}</span> {student.parentPhone}</p>
                    </Card>
                </div>

                {/* Right Column: Actions */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                             <PhoneIcon className="w-5 h-5 text-indigo-400"/>
                             {isBilingual ? 'ਸਵੈਚਲਿਤ ਵੌਇਸਮੇਲ ਭੇਜੋ' : 'Send Automated Voicemail'}
                         </h3>
                        <p className="text-sm text-slate-400 mb-4">{isBilingual ? 'ਮਾਪਿਆਂ ਨੂੰ ਇੱਕ ਪੂਰਵ-ਰਿਕਾਰਡ ਕੀਤਾ ਸੁਨੇਹਾ ਭੇਜੋ।' : 'Send a pre-recorded message to the parent.'}</p>
                         <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="secondary" onClick={() => handleSendVoicemail('attendance')} className="flex-1">{isBilingual ? 'ਹਾਜ਼ਰੀ' : 'Attendance'}</Button>
                            <Button variant="secondary" onClick={() => handleSendVoicemail('marks')} className="flex-1">{isBilingual ? 'ਅੰਕ' : 'Marks'}</Button>
                            <Button variant="secondary" onClick={() => handleSendVoicemail('counselling')} className="flex-1">{isBilingual ? 'ਕਾਉਂਸਲਿੰਗ' : 'Counselling'}</Button>
                         </div>
                    </Card>
                    <Card>
                        <h3 className="font-bold text-lg mb-4">{isBilingual ? 'ਅਧਿਆਪਕ ਦੇ ਨੋਟਸ (ਨਿੱਜੀ)' : 'Teacher\'s Notes (Private)'}</h3>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={6}
                            className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                            placeholder={isBilingual ? `${student.name} ਬਾਰੇ ਵਿਚਾਰ-ਵਟਾਂਦਰੇ ਲਈ ਨੋਟਸ ਲਿਖੋ...` : `Jot down notes for discussion about ${student.name}...`}
                        ></textarea>
                        <div className="mt-4 flex justify-end items-center gap-4">
                           {saveStatus === 'saved' && <p className="text-sm text-green-400">Saved!</p>}
                           {saveStatus === 'error' && <p className="text-sm text-red-400">Error saving.</p>}
                           <Button onClick={handleSaveNotes} isLoading={isSaving}>{isBilingual ? 'ਨੋਟਸ ਸੁਰੱਖਿਅਤ ਕਰੋ' : 'Save Notes'}</Button>
                        </div>
                    </Card>
                </div>
            </div>
            {/* Voicemail Confirmation Modal */}
            <Modal isOpen={isVoicemailModalOpen} onClose={() => setIsVoicemailModalOpen(false)} title={isBilingual ? 'ਪੁਸ਼ਟੀ' : 'Confirmation'}>
                <div className="text-center">
                    <p className="mb-6">{isBilingual ? `ਇੱਕ ਸਵੈਚਲਿਤ ਵੌਇਸਮੇਲ ${student.parentName} ਨੂੰ ${voicemailReason ? (voicemailReasonText[voicemailReason].pa) : ''} ਬਾਰੇ ਭੇਜੀ ਜਾਵੇਗੀ।` : `An automated voicemail will be sent to ${student.parentName} regarding ${voicemailReason ? (voicemailReasonText[voicemailReason].en) : ''}.`}</p>
                    <div className="flex justify-center gap-4">
                         <Button onClick={() => setIsVoicemailModalOpen(false)}>
                             {isBilingual ? 'ਭੇਜੋ' : 'Send'}
                         </Button>
                         <Button variant="secondary" onClick={() => setIsVoicemailModalOpen(false)}>
                             {isBilingual ? 'ਰੱਦ ਕਰੋ' : 'Cancel'}
                         </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// --- Attendance View ---
const AttendanceView: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.getAttendance(selectedDate),
            api.getStudents()
        ]).then(([attData, studentData]) => {
            setAttendance(attData);
            setStudents(studentData);
            setIsLoading(false);
        })
    }, [selectedDate]);
    
    return(
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-400">Attendance</h2>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            {isLoading ? <Spinner /> : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[400px]">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="p-2 text-sm">Student</th>
                                <th className="p-2 text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const studentAttendance = attendance.find(a => a.studentId === student.id);
                                const status = studentAttendance?.status || 'N/A';
                                return(
                                    <tr key={student.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-2 text-sm">{student.name}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${status === 'present' ? 'bg-green-500/20 text-green-400' : status === 'absent' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
};


// --- Doubts View ---
const DoubtsSection: React.FC<{isBilingual: boolean}> = ({ isBilingual }) => {
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<Doubt | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDoubts = () => {
        setIsLoading(true);
        Promise.all([
            api.getAllDoubts(),
            api.getStudents()
        ]).then(([doubtData, studentData]) => {
            const sortedDoubts = doubtData.sort((a, b) => {
                if (a.isResolved !== b.isResolved) {
                    return a.isResolved ? 1 : -1;
                }
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
            setDoubts(sortedDoubts);
            setStudents(studentData);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchDoubts();
    }, []);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyingTo || !replyText.trim()) return;

        setIsSubmitting(true);
        try {
            // Using same text for Punjabi for demo.
            await api.replyToDoubt(replyingTo.id, replyText.trim(), replyText.trim());
            setReplyingTo(null);
            setReplyText('');
            fetchDoubts(); // Re-fetch doubts to update the UI
        } catch (error) {
            console.error("Failed to submit reply:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">{isBilingual ? 'ਸ਼ੱਕ ਭਾਗ' : 'Doubt Section'}</h2>
            {isLoading ? <SkeletonCard count={3}/> : (
                <div className="space-y-4">
                    {doubts.map(doubt => {
                        const student = students.find(s => s.id === doubt.studentId);
                        return (
                            <Card key={doubt.id}>
                                <div className="flex justify-between items-start gap-4">
                                   <div className="flex-1">
                                    <p className="font-bold text-sm md:text-base">{isBilingual ? doubt.punjabiSubject : doubt.subject} - {isBilingual ? doubt.punjabiChapter : doubt.chapter}</p>
                                    <p className="text-sm text-slate-400">From: {student?.name}</p>
                                    <p className="text-slate-300 mt-2 text-sm md:text-base">{isBilingual ? doubt.punjabiQuestion : doubt.question}</p>
                                   </div>
                                   {doubt.isResolved ? (
                                     <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 shrink-0">{isBilingual ? 'ਹੱਲ ਕੀਤਾ' : 'Resolved'}</span>
                                   ): (
                                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200 shrink-0">{isBilingual ? 'ਬਕਾਇਆ' : 'Pending'}</span>
                                   )}
                                </div>
                                {doubt.isResolved ? (
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <p className="font-semibold text-indigo-400 text-sm md:text-base">{isBilingual ? 'ਤੁਹਾਡਾ ਜਵਾਬ:' : 'Your Reply:'}</p>
                                        <p className="text-slate-400 mt-1 whitespace-pre-wrap text-sm md:text-base">{isBilingual ? doubt.punjabiAnswer : doubt.answer}</p>
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-slate-700 text-right">
                                        <Button onClick={() => setReplyingTo(doubt)}>{isBilingual ? 'ਜਵਾਬ ਦਿਓ' : 'Reply'}</Button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
            
            <Modal isOpen={!!replyingTo} onClose={() => setReplyingTo(null)} title={`${isBilingual ? '' : 'Reply to'} ${students.find(s => s.id === replyingTo?.studentId)?.name}`}>
                {replyingTo && (
                    <form onSubmit={handleReplySubmit}>
                        <p className="mb-2 font-semibold">{isBilingual ? 'ਸ਼ੱਕ:' : 'Doubt:'}</p>
                        <p className="bg-slate-700/50 p-3 rounded-md mb-4 text-sm md:text-base">{isBilingual ? replyingTo.punjabiQuestion : replyingTo.question}</p>
                        <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows={5}
                            className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm md:text-base"
                            placeholder={isBilingual ? 'ਆਪਣਾ ਜਵਾਬ ਇੱਥੇ ਟਾਈਪ ਕਰੋ...' : 'Type your answer here...'}
                        ></textarea>
                        <div className="mt-4 flex justify-end">
                            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                                {isBilingual ? 'ਜਵਾਬ ਭੇਜੋ' : 'Send Reply'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

// --- Contest Management View ---
const ContestManagementView: React.FC = () => (
    <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-indigo-400">Contest Management</h2>
            <Button>Create New Contest</Button>
        </div>
        <p className="text-slate-400 text-sm md:text-base">Contest management features are coming soon. You will be able to create, edit, and review weekly contests here.</p>
    </Card>
);


// --- Help View ---
const HelpView: React.FC = () => (
    <div>
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">Teacher FAQ Bank</h2>
        <div className="space-y-4">
            {/* This could also be fetched from an API in a real app */}
            <Card>
                <h3 className="text-base md:text-lg font-bold">How can I see which students are struggling?</h3>
                <p className="text-slate-400 mt-2 text-sm md:text-base">The "Student Progress" dashboard highlights students' weak areas based on their quiz performance, allowing you to provide targeted help.</p>
            </Card>
        </div>
    </div>
);


export default TeacherDashboard;