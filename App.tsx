import React, { useState, useEffect } from 'react';
import type { User } from './types';
import { UserRole, Stream } from './types';
import { BookOpenIcon, DownloadIcon } from './constants';
import * as api from './components/api';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Button } from './components/SharedComponents';

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  role: UserRole | null;
};

// --- BILINGUAL TOGGLE for pre-login pages ---
const BilingualToggle: React.FC<{isBilingual: boolean, onToggle: () => void}> = ({ isBilingual, onToggle}) => (
    <div className="flex items-center gap-2 text-sm text-white">
        <span>EN</span>
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isBilingual ? 'bg-indigo-600' : 'bg-slate-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isBilingual ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span>PU</span>
    </div>
);

// --- Landing Page Component ---
const LandingPage: React.FC<{ onSelectRole: (role: UserRole) => void; isBilingual: boolean; }> = ({ onSelectRole, isBilingual }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 text-center">
    <div className="mb-8">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
        {isBilingual ? 'ਵਿਦਿਆ ਵਿਸਤਾਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ' : 'Welcome to'} <span className="text-indigo-400">VidyaVistaar</span>
      </h1>
      <p className="text-lg text-slate-400">{isBilingual ? 'ਸਿੱਖਣ ਅਤੇ ਸਿਖਾਉਣ ਲਈ ਤੁਹਾਡਾ ਆਲ-ਇਨ-ਵਨ ਪਲੇਟਫਾਰਮ।' : 'Your all-in-one platform for learning and teaching.'}</p>
    </div>
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 md:p-12 shadow-2xl w-full max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">{isBilingual ? 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ' : 'Choose your role to get started'}</h2>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button
          onClick={() => onSelectRole(UserRole.Student)}
          className="group relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          <span className="relative w-full px-8 py-4 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0">
            {isBilingual ? 'ਮੈਂ ਇੱਕ ਵਿਦਿਆਰਥੀ ਹਾਂ' : 'I am a Student'}
          </span>
        </button>
        <button
          onClick={() => onSelectRole(UserRole.Teacher)}
          className="group relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="relative w-full px-8 py-4 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0">
            {isBilingual ? 'ਮੈਂ ਇੱਕ ਅਧਿਆਪਕ ਹਾਂ' : 'I am a Teacher'}
          </span>
        </button>
         <button
          onClick={() => onSelectRole(UserRole.Admin)}
          className="group relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
        >
          <span className="relative w-full px-8 py-4 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0">
            {isBilingual ? 'ਮੈਂ ਇੱਕ ਪ੍ਰਬੰਧਕ ਹਾਂ' : 'I am an Admin'}
          </span>
        </button>
      </div>
    </div>
  </div>
);

