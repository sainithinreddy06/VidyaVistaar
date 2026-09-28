import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { User, Subject, Chapter, Quiz, Contest, FaqItem, Stream, Doubt, StudentPerformance, Textbook, Resource } from '../types';
import { UserRole } from '../types';
import { BookOpenIcon } from '../constants';
import * as api from './api';
import { Card, Header, Sidebar, Modal, Button, RotationPrompt, Spinner, SkeletonCard } from './SharedComponents';
import { ChevronDownIcon, PlayIcon, DocumentReportIcon, SparklesIcon } from '../constants';
import AIAssistant from './AIAssistant';
import CareerViewpoint from './CareerViewpoint';

// Main Dashboard Component
interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  stream: Stream;
  onInstall: () => void;
  canInstall: boolean;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, stream, onInstall, canInstall }) => {
  const [activeView, setActiveView] = useState('lessons');
  const [isBilingual, setIsBilingual] = useState(false);
  const [showRotationPrompt, setShowRotationPrompt] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
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
    setIsLoadingSubjects(true);
    api.getSubjectsForStream(stream).then(data => {
      setSubjects(data);
      setIsLoadingSubjects(false);
    })
  }, [stream]);

  const renderContent = () => {
    if (isLoadingSubjects) {
      return <div className="flex items-center justify-center h-full"><Spinner/></div>;
    }
    
    switch (activeView) {
      case 'lessons':
        return <LessonsView isBilingual={isBilingual} subjects={subjects} />;
      case 'quizzes':
        return <QuizzesView isBilingual={isBilingual} subjects={subjects} />;
      case 'doubts':
        return <DoubtsView user={user} isBilingual={isBilingual} subjects={subjects} />;
      case 'contests':
        return <ContestsView user={user} />;
      case 'career':
        return <CareerViewpoint isBilingual={isBilingual} />;
      case 'assistant':
        return <AIAssistant isBilingual={isBilingual} role={user.role} />;
      case 'reports':
        return <ReportsView user={user} isBilingual={isBilingual} allSubjects={subjects} />;
      case 'resources':
        return <ResourcesView isBilingual={isBilingual} stream={stream} />;
      case 'help':
        return <HelpView isBilingual={isBilingual} />;
      default:
        return <LessonsView isBilingual={isBilingual} subjects={subjects} />;
    }
  };
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen bg-slate-900 text-slate-200">
      {showRotationPrompt && <RotationPrompt isBilingual={isBilingual} />}
      <div className={`flex h-full w-full ${showRotationPrompt ? 'hidden' : ''}`}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} role={UserRole.Student} isBilingual={isBilingual} isSidebarOpen={isSidebarOpen} onInstall={onInstall} canInstall={canInstall} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Header user={user} onLogout={onLogout} isBilingual={isBilingual} onToggleBilingual={() => setIsBilingual(!isBilingual)} onToggleSidebar={toggleSidebar} stream={stream} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// --- Lessons View ---
