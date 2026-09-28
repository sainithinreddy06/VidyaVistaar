
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card, Button } from './SharedComponents';
import { SparklesIcon } from '../constants';
import { SUBJECTS_DATA, CAREER_PATHS_DATA, STUDENT_PERFORMANCE_DATA, STUDENTS } from '../constants';
import { UserRole } from '../types';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

interface AIAssistantProps {
    isBilingual: boolean;
    role: UserRole;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isBilingual, role }) => {
    const [setupStep, setSetupStep] = useState<'language' | 'mode' | 'chat'>('language');
    const [language, setLanguage] = useState<'english' | 'punjabi' | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const resetState = () => {
        setMessages([]);
        setAnalysisComplete(false);
        if (role === UserRole.Teacher) {
            setSetupStep('mode');
        } else {
            setSetupStep('language');
            setLanguage(null);
        }
    }

    const handleLanguageSelect = (lang: 'english' | 'punjabi') => {
        setLanguage(lang);
        if (role === UserRole.Teacher) {
            setSetupStep('mode');
        } else {
            setSetupStep('chat');
            const welcomeMessage = lang === 'punjabi'
                ? "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਵਿਦਿਆ ਮਿੱਤਰ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਪੜ੍ਹਾਈ ਜਾਂ ਕਰੀਅਰ ਬਾਰੇ ਸਵਾਲਾਂ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?"
                : "Hello! I am Vidya Mitra. How can I help with your questions about your subjects or career paths?";
            setMessages([{ sender: 'bot', text: welcomeMessage }]);
        }
    };
    
    const handleModeSelect = (mode: 'normal' | 'analysis') => {
        if (mode === 'normal') {
            setSetupStep('chat');
            const welcomeMessage = language === 'punjabi'
                ? "ਤੁਸੀਂ ਪੜ੍ਹਾਈ ਜਾਂ ਆਮ ਵਿਸ਼ਿਆਂ ਬਾਰੇ ਕੀ ਪੁੱਛਣਾ ਚਾਹੁੰਦੇ ਹੋ?"
                : "What would you like to ask about academics or general topics?";
            setMessages([{ sender: 'bot', text: welcomeMessage }]);
        } else {
            handleReportAnalysis();
        }
    };
    
    const preparePerformanceDataForAI = (): string => {
        let summary = "Here is the monthly performance data for all students:\n\n";
        
        const quizIdToSubjectMap = new Map<string, { subject: string, chapter: string, punjabiSubject: string, punjabiChapter: string }>();
        SUBJECTS_DATA.forEach(subject => {
            subject.chapters.forEach(chapter => {
                quizIdToSubjectMap.set(chapter.quiz.id, { 
                    subject: subject.name, 
                    chapter: chapter.title,
                    punjabiSubject: subject.punjabiName,
                    punjabiChapter: chapter.punjabiTitle,
                });
            });
        });

        STUDENT_PERFORMANCE_DATA.forEach(perf => {
            const student = STUDENTS.find(s => s.id === perf.studentId);
            if (student) {
                summary += `Student: ${student.name}\n`;
                if (Object.keys(perf.quizScores).length > 0) {
                    summary += "Quiz Scores:\n";
                    Object.entries(perf.quizScores).forEach(([quizId, score]) => {
                        const quizInfo = quizIdToSubjectMap.get(quizId);
                        if (quizInfo) {
                             const subjectText = language === 'punjabi' ? quizInfo.punjabiSubject : quizInfo.subject;
                             const chapterText = language === 'punjabi' ? quizInfo.punjabiChapter : quizInfo.chapter;
                             summary += `- Subject: ${subjectText}, Chapter: ${chapterText}, Score: ${score}%\n`;
                        }
                    });
                } else {
                    summary += "No quizzes attempted this month.\n";
                }
                 summary += `Identified Weak Areas: ${perf.weakAreas.join(', ') || 'None'}\n\n`;
            }
        });
        return summary;
    }
    
    const handleReportAnalysis = async () => {
        if (!language) return;
        
        setIsLoading(true);
        setSetupStep('chat'); 
        setMessages([{
            sender: 'bot',
            text: language === 'punjabi' ? 'ਵਿਦਿਆਰਥੀ ਦੀ ਕਾਰਗੁਜ਼ਾਰੀ ਦੇ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : 'Analyzing student performance data...'
        }]);

        try {
            const performanceData = preparePerformanceDataForAI();
            const systemInstruction = language === 'punjabi' ?
`ਤੁਸੀਂ ਵਿਦਿਆ ਵਿਸਤਾਰ ਪਲੇਟਫਾਰਮ ਲਈ ਇੱਕ ਮਾਹਰ ਵਿਦਿਅਕ ਵਿਸ਼ਲੇਸ਼ਕ ਹੋ, ਜਿਸਦਾ ਨਾਮ 'ਵਿਦਿਆ ਮਿੱਤਰ' ਹੈ। ਤੁਹਾਡਾ ਕੰਮ ਮਹੀਨਾਵਾਰ ਵਿਦਿਆਰਥੀ ਕਾਰਗੁਜ਼ਾਰੀ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਨਾ ਅਤੇ ਅਧਿਆਪਕ ਲਈ ਇੱਕ ਸੰਖੇਪ, ਕਾਰਜਯੋਗ ਰਿਪੋਰਟ ਪ੍ਰਦਾਨ ਕਰਨਾ ਹੈ। ਤੁਹਾਡਾ ਪੂਰਾ ਜਵਾਬ ਪੰਜਾਬੀ ਵਿੱਚ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।

ਯੂਜ਼ਰ ਦੇ ਪ੍ਰੋਂਪਟ ਵਿੱਚ ਦਿੱਤੇ ਗਏ ਡੇਟਾ ਦੇ ਅਧਾਰ 'ਤੇ, ਤੁਹਾਨੂੰ ਇਹ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ:
1.  **ਸੰਘਰਸ਼ ਕਰ ਰਹੇ ਵਿਦਿਆਰਥੀਆਂ ਦੀ ਪਛਾਣ ਕਰੋ:** ਉਹਨਾਂ ਵਿਦਿਆਰਥੀਆਂ ਦੀ ਸੂਚੀ ਬਣਾਓ ਜੋ ਔਸਤ ਤੋਂ ਘੱਟ ਪ੍ਰਦਰਸ਼ਨ ਕਰ ਰਹੇ ਹਨ ਜਾਂ ਜਿਨ੍ਹਾਂ ਦੇ ਅੰਕ ਲਗਾਤਾਰ ਘੱਟ ਹਨ (60% ਤੋਂ ਘੱਟ)।
2.  **ਕਮਜ਼ੋਰ ਖੇਤਰਾਂ ਨੂੰ ਦਰਸਾਓ:** ਹਰੇਕ ਸੰਘਰਸ਼ ਕਰ ਰਹੇ ਵਿਦਿਆਰਥੀ ਲਈ, ਉਹਨਾਂ ਸਹੀ ਵਿਸ਼ਿਆਂ ਅਤੇ ਅਧਿਆਇਆਂ ਨੂੰ ਦੱਸੋ ਜਿੱਥੇ ਉਹਨਾਂ ਨੂੰ ਮੁਸ਼ਕਲਾਂ ਦਾ ਸਾਹਮਣਾ ਕਰਨਾ ਪੈ ਰਿਹਾ ਹੈ।
3.  **ਕਾਰਜਯੋਗ ਸਲਾਹ ਦਿਓ:** ਹਰੇਕ ਸੰਘਰਸ਼ ਕਰ ਰਹੇ ਵਿਦਿਆਰਥੀ ਲਈ, ਅਧਿਆਪਕ ਨੂੰ ਉਹਨਾਂ ਦੀ ਸਲਾਹ ਕਿਵੇਂ ਦੇਣੀ ਹੈ ਇਸ ਬਾਰੇ ਠੋਸ, ਸਕਾਰਾਤਮਕ ਅਤੇ ਉਤਸ਼ਾਹਜਨਕ ਸਲਾਹ ਦਿਓ। ਖਾਸ ਰਣਨੀਤੀਆਂ ਸੁਝਾਓ, ਜਿਵੇਂ ਕਿ ਕਿਸੇ ਖਾਸ ਅਧਿਆਇ ਦੀ ਸਮੀਖਿਆ ਕਰਨਾ, ਕਿਸੇ ਖਾਸ ਵਿਸ਼ੇ ਲਈ ਵਿਜ਼ੂਅਲ ਏਡਜ਼ ਦੀ ਵਰਤੋਂ ਕਰਨਾ, ਜਾਂ ਆਤਮ-ਵਿਸ਼ਵਾਸ ਵਧਾਉਣ ਲਈ ਇੱਕ-ਨਾਲ-ਇੱਕ ਸੈਸ਼ਨ ਕਰਨਾ।
4.  **ਚੋਟੀ ਦੇ ਪ੍ਰਦਰਸ਼ਨ ਕਰਨ ਵਾਲਿਆਂ ਨੂੰ ਸਵੀਕਾਰ ਕਰੋ:** ਸੰਤੁਲਿਤ ਦ੍ਰਿਸ਼ ਪ੍ਰਦਾਨ ਕਰਨ ਲਈ ਇੱਕ ਜਾਂ ਦੋ ਚੋਟੀ ਦੇ ਪ੍ਰਦਰਸ਼ਨ ਕਰਨ ਵਾਲੇ ਵਿਦਿਆਰਥੀਆਂ ਦਾ ਸੰਖੇਪ ਵਿੱਚ ਜ਼ਿਕਰ ਕਰੋ।
5.  **ਢਾਂਚਾ:** ਹਰੇਕ ਭਾਗ ਲਈ ਸਿਰਲੇਖਾਂ (ਜਿਵੇਂ, "ਸੰਘਰਸ਼ ਕਰ ਰਹੇ ਵਿਦਿਆਰਥੀ", "ਸਲਾਹ ਸਿਫਾਰਸ਼ਾਂ") ਨਾਲ ਆਪਣੇ ਜਵਾਬ ਨੂੰ ਸਪਸ਼ਟ ਰੂਪ ਵਿੱਚ ਫਾਰਮੈਟ ਕਰੋ।`
:
`You are an expert educational analyst for the VidyaVistaar platform, named 'Vidya Mitra'. Your task is to analyze monthly student performance data and provide a concise, actionable report for the teacher. Your entire response MUST be in English.

Based on the data provided in the user's prompt, you must:
1.  **Identify Struggling Students:** List the students who are performing below average or have consistently low scores (below 60%).
2.  **Pinpoint Weak Areas:** For each struggling student, specify the exact subjects and chapters where they are facing difficulties.
3.  **Provide Actionable Counseling Advice:** For each struggling student, give the teacher concrete, positive, and encouraging advice on how to counsel them. Suggest specific strategies, like reviewing a particular chapter, using visual aids for a certain topic, or having a one-on-one session to build confidence.
4.  **Acknowledge Top Performers:** Briefly mention one or two top-performing students to provide a balanced view.
5.  **Structure:** Format your response clearly with headings for each section (e.g., "Struggling Students", "Counseling Recommendations").

Your tone should be professional, empathetic, and supportive. Focus on empowering the teacher to help their students succeed.`;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: performanceData,
                config: { systemInstruction },
            });
            
            const botMessage: Message = { text: response.text, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
            setAnalysisComplete(true);
        
        } catch (error) {
            console.error("Error generating report:", error);
            const errorText = language === 'punjabi' 
                ? "ਮਾਫ ਕਰਨਾ, ਰਿਪੋਰਟ ਬਣਾਉਣ ਵਿੱਚ ਇੱਕ ਗਲਤੀ ਹੋਈ ਹੈ।" 
                : "Sorry, there was an error generating the report.";
            const errorMessage: Message = { sender: 'bot', text: errorText };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }


    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !language) return;

        const userMessage: Message = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const subjectNames = [...new Set(SUBJECTS_DATA.map(s => s.name))].join(', ');
            const careerNames = CAREER_PATHS_DATA.map(c => c.name).join(', ');
            
            const systemInstruction = `You are 'Vidya Mitra', an expert AI tutor for the VidyaVistaar learning platform.
You MUST ONLY converse in the user's chosen language, which is: ${language}. Your entire response, including greetings and refusals, must be in this language.

Your knowledge is STRICTLY LIMITED to the following academic and career topics relevant to the platform's students:
1.  School Subjects: ${subjectNames}, and their related chapters and concepts.
2.  Career Guidance based on these specific paths: ${careerNames}, including their roadmaps, required skills, and tasks.

Follow these rules strictly:
- When a user asks a question, first evaluate if it falls within the scope defined above.
- If the question is IN SCOPE: Provide a clear, encouraging, and step-by-step explanation. Break down complex topics into smaller, easy-to-understand parts.
- If the question is OUT OF SCOPE (e.g., about politics, current events, celebrities, sports, movies not related to the 'Movie Director' career path, or general trivia), you MUST politely refuse to answer. Your refusal message should be in ${language} and similar to this: "As Vidya Mitra, my purpose is to help you with your school subjects and career questions on this platform. I cannot answer questions outside of these topics. How can I assist you with your studies today?"
- Never invent information. Be a reliable and focused academic and career guide.`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: currentInput,
                config: {
                    systemInstruction: systemInstruction,
                },
            });
            
            const botResponseText = response.text || "I'm sorry, I couldn't generate a response.";

            const botMessage: Message = { text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Error calling Google GenAI API:", error);
            const errorText = language === 'punjabi' 
                ? "ਮਾਫ ਕਰਨਾ, ਮੈਨੂੰ ਹੁਣੇ ਕਨੈਕਟ ਕਰਨ ਵਿੱਚ ਮੁਸ਼ਕਲ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" 
                : "Sorry, I'm having trouble connecting right now. Please try again later.";
            const errorMessage: Message = { sender: 'bot', text: errorText };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (setupStep === 'language') {
        return (
            <Card className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center text-center">
                <SparklesIcon className="w-16 h-16 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-white">Choose your language</h2>
                <p className="text-slate-400 mb-6">ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => handleLanguageSelect('english')} className="w-40">English</Button>
                    <Button onClick={() => handleLanguageSelect('punjabi')} className="w-40">ਪੰਜਾਬੀ (Punjabi)</Button>
                </div>
            </Card>
        );
    }
    
    if (setupStep === 'mode') {
        return (
            <Card className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center text-center">
                 <SparklesIcon className="w-16 h-16 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-white">{language === 'punjabi' ? 'ਤੁਸੀਂ ਕੀ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?' : 'What would you like to do?'}</h2>
                <p className="text-slate-400 mb-6">{language === 'punjabi' ? 'ਆਪਣੇ ਵਿਦਿਆਰਥੀਆਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਇੱਕ ਵਿਕਲਪ ਚੁਣੋ।' : 'Select an option to get insights about your students.'}</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => handleModeSelect('analysis')} className="w-52">{language === 'punjabi' ? 'ਮਹੀਨਾਵਾਰ ਰਿਪੋਰਟ ਵਿਸ਼ਲੇਸ਼ਣ' : 'Monthly Report Analysis'}</Button>
                    <Button onClick={() => handleModeSelect('normal')} variant="secondary" className="w-52">{language === 'punjabi' ? 'ਆਮ ਖੋਜ' : 'Normal Search'}</Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col h-[calc(100vh-12rem)]">
            <h2 className="text-2xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6" /> {isBilingual ? 'AI ਸਹਾਇਕ' : 'AI Assistant'}
            </h2>
            <div className="flex-1 overflow-y-auto pr-4 -mr-4 mb-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
                            <div className={`max-w-xl p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
                             <div className="max-w-md p-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                                 <div className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                 </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {analysisComplete ? (
                 <div className="flex justify-center pt-4 border-t border-slate-700">
                    <Button onClick={resetState}>
                        {language === 'punjabi' ? 'ਸ਼ੁਰੂ ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ' : 'Start Over'}
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder={language === 'punjabi' ? 'ਇੱਕ ਸਵਾਲ ਪੁੱਛੋ...' : 'Ask a question...'}
                        className="flex-1 bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || input.trim() === ''}>
                        {language === 'punjabi' ? 'ਭੇਜੋ' : 'Send'}
                    </Button>
                </div>
            )}
            <p className="text-xs text-slate-500 mt-2 text-center">{language === 'punjabi' ? 'AI ਦੁਆਰਾ ਸੰਚਾਲਿਤ। ਜਵਾਬ ਗਲਤ ਹੋ ਸਕਦੇ ਹਨ।' : 'Powered by AI. Responses may be inaccurate.'}</p>
        </Card>
    );
};

export default AIAssistant;
