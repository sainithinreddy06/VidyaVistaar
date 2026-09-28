import type { User, UserRole, Stream, Subject, Doubt, Contest, StudentPerformance, Resource, FaqItem, Attendance, Quiz, CareerPath, MotivationalStory, Textbook } from '../types';
import { 
    STUDENTS, TEACHERS, ADMINS, SUBJECTS_DATA, DOUBTS_DATA, CONTESTS_DATA, 
    STUDENT_PERFORMANCE_DATA, RESOURCES_DATA, FAQ_DATA, ATTENDANCE_DATA, TEXTBOOKS_DATA
} from '../constants';

const FAKE_LATENCY = 500; // in milliseconds

// --- UTILITY ---
const simulateRequest = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(data))); // Deep copy to prevent mutation
        }, FAKE_LATENCY);
    });
};

// --- AUTH ---
export const login = (email: string, password: string, role: UserRole): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let userList: User[];
            if (role === 'student') userList = STUDENTS;
            else if (role === 'teacher') userList = TEACHERS;
            else userList = ADMINS;

            const user = userList.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (user && password === '123456') {
                resolve(user);
            } else {
                reject(new Error('Invalid credentials. (Hint: use password "123456")'));
            }
        }, FAKE_LATENCY);
    });
};

// --- STUDENT DATA ---
export const getSubjectsForStream = (stream: Stream): Promise<Subject[]> => {
    const data = SUBJECTS_DATA.filter(s => s.stream === stream);
    return simulateRequest(data);
}

export const getAllSubjects = (): Promise<Subject[]> => {
    return simulateRequest(SUBJECTS_DATA);
}

export const getDoubtsForStudent = (studentId: string): Promise<Doubt[]> => {
    const data = DOUBTS_DATA.filter(d => d.studentId === studentId);
    return simulateRequest(data);
}

export const postDoubt = (doubt: Omit<Doubt, 'id' | 'timestamp' | 'isResolved' | 'answer' | 'punjabiAnswer'>): Promise<Doubt> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newDoubt: Doubt = {
                ...doubt,
                id: `d${DOUBTS_DATA.length + 1}`,
                timestamp: new Date().toISOString(),
                isResolved: false,
            };
            DOUBTS_DATA.unshift(newDoubt); // Add to the beginning of the array so it appears on top
            resolve(newDoubt);
        }, FAKE_LATENCY);
    });
};

export const getStudentPerformance = (studentId: string): Promise<StudentPerformance | null> => {
    const data = STUDENT_PERFORMANCE_DATA.find(p => p.studentId === studentId) || null;
    return simulateRequest(data);
}

export const getTextbooks = (stream: Stream, aClass: number): Promise<Textbook[]> => {
    const data = TEXTBOOKS_DATA.filter(b => b.stream === stream && b.class === aClass);
    return simulateRequest(data);
};


// --- TEACHER DATA ---
export const getAllDoubts = (): Promise<Doubt[]> => {
    return simulateRequest(DOUBTS_DATA);
}

export const replyToDoubt = (doubtId: string, answer: string, punjabiAnswer: string): Promise<Doubt> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const doubtIndex = DOUBTS_DATA.findIndex(d => d.id === doubtId);
            if (doubtIndex !== -1) {
                const updatedDoubt = {
                    ...DOUBTS_DATA[doubtIndex],
                    answer: answer,
                    punjabiAnswer: punjabiAnswer,
                    isResolved: true,
                };
                DOUBTS_DATA[doubtIndex] = updatedDoubt;
                resolve(updatedDoubt);
            } else {
                reject(new Error('Doubt not found.'));
            }
        }, FAKE_LATENCY);
    });
};

export const updateTeacherNotes = (studentId: string, notes: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const studentIndex = STUDENTS.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
                const updatedStudent = { ...STUDENTS[studentIndex], teacherNotes: notes };
                STUDENTS[studentIndex] = updatedStudent;
                resolve(updatedStudent);
            } else {
                reject(new Error('Student not found.'));
            }
        }, FAKE_LATENCY);
    });
};

export const getAllStudentPerformance = (): Promise<StudentPerformance[]> => {
    return simulateRequest(STUDENT_PERFORMANCE_DATA);
}

export const getAttendance = (date: string): Promise<Attendance[]> => {
    // In a real app, you would query by date. Here we return all for demo.
    const data = ATTENDANCE_DATA.filter(a => a.date === date);
    return simulateRequest(data);
}


// --- SHARED DATA ---
export const getStudents = (): Promise<User[]> => {
    return simulateRequest(STUDENTS);
}

export const getContests = (): Promise<Contest[]> => {
    return simulateRequest(CONTESTS_DATA);
}

export const getResources = (): Promise<Resource[]> => {
    return simulateRequest(RESOURCES_DATA);
}

export const getFaqsForRole = (role: UserRole): Promise<FaqItem[]> => {
    const data = FAQ_DATA.filter(f => f.for.includes(role));
    return simulateRequest(data);
}