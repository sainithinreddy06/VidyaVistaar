
export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Admin = 'admin',
}

export enum Stream {
  NCERT = 'ncert',
  PSEB = 'pseb',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture: string;
  // Student-specific fields
  parentName?: string;
  parentPhone?: string;
  teacherNotes?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'fill-in-the-blank' | 'short-answer';
  options?: string[]; // For MCQ
  correctAnswer: number | string; // Index for MCQ, string for others
}

export interface Quiz {
  id:string;
  title: string;
  punjabiTitle: string;
  questions: Question[];
}

export interface Chapter {
  id: string;
  title: string;
  punjabiTitle: string;
  videoUrl: string;
  pdfUrl: string;
  quiz: Quiz;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  punjabiName: string;
  icon: React.ComponentType<{ className?: string }>;
  chapters: Chapter[];
  stream: Stream;
}

export interface Doubt {
  id: string;
  studentId: string;
  subject: string;
  punjabiSubject: string;
  chapter: string;
  punjabiChapter: string;
  question: string;
  punjabiQuestion: string;
  isResolved: boolean;
  answer?: string;
  punjabiAnswer?: string;
  timestamp: string;
}

export interface Contest {
  id: string;
  subject: string;
  title: string;
  questions: Question[];
  durationMinutes: number;
  leaderboard: { studentId: string; score: number }[];
}

export interface StudentPerformance {
    studentId: string;
    quizScores: { [quizId: string]: number }; // quizId -> score
    videoViews: { [chapterId: string]: boolean };
    quizAttempts: { [quizId: string]: boolean };
    weakAreas: string[];
}

export interface Resource {
    id: string;
    title: string;
    type: 'pdf' | 'video' | 'link';
    url: string;
    description: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    for: UserRole[];
}

export interface Attendance {
    studentId: string;
    date: string; // YYYY-MM-DD
    status: 'present' | 'absent' | 'late';
}

export interface Textbook {
    id: string;
    class: number;
    subject: string;
    punjabiSubject: string;
    stream: Stream;
    url: string;
}

// Types for Career Viewpoint
export interface RoadmapStep {
    title: string;
    punjabiTitle: string;
    description: string;
    punjabiDescription: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface CareerTask {
    title: string;
    punjabiTitle: string;
    description: string;
    punjabiDescription: string;
    skill: string;
}

export interface CareerPath {
    id: string;
    name: string;
    punjabiName: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    punjabiDescription: string;
    parentInfo: string;
    punjabiParentInfo: string;
    roadmap: RoadmapStep[];
    resources: Resource[];
    tasks: CareerTask[];
}

export interface MotivationalStory {
    id: string;
    name: string;
    punjabiName: string;
    imageUrl: string;
    story: string;
    punjabiStory: string;
}