// --- Login Page Component ---
const LoginPage: React.FC<{ role: UserRole; onLogin: (user: User) => void; onBack: () => void; isBilingual: boolean; }> = ({ role, onLogin, onBack, isBilingual }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
        const user = await api.login(email, password, role);
        onLogin(user);
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setIsLoading(false);
    }
  };
  
  const roleTitle = {
      [UserRole.Student]: isBilingual ? 'ਵਿਦਿਆਰਥੀ ਲੌਗਇਨ' : 'Student Login',
      [UserRole.Teacher]: isBilingual ? 'ਅਧਿਆਪਕ ਲੌਗਇਨ' : 'Teacher Login',
      [UserRole.Admin]: isBilingual ? 'ਪ੍ਰਬੰਧਕ ਲੌਗਇਨ' : 'Admin Login',
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="bg-slate-800/50 border border-slate-700 shadow-2xl rounded-2xl px-8 pt-6 pb-8 mb-4"
        >
          <h2 className="text-2xl font-bold text-center text-indigo-400 mb-6">
            {roleTitle[role]}
          </h2>
          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="email"
              type="email"
              placeholder={`e.g. ${role === UserRole.Student ? 'pranav' : role === UserRole.Teacher ? 'sai_pranav' : 'neha'}@example.com`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password">
              {isBilingual ? 'ਪਾਸਵਰਡ' : 'Password'}
            </label>
            <input
              className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-slate-200 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500">Hint: use password "123456"</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button type="submit" className="w-full sm:w-auto" isLoading={isLoading}>{isBilingual ? 'ਸਾਈਨ ਇਨ ਕਰੋ' : 'Sign In'}</Button>
            <button
              onClick={onBack}
              type="button"
              className="inline-block align-baseline font-bold text-sm text-indigo-400 hover:text-indigo-300"
            >
              {isBilingual ? 'ਭੂਮਿਕਾ ਚੋਣ \'ਤੇ ਵਾਪਸ ਜਾਓ' : 'Back to role selection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Stream Selection Page Component ---
const StreamSelectionPage: React.FC<{ onSelectStream: (stream: Stream) => void; isBilingual: boolean; }> = ({ onSelectStream, isBilingual }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 text-center">
    <div className="mb-8">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
        {isBilingual ? 'ਆਪਣਾ ਸਿੱਖਿਆ ਬੋਰਡ ਚੁਣੋ' : 'Select Your Educational Board'}
      </h1>
      <p className="text-lg text-slate-400">{isBilingual ? 'ਆਪਣੇ ਸਿਲੇਬਸ ਦੇ ਅਨੁਸਾਰ ਆਪਣੇ ਸਿੱਖਣ ਦੇ ਤਜਰਬੇ ਨੂੰ ਵਿਅਕਤੀਗਤ ਬਣਾਓ।' : 'Personalize your learning experience according to your syllabus.'}</p>
    </div>
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 md:p-12 shadow-2xl w-full max-w-2xl">
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <button
          onClick={() => onSelectStream(Stream.NCERT)}
          className="group flex-1 p-8 bg-slate-900/50 border-2 border-slate-700 rounded-xl hover:bg-indigo-600/30 hover:border-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-indigo-400 group-hover:text-white" />
          <h2 className="text-2xl font-bold text-white">NCERT</h2>
          <p className="text-slate-400 text-sm mt-1">{isBilingual ? 'ਰਾਸ਼ਟਰੀ ਪਾਠਕ੍ਰਮ' : 'National Curriculum'}</p>
        </button>
        <button
          onClick={() => onSelectStream(Stream.PSEB)}
          className="group flex-1 p-8 bg-slate-900/50 border-2 border-slate-700 rounded-xl hover:bg-emerald-600/30 hover:border-emerald-500 transition-all duration-300 transform hover:scale-105"
        >
          <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-emerald-400 group-hover:text-white" />
          <h2 className="text-2xl font-bold text-white">PSEB</h2>
          <p className="text-slate-400 text-sm mt-1">{isBilingual ? 'ਪੰਜਾਬ ਸਕੂਲ ਸਿੱਖਿਆ ਬੋਰਡ' : 'Punjab School Education Board'}</p>
        </button>
      </div>
    </div>
  </div>
);


// --- Main App Component ---
const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    role: null,
  });
  const [isBilingual, setIsBilingual] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'login'>('landing');
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const afterInstallHandler = () => {
        setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', afterInstallHandler);


    return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', afterInstallHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setInstallPrompt(null);
  };


  const handleSelectRole = (role: UserRole) => {
    setAuthState(prev => ({ ...prev, role }));
    setCurrentView('login');
  };

  const handleLogin = (user: User) => {
    setAuthState({ isLoggedIn: true, user, role: user.role });
  };

  const handleLogout = () => {
    setAuthState({ isLoggedIn: false, user: null, role: null });
    setSelectedStream(null);
    setCurrentView('landing');
  };

  const handleBackToLanding = () => {
    setAuthState(prev => ({ ...prev, role: null }));
    setCurrentView('landing');
  };
  
  const handleStreamSelect = (stream: Stream) => {
    setSelectedStream(stream);
  };


  if (authState.isLoggedIn && authState.user) {
    if (authState.role === UserRole.Student) {
      if (!selectedStream) {
        return (
          <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center gap-4">
               {!!installPrompt && (
                  <Button onClick={handleInstallClick}>
                    <DownloadIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">{isBilingual ? 'ਐਪ ਇੰਸਟਾਲ ਕਰੋ' : 'Install App'}</span>
                  </Button>
                )}
              <BilingualToggle isBilingual={isBilingual} onToggle={() => setIsBilingual(!isBilingual)} />
            </div>
            <StreamSelectionPage onSelectStream={handleStreamSelect} isBilingual={isBilingual} />
          </div>
        );
      }
      return <StudentDashboard user={authState.user} onLogout={handleLogout} stream={selectedStream} onInstall={handleInstallClick} canInstall={!!installPrompt} />;
    }
    
    // For Teacher and Admin, bypass stream selection
    switch (authState.role) {
      case UserRole.Teacher:
        return <TeacherDashboard user={authState.user} onLogout={handleLogout} onInstall={handleInstallClick} canInstall={!!installPrompt} />;
      case UserRole.Admin:
        return <AdminDashboard user={authState.user} onLogout={handleLogout} onInstall={handleInstallClick} canInstall={!!installPrompt} />;
      default:
        // Fallback to landing page if role is unknown
        setCurrentView('landing');
        setAuthState({ isLoggedIn: false, user: null, role: null });
    }
  }

  if (!authState.isLoggedIn) {
      return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center gap-4">
                {!!installPrompt && (
                  <Button onClick={handleInstallClick}>
                    <DownloadIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">{isBilingual ? 'ਐਪ ਇੰਸਟਾਲ ਕਰੋ' : 'Install App'}</span>
                  </Button>
                )}
                <BilingualToggle isBilingual={isBilingual} onToggle={() => setIsBilingual(!isBilingual)} />
            </div>
          {currentView === 'login' && authState.role ? (
            <LoginPage role={authState.role} onLogin={handleLogin} onBack={handleBackToLanding} isBilingual={isBilingual} />
          ) : (
            <LandingPage onSelectRole={handleSelectRole} isBilingual={isBilingual} />
          )}
        </div>
      );
  }


  return <LandingPage onSelectRole={handleSelectRole} isBilingual={isBilingual} />;
};

export default App;