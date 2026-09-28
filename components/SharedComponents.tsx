import React from 'react';
import type { User, Stream } from '../types';
import { UserRole } from '../types';
import { HomeIcon, BookOpenIcon, MessageQuestionIcon, TrophyIcon, ChartBarIcon, UsersIcon, SparklesIcon, DocumentReportIcon, CollectionIcon, QuestionMarkCircleIcon, ClipboardListIcon, ShieldCheckIcon, PencilIcon, BriefcaseIcon, RotateDeviceIcon, DownloadIcon } from '../constants';
import { navItemsByRole } from '../constants';

// --- SPINNER ---
export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
  </div>
);

// --- SKELETON CARD ---
export const SkeletonCard: React.FC<{ count?: number, className?: string }> = ({ count = 1, className }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg p-4 md:p-6 animate-pulse ${className}`}>
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
        ))}
    </>
);


// --- CARD ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-lg p-4 md:p-6 ${className}`}>
    {children}
  </div>
);

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl m-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg md:text-xl font-bold text-indigo-400">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, isLoading, ...props }) => {
    const baseClasses = "px-3 py-2 md:px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
    const variantClasses = {
        primary: 'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500',
        danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {children}
        </button>
    );
};

// --- BILINGUAL TOGGLE ---
const BilingualToggle: React.FC<{isBilingual: boolean, onToggle: () => void}> = ({ isBilingual, onToggle}) => (
    <div className="flex items-center gap-2 text-sm">
        <span>EN</span>
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isBilingual ? 'bg-indigo-600' : 'bg-slate-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isBilingual ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span>PU</span>
    </div>
);


// --- HEADER ---
interface HeaderProps {
  user: User;
  onLogout: () => void;
  isBilingual: boolean;
  onToggleBilingual: () => void;
  onToggleSidebar: () => void;
  title?: string;
  stats?: { label: string; value: string | number }[];
  stream?: Stream | null;
}
export const Header: React.FC<HeaderProps> = ({ user, onLogout, isBilingual, onToggleBilingual, onToggleSidebar, title, stats, stream }) => (
  <header className="mb-6 md:mb-8">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
             <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-slate-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
            <div className="w-full md:w-auto">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{title || `Welcome, ${user.name}!`}</h1>
                <p className="text-xs lg:text-sm text-slate-400">
                {user.role === UserRole.Student && `Board: ${stream?.toUpperCase()} | Let's learn something new today.`}
                {user.role === UserRole.Teacher && "Manage your classes and students."}
                {user.role === UserRole.Admin && "Oversee the educational ecosystem."}
                </p>
            </div>
        </div>
      <div className="flex items-center gap-2 md:gap-4 self-end md:self-auto">
        <BilingualToggle isBilingual={isBilingual} onToggle={onToggleBilingual} />
        <div className="text-right hidden sm:block">
          <div className="font-semibold text-sm md:text-base">{user.name}</div>
          <div className="text-xs text-slate-400">{user.email}</div>
        </div>
        <img src={user.profilePicture} alt={user.name} className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-indigo-500" />
        <button onClick={onLogout} className="bg-slate-700/50 hover:bg-slate-600/50 p-2 md:p-3 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </div>
    {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {stats.map(stat => (
                <Card key={stat.label} className="flex items-center gap-4">
                    <div className="bg-indigo-600/20 p-2 md:p-3 rounded-lg">
                       {stat.label.includes('Courses') && <BookOpenIcon className="h-6 w-6 md:h-7 md:w-7 text-indigo-400" />}
                       {stat.label.includes('Students') && <UsersIcon className="h-6 w-6 md:h-7 md:w-7 text-indigo-400" />}
                       {stat.label.includes('Doubts') && <MessageQuestionIcon className="h-6 w-6 md:h-7 md:w-7 text-indigo-400" />}
                       {stat.label.includes('Schools') && <HomeIcon className="h-6 w-6 md:h-7 md:w-7 text-indigo-400" />}
                    </div>
                    <div>
                        <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                        <div className="text-sm md:text-base text-slate-400">{stat.label}</div>
                    </div>
                </Card>
            ))}
        </div>
    )}
  </header>
);

// --- SIDEBAR ---
interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  role: UserRole;
  isBilingual: boolean;
  isSidebarOpen: boolean;
  onInstall: () => void;
  canInstall: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, role, isBilingual, isSidebarOpen, onInstall, canInstall }) => {
  const navItems = navItemsByRole[role];
  return (
    <aside className={`bg-slate-900/70 backdrop-blur-md p-4 flex flex-col justify-between shrink-0 h-full overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div>
        <div className={`flex items-center gap-3 mb-10 ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
          <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" />
            </svg>
          </div>
          <span className={`text-xl font-bold transition-opacity whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>VidyaVistaar</span>
        </div>
        <nav>
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  title={!isSidebarOpen ? (isBilingual ? item.punjabiLabel : item.label) : ''}
                  className={`w-full flex items-center gap-3 my-1 rounded-lg transition-all duration-200 text-sm ${isSidebarOpen ? 'px-4 py-3' : 'p-4 justify-center'} ${
                    activeView === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={`whitespace-nowrap ${isSidebarOpen ? 'inline' : 'hidden'}`}>{isBilingual ? item.punjabiLabel : item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        {canInstall && (
          <div className={isSidebarOpen ? 'px-2' : ''}>
            <button
              onClick={onInstall}
              title={!isSidebarOpen ? (isBilingual ? 'ਐਪ ਇੰਸਟਾਲ ਕਰੋ' : 'Install App') : ''}
              className={`w-full flex items-center gap-3 my-1 rounded-lg transition-all duration-200 text-sm ${isSidebarOpen ? 'px-4 py-3' : 'p-4 justify-center'} text-slate-400 hover:bg-slate-700/50 hover:text-white`}
            >
              <DownloadIcon className="h-5 w-5 shrink-0" />
              <span className={`whitespace-nowrap ${isSidebarOpen ? 'inline' : 'hidden'}`}>{isBilingual ? 'ਐਪ ਇੰਸਟਾਲ ਕਰੋ' : 'Install App'}</span>
            </button>
          </div>
        )}
        <div className={`text-center text-xs text-slate-500 transition-opacity whitespace-nowrap ${isSidebarOpen ? 'opacity-100 mt-2' : 'opacity-0 hidden'}`}>
          &copy; 2024 VidyaVistaar. All rights reserved.
        </div>
      </div>
    </aside>
  );
};

// --- ROTATION PROMPT ---
export const RotationPrompt: React.FC<{isBilingual: boolean}> = ({ isBilingual }) => (
  <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-[100] text-center p-4 lg:hidden">
    <RotateDeviceIcon className="w-24 h-24 text-indigo-400 mb-6 animate-pulse" />
    <h2 className="text-2xl font-bold text-white mb-2">
      {isBilingual ? 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਡਿਵਾਈਸ ਨੂੰ ਘੁਮਾਓ' : 'Please Rotate Your Device'}
    </h2>
    <p className="text-slate-400 max-w-sm">
      {isBilingual ? 'ਇਸ ਐਪਲੀਕੇਸ਼ਨ ਨੂੰ ਵਧੀਆ ਤਰੀਕੇ ਨਾਲ ਦੇਖਣ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਡਿਵਾਈਸ ਨੂੰ ਲੈਂਡਸਕੇਪ ਮੋਡ ਵਿੱਚ ਘੁਮਾਓ।' : 'For the best viewing experience, please turn your device to landscape mode.'}
    </p>
  </div>
);