const LessonsView: React.FC<{isBilingual: boolean, subjects: Subject[]}> = ({isBilingual, subjects}) => {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(subjects[0] || null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isQuizModalOpen, setQuizModalOpen] = useState(false);

    useEffect(() => {
      setSelectedSubject(subjects[0] || null);
      setSelectedChapter(null);
    }, [subjects]);

    const handleChapterSelect = (chapter: Chapter) => {
        setSelectedChapter(chapter);
    };
    
    const handleStartQuiz = () => {
        if(selectedChapter) setQuizModalOpen(true);
    };
    
    const totalChapters = subjects.reduce((acc, s) => acc + s.chapters.length, 0);
    const completedChapters = subjects.reduce((acc, s) => acc + s.chapters.filter(c => c.completed).length, 0);
    const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    return (
        <div>
            <Card className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-2">My Progress</h2>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                </div>
                <p className="text-right text-sm text-slate-400 mt-1">{completedChapters} of {totalChapters} lessons completed ({Math.round(progress)}%)</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-400">Subjects</h2>
                    <div className="space-y-2">
                        {subjects.map(subject => (
                            <SubjectAccordion key={subject.id} subject={subject} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} onChapterSelect={handleChapterSelect} isBilingual={isBilingual} />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        {selectedChapter ? (
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-400">{isBilingual ? selectedChapter.punjabiTitle : selectedChapter.title}</h2>
                                <div className="aspect-video bg-black rounded-lg mb-4 overflow-hidden">
                                     <iframe
                                        key={selectedChapter.videoUrl}
                                        className="w-full h-full"
                                        src={selectedChapter.videoUrl}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <p className="text-slate-400 mb-6 text-sm md:text-base">Watch the lecture to understand the concepts before attempting the quiz.</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button onClick={handleStartQuiz} className="w-full sm:w-auto">
                                        <PlayIcon className="h-5 w-5" /> Start Quiz
                                    </Button>
                                    <Button variant="secondary" onClick={() => window.open(selectedChapter.pdfUrl, '_blank')} className="w-full sm:w-auto">Download Notes</Button>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-700">
                                    <h3 className="text-lg md:text-xl font-bold text-indigo-300 mb-3">Career Viewpoint</h3>
                                    <p className="text-slate-400 mb-4 text-sm md:text-base">Mastering {isBilingual ? selectedSubject?.punjabiName : selectedSubject?.name} can open doors to careers in engineering, data science, and research. Here are some resources to explore:</p>
                                    <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm md:text-base">
                                        <li><a href="https://www.youtube.com/results?search_query=top+jobs+in+STEM" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">YouTube: Top Jobs in this Field</a></li>
                                        <li><a href="https://brilliant.org/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">Fun Task: Solve a real-world problem</a></li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 p-8">
                                <p className="text-sm md:text-base">Select a chapter to begin learning.</p>
                            </div>
                        )}
                    </Card>
                </div>
                {selectedChapter && <QuizModal key={selectedChapter.quiz.id} isOpen={isQuizModalOpen} onClose={() => setQuizModalOpen(false)} quiz={selectedChapter.quiz} isBilingual={isBilingual} />}
            </div>
        </div>
    );
};

const SubjectAccordion: React.FC<{ subject: Subject; selectedSubject: Subject | null; setSelectedSubject: (subject: Subject | null) => void; onChapterSelect: (chapter: Chapter) => void; isBilingual: boolean; }> = ({ subject, selectedSubject, setSelectedSubject, onChapterSelect, isBilingual }) => {
    const isOpen = selectedSubject?.id === subject.id;
    const toggleOpen = () => setSelectedSubject(isOpen ? null : subject);

    return (
        <Card className="p-0 overflow-hidden">
            <button onClick={toggleOpen} className="w-full flex justify-between items-center p-4 text-left">
                <span className="font-semibold text-base md:text-lg">{isBilingual ? subject.punjabiName : subject.name}</span>
                <ChevronDownIcon className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700">
                    <ul className="space-y-2">
                        {subject.chapters.map(chapter => (
                            <li key={chapter.id}>
                                <button onClick={() => onChapterSelect(chapter)} className="w-full text-left p-2 rounded-md hover:bg-slate-700/50 transition-colors text-sm md:text-base">
                                    {isBilingual ? chapter.punjabiTitle : chapter.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
};


// --- Quiz Modal & Performance View ---
const QuizModal: React.FC<{ isOpen: boolean; onClose: () => void; quiz: Quiz; isBilingual: boolean; }> = ({ isOpen, onClose, quiz, isBilingual }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
    const [quizFinished, setQuizFinished] = useState(false);

    const handleAnswerSelect = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setQuizFinished(true);
        }
    };
    
    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setAnswers(new Array(quiz.questions.length).fill(null));
        setQuizFinished(false);
    }
    
    const handleClose = () => {
        resetQuiz();
        onClose();
    }

    const score = answers.reduce((acc, answer, index) => {
        if (quiz.questions[index].type === 'mcq' && answer === quiz.questions[index].correctAnswer) {
           return acc + 1;
        }
        return acc;
    }, 0);

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isBilingual ? quiz.punjabiTitle : quiz.title}>
            {!quizFinished ? (
                <div>
                    <div className="mb-4">
                        <p className="text-slate-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                        <h3 className="text-lg md:text-xl font-semibold mt-1">{currentQuestion.text}</h3>
                    </div>
                    {currentQuestion.type === 'mcq' && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    className={`w-full text-left p-3 border rounded-lg transition-all text-sm md:text-base ${
                                        answers[currentQuestionIndex] === index
                                            ? 'bg-indigo-600 border-indigo-500'
                                            : 'bg-slate-700/50 border-slate-600 hover:bg-indigo-600/30 hover:border-indigo-500'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleNext} disabled={answers[currentQuestionIndex] === null}>
                            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Finish Quiz'}
                        </Button>
                    </div>
                </div>
            ) : (
                <PerformanceView score={score} total={quiz.questions.length} onRetry={resetQuiz} onClose={handleClose} />
            )}
        </Modal>
    );
};

const PerformanceView: React.FC<{ score: number, total: number, onRetry: () => void, onClose: () => void }> = ({ score, total, onRetry, onClose }) => (
    <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-slate-400 mb-6">Here's how you performed.</p>
        <div className="text-5xl md:text-6xl font-bold mb-4 text-indigo-400">
            {score} <span className="text-3xl md:text-4xl text-slate-400">/ {total}</span>
        </div>
        <div className="text-base md:text-lg mb-8">{score > total / 2 ? 'Great job!' : 'Keep practicing!'}</div>
        <div className="flex justify-center gap-4">
            <Button onClick={onRetry}>Retry Quiz</Button>
            <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
    </div>
);


// --- Quizzes View ---
const QuizzesView: React.FC<{isBilingual: boolean, subjects: Subject[]}> = ({ isBilingual, subjects }) => {
    const allQuizzes = subjects.flatMap(s => s.chapters.map(c => ({...c.quiz, subject: s.name, chapter: c.title})));
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    
    return (
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">All Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allQuizzes.map(quiz => (
                    <Card key={quiz.id} className="flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-indigo-400">{quiz.subject} - {quiz.chapter}</p>
                            <h3 className="text-base md:text-lg font-bold mt-1">{isBilingual ? quiz.punjabiTitle : quiz.title}</h3>
                            <p className="text-xs text-slate-400 mt-2">{quiz.questions.length} Questions</p>
                        </div>
                        <Button onClick={() => setSelectedQuiz(quiz)} className="mt-4 w-full">Start Quiz</Button>
                    </Card>
                ))}
            </div>
            {selectedQuiz && <QuizModal isOpen={!!selectedQuiz} onClose={() => setSelectedQuiz(null)} quiz={selectedQuiz} isBilingual={isBilingual} />}
        </div>
    );
};


// --- Doubts View ---
const DoubtsView: React.FC<{user: User, isBilingual: boolean, subjects: Subject[]}> = ({user, isBilingual, subjects}) => {
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDoubts = () => {
        setIsLoading(true);
        api.getDoubtsForStudent(user.id).then(data => {
            const sortedDoubts = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setDoubts(sortedDoubts);
            setIsLoading(false);
        });
    }
    
    useEffect(() => {
        fetchDoubts();
    }, [user.id]);

    const handlePostDoubt = async (newDoubtData: Omit<Doubt, 'id' | 'timestamp' | 'isResolved' | 'answer' | 'punjabiAnswer'>) => {
        await api.postDoubt(newDoubtData);
        setIsModalOpen(false);
        fetchDoubts(); // Refresh doubts list
    };

    if(isLoading) {
        return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-indigo-400">{isBilingual ? 'ਮੇਰੇ ਸ਼ੱਕ' : 'My Doubts'}</h2>
                     <Button onClick={() => setIsModalOpen(true)}>{isBilingual ? 'ਨਵਾਂ ਸ਼ੱਕ ਪੋਸਟ ਕਰੋ' : 'Post New Doubt'}</Button>
                </div>
                 <SkeletonCard count={2} />
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-400">{isBilingual ? 'ਮੇਰੇ ਸ਼ੱਕ' : 'My Doubts'}</h2>
                <Button onClick={() => setIsModalOpen(true)}>{isBilingual ? 'ਨਵਾਂ ਸ਼ੱਕ ਪੋਸਟ ਕਰੋ' : 'Post New Doubt'}</Button>
            </div>
             <div className="space-y-4">
                {doubts.length > 0 ? doubts.map(doubt => (
                    <Card key={doubt.id}>
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                            <p className="font-bold text-sm md:text-base">{isBilingual ? doubt.punjabiSubject : doubt.subject} - {isBilingual ? doubt.punjabiChapter : doubt.chapter}</p>
                            <p className="text-slate-300 mt-2 text-sm md:text-base">{isBilingual ? doubt.punjabiQuestion : doubt.question}</p>
                           </div>
                           {doubt.isResolved ? (
                             <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 shrink-0 ml-4">{isBilingual ? 'ਹੱਲ ਕੀਤਾ' : 'Resolved'}</span>
                           ): (
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200 shrink-0 ml-4">{isBilingual ? 'ਬਕਾਇਆ' : 'Pending'}</span>
                           )}
                        </div>
                        {doubt.isResolved && (doubt.answer || doubt.punjabiAnswer) && (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="font-semibold text-indigo-400 text-sm md:text-base">{isBilingual ? "ਅਧਿਆਪਕ ਦਾ ਜਵਾਬ:" : "Teacher's Reply:"}</p>
                                <p className="text-slate-400 mt-1 whitespace-pre-wrap text-sm md:text-base">{isBilingual ? doubt.punjabiAnswer : doubt.answer}</p>
                            </div>
                        )}
                    </Card>
                )) : (
                    <Card className="text-center text-slate-500">
                        <p>{isBilingual ? 'ਤੁਸੀਂ ਅਜੇ ਤੱਕ ਕੋਈ ਸ਼ੱਕ ਪੋਸਟ ਨਹੀਂ ਕੀਤਾ ਹੈ।' : 'You haven\'t posted any doubts yet.'}</p>
                        <p>{isBilingual ? 'ਕੋਈ ਸਵਾਲ ਪੁੱਛਣ ਲਈ ਉੱਪਰ ਦਿੱਤੇ ਬਟਨ \'ਤੇ ਕਲਿੱਕ ਕਰੋ!' : 'Click the button above to ask a question!'}</p>
                    </Card>
                )}
             </div>
             <PostDoubtModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handlePostDoubt}
                subjects={subjects}
                isBilingual={isBilingual}
                studentId={user.id}
             />
        </div>
    );
}

// --- Post Doubt Modal ---
interface PostDoubtModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (doubt: Omit<Doubt, 'id' | 'timestamp' | 'isResolved' | 'answer' | 'punjabiAnswer'>) => Promise<void>;
    subjects: Subject[];
    isBilingual: boolean;
    studentId: string;
}

const PostDoubtModal: React.FC<PostDoubtModalProps> = ({ isOpen, onClose, onSubmit, subjects, isBilingual, studentId }) => {
    const [subjectId, setSubjectId] = useState<string>('');
    const [chapterId, setChapterId] = useState<string>('');
    const [question, setQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableChapters = useMemo(() => {
        return subjects.find(s => s.id === subjectId)?.chapters || [];
    }, [subjectId, subjects]);

    useEffect(() => {
        setChapterId(''); // Reset chapter when subject changes
    }, [subjectId]);

    const resetForm = () => {
        setSubjectId('');
        setChapterId('');
        setQuestion('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectId || !chapterId || !question.trim()) return;

        setIsSubmitting(true);
        const selectedSubject = subjects.find(s => s.id === subjectId);
        const selectedChapter = availableChapters.find(c => c.id === chapterId);
        
        if (!selectedSubject || !selectedChapter) {
            setIsSubmitting(false);
            return;
        }

        const newDoubtData = {
            studentId,
            subject: selectedSubject.name,
            punjabiSubject: selectedSubject.punjabiName,
            chapter: selectedChapter.title,
            punjabiChapter: selectedChapter.punjabiTitle,
            question: question.trim(),
            punjabiQuestion: question.trim(), // For demo, duplicating the question. A real app might use translation.
        };
        
        await onSubmit(newDoubtData);
        setIsSubmitting(false);
        handleClose();
    };
    
    const isFormValid = subjectId && chapterId && question.trim();

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isBilingual ? 'ਨਵਾਂ ਸ਼ੱਕ ਪੋਸਟ ਕਰੋ' : 'Post a New Doubt'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{isBilingual ? 'ਵਿਸ਼ਾ' : 'Subject'}</label>
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="" disabled>{isBilingual ? '-- ਵਿਸ਼ਾ ਚੁਣੋ --' : '-- Select Subject --'}</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{isBilingual ? s.punjabiName : s.name}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{isBilingual ? 'ਅਧਿਆਇ' : 'Chapter'}</label>
                        <select
                            value={chapterId}
                            onChange={(e) => setChapterId(e.target.value)}
                            disabled={!subjectId}
                            className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                        >
                            <option value="" disabled>{isBilingual ? '-- ਅਧਿਆਇ ਚੁਣੋ --' : '-- Select Chapter --'}</option>
                            {availableChapters.map(c => (
                                <option key={c.id} value={c.id}>{isBilingual ? c.punjabiTitle : c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{isBilingual ? 'ਤੁਹਾਡਾ ਸਵਾਲ' : 'Your Question'}</label>
                         <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            rows={5}
                            className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder={isBilingual ? 'ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਟਾਈਪ ਕਰੋ...' : 'Type your question here...'}
                        ></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                     <Button type="button" variant="secondary" onClick={handleClose}>
                        {isBilingual ? 'ਰੱਦ ਕਰੋ' : 'Cancel'}
                    </Button>
                    <Button type="submit" disabled={!isFormValid || isSubmitting} isLoading={isSubmitting}>
                        {isBilingual ? 'ਜਮ੍ਹਾਂ ਕਰੋ' : 'Submit Doubt'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};


// --- Contests View ---
const ContestsView: React.FC<{user: User}> = ({user}) => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isContestModalOpen, setContestModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

    useEffect(() => {
        Promise.all([api.getContests(), api.getStudents()]).then(([contestsData, studentsData]) => {
            setContests(contestsData);
            setStudents(studentsData);
            setIsLoading(false);
        })
    }, []);

    const handleStartContest = (contest: Contest) => {
        setSelectedContest(contest);
        setContestModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">Weekly Contests</h2>
                    <SkeletonCard count={2} />
                </div>
                 <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">Leaderboards</h2>
                    <SkeletonCard count={1} className="h-48" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">Weekly Contests</h2>
                <div className="space-y-4">
                    {contests.map(contest => (
                        <Card key={contest.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-base md:text-lg font-bold">{contest.title}</p>
                                <p className="text-sm text-slate-400">{contest.subject} | {contest.durationMinutes} mins</p>
                            </div>
                            <Button onClick={() => handleStartContest(contest)} className="w-full sm:w-auto shrink-0">Attempt Now</Button>
                        </Card>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">Leaderboards</h2>
                <Card>
                    {contests.map(contest => (
                        <div key={contest.id} className="mb-6 last:mb-0">
                            <h3 className="font-bold mb-2 text-base md:text-lg">{contest.title}</h3>
                            <ul className="space-y-2">
                                {contest.leaderboard.sort((a,b) => b.score - a.score).map((entry, index) => {
                                    const student = students.find(s => s.id === entry.studentId);
                                    return (
                                        <li key={entry.studentId} className={`flex justify-between items-center p-2 rounded-md text-sm ${index === 0 ? 'bg-yellow-500/20' : 'bg-slate-700/50'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{index + 1}.</span>
                                                <span>{student?.name}</span>
                                            </div>
                                            <span className="font-semibold">{entry.score} pts</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </Card>
            </div>
            {selectedContest && <QuizModal key={selectedContest.id} isOpen={isContestModalOpen} onClose={() => setContestModalOpen(false)} quiz={selectedContest as any} isBilingual={false} />}
        </div>
    );
};

// --- Reports View ---
const ReportsView: React.FC<{user: User, isBilingual: boolean, allSubjects: Subject[]}> = ({ user, isBilingual, allSubjects }) => {
    const [performance, setPerformance] = useState<StudentPerformance | null>(null);
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getStudentPerformance(user.id),
            api.getContests()
        ]).then(([perfData, contestData]) => {
            setPerformance(perfData);
            setContests(contestData);
            setIsLoading(false);
        });
    }, [user.id]);
    
    const getSubjectFromQuizId = (quizId: string) => {
        for (const subject of allSubjects) {
            for (const chapter of subject.chapters) {
                if (chapter.quiz.id === quizId) {
                    return subject;
                }
            }
        }
        return null;
    };

    const { chartData, avgScore, weakSubjects } = useMemo(() => {
        if (!performance) return { chartData: [], avgScore: 0, weakSubjects: [] };

        const subjectScores: { [key: string]: { totalScore: number; count: number; punjabiName: string } } = {};
        let totalScore = 0;
        let totalQuizzes = 0;

        for (const [quizId, score] of Object.entries(performance.quizScores)) {
            const subject = getSubjectFromQuizId(quizId);
            if (subject) {
                if (!subjectScores[subject.name]) {
                    subjectScores[subject.name] = { totalScore: 0, count: 0, punjabiName: subject.punjabiName };
                }
                subjectScores[subject.name].totalScore += score;
                subjectScores[subject.name].count += 1;
                totalScore += score;
                totalQuizzes++;
            }
        }
        
        const chartData = Object.entries(subjectScores).map(([name, data]) => ({
            name: isBilingual ? data.punjabiName : name,
            score: Math.round(data.totalScore / data.count),
        }));
        
        const weakSubjects = Object.entries(subjectScores)
            .filter(([, data]) => Math.round(data.totalScore / data.count) < 70)
            .map(([name, data]) => isBilingual ? data.punjabiName : name);

        return {
            chartData,
            avgScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
            weakSubjects,
        };
    }, [performance, isBilingual, allSubjects]);

    if (isLoading) {
        return <Card><Spinner /></Card>
    }

    const totalLessons = allSubjects.reduce((acc, s) => acc + s.chapters.length, 0);
    const completedLessons = allSubjects.reduce((acc, s) => acc + s.chapters.filter(c => c.completed).length, 0);

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-400">{isBilingual ? 'ਮੇਰੀ ਮਹੀਨਾਵਾਰ ਰਿਪੋਰਟ' : 'My Monthly Report'}</h2>
                <Button variant="primary">
                    <DocumentReportIcon className="h-5 w-5"/>
                    {isBilingual ? 'PDF ਡਾਊਨਲੋਡ ਕਰੋ' : 'Download PDF'}
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-slate-400">{isBilingual ? 'ਕੁੱਲ ਪਾਠ ਮੁਕੰਮਲ' : 'Total Lessons Completed'}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{completedLessons} <span className="text-base md:text-lg text-slate-400">/ {totalLessons}</span></p>
                </div>
                 <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-slate-400">{isBilingual ? 'ਔਸਤ ਕਵਿਜ਼ ਸਕੋਰ' : 'Average Quiz Score'}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{avgScore}%</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-slate-400">{isBilingual ? 'ਮੁਕਾਬਲਿਆਂ ਵਿੱਚ ਹਿੱਸਾ ਲਿਆ' : 'Contests Participated'}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{contests.filter(c => c.leaderboard.some(l => l.studentId === user.id)).length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-base md:text-lg font-bold mb-4">{isBilingual ? 'ਵਿਸ਼ੇ ਅਨੁਸਾਰ ਕਾਰਗੁਜ਼ਾਰੀ' : 'Subject-wise Performance'}</h3>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                                <YAxis type="category" dataKey="name" width={80} stroke="#94a3b8" tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}/>
                                <Bar dataKey="score" fill="#6366f1" name={isBilingual ? 'ਸਕੋਰ' : 'Score'} background={{ fill: '#334155' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div>
                    <h3 className="text-base md:text-lg font-bold mb-4">{isBilingual ? 'ਸੁਧਾਰ ਲਈ ਖੇਤਰ' : 'Areas for Improvement'}</h3>
                    {weakSubjects.length > 0 ? (
                        <ul className="space-y-2">
                           {weakSubjects.map(subject => (
                               <li key={subject} className="bg-amber-500/10 text-amber-300 p-3 rounded-md text-sm">{subject}</li>
                           ))}
                        </ul>
                    ) : (
                        <div className="bg-green-500/10 text-green-300 p-3 rounded-md text-sm">
                           {isBilingual ? 'ਸ਼ਾਨਦਾਰ! ਤੁਸੀਂ ਸਾਰੇ ਵਿਸ਼ਿਆਂ ਵਿੱਚ ਵਧੀਆ ਕਰ ਰਹੇ ਹੋ।' : 'Excellent! You are doing great in all subjects.'}
                        </div>
                    )}
                     <p className="text-xs text-slate-500 mt-4">{isBilingual ? '70% ਤੋਂ ਘੱਟ ਸਕੋਰ ਵਾਲੇ ਵਿਸ਼ਿਆਂ ਨੂੰ ਇੱਥੇ ਉਜਾਗਰ ਕੀਤਾ ਗਿਆ ਹੈ।' : 'Subjects with scores below 70% are highlighted here.'}</p>
                </div>
            </div>
        </Card>
    );
};


// --- Resources View ---
const ResourcesView: React.FC<{isBilingual: boolean, stream: Stream}> = ({ isBilingual, stream }) => {
    const [selectedClass, setSelectedClass] = useState(10);
    const [books, setBooks] = useState<Textbook[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const classes = Array.from({length: 10}, (_, i) => i + 1);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.getTextbooks(stream, selectedClass),
            api.getResources()
        ]).then(([textbookData, resourceData]) => {
            setBooks(textbookData);
            setResources(resourceData);
            setIsLoading(false);
        })
    }, [stream, selectedClass]);
    

    return (
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-indigo-400">{isBilingual ? 'ਸਰੋਤ ਲਾਇਬ੍ਰੇਰੀ' : 'Resources Library'}</h2>
            <p className="text-slate-400 mb-6 text-sm md:text-base">{isBilingual ? 'ਆਪਣੀ ਜਮਾਤ ਲਈ ਪਾਠ-ਪੁਸਤਕਾਂ ਡਾਊਨਲੋਡ ਕਰੋ ਅਤੇ ਹੋਰ ਸਿੱਖਣ ਸਮੱਗਰੀ ਦੀ ਪੜਚੋਲ ਕਰੋ।' : 'Download textbooks for your class and explore other learning materials.'}</p>

            <Card className="mb-8">
                <h3 className="text-base md:text-lg font-bold mb-4">{isBilingual ? 'ਜਮਾਤ ਚੁਣੋ' : 'Select Class'}</h3>
                <div className="flex flex-wrap gap-2">
                    {classes.map(c => (
                        <button 
                            key={c}
                            onClick={() => setSelectedClass(c)}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${selectedClass === c ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                           {isBilingual ? `ਜਮਾਤ ${c}` : `Class ${c}`}
                        </button>
                    ))}
                </div>
            </Card>

            <div>
                <h3 className="text-lg md:text-xl font-bold mb-4 text-indigo-300">{isBilingual ? `ਜਮਾਤ ${selectedClass} ਲਈ ਪਾਠ-ਪੁਸਤਕਾਂ` : `Textbooks for Class ${selectedClass}`}</h3>
                {isLoading ? <SkeletonCard count={4} className="h-32" /> : (
                    books.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {books.map(book => (
                                <Card key={book.id} className="flex flex-col items-center text-center p-4">
                                    <BookOpenIcon className="w-10 h-10 text-indigo-400 mb-3" />
                                    <h4 className="font-bold flex-grow text-sm md:text-base">{isBilingual ? book.punjabiSubject : book.subject}</h4>
                                    <Button 
                                        variant="secondary" 
                                        className="mt-3 w-full text-sm"
                                        onClick={() => window.open(book.url, '_blank')}
                                    >
                                        {isBilingual ? 'PDF ਡਾਊਨਲੋਡ ਕਰੋ' : 'Download PDF'}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">{isBilingual ? 'ਇਸ ਜਮਾਤ ਲਈ ਕੋਈ ਪਾਠ-ਪੁਸਤਕਾਂ ਨਹੀਂ ਮਿਲੀਆਂ।' : 'No textbooks found for this class.'}</p>
                    )
                )}
            </div>

            <div className="mt-12">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-indigo-300">{isBilingual ? 'ਵਧੀਕ ਸਿੱਖਣ ਸਰੋਤ' : 'Additional Learning Resources'}</h3>
                 <div className="space-y-4">
                    {isLoading ? <SkeletonCard count={2}/> : resources.map(resource => (
                        <Card key={resource.id}>
                            <h3 className="text-base md:text-lg font-bold">{resource.title}</h3>
                            <p className="text-slate-400 text-sm mt-1 mb-3">{resource.description}</p>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-semibold hover:underline text-sm md:text-base">
                                {isBilingual ? 'ਸਰੋਤ ਤੱਕ ਪਹੁੰਚ ਕਰੋ' : 'Access Resource'} &rarr;
                            </a>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Help View ---
const HelpView: React.FC<{isBilingual: boolean}> = ({ isBilingual }) => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getFaqsForRole(UserRole.Student).then(data => {
            setFaqs(data);
            setIsLoading(false);
        })
    }, []);

    return (
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-indigo-400">{isBilingual ? 'ਮਦਦ ਅਤੇ ਸਵਾਲ' : 'Help & FAQ'}</h2>
            <div className="space-y-4">
                {isLoading ? <SkeletonCard count={2} /> : faqs.map(faq => (
                    <Card key={faq.id}>
                        <h3 className="text-base md:text-lg font-bold">{faq.question}</h3>
                        <p className="text-slate-400 mt-2 text-sm md:text-base">{faq.answer}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}


export default StudentDashboard;