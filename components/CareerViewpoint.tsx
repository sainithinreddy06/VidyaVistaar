import React, { useState } from 'react';
import { Card, Button } from './SharedComponents';
import { CAREER_PATHS_DATA, MOTIVATIONAL_STORIES_DATA } from '../constants';
import type { CareerPath, RoadmapStep } from '../types';

interface CareerViewpointProps {
    isBilingual: boolean;
}

const CareerViewpoint: React.FC<CareerViewpointProps> = ({ isBilingual }) => {
    const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);

    if (selectedCareer) {
        return <CareerDetailView career={selectedCareer} isBilingual={isBilingual} onBack={() => setSelectedCareer(null)} />;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2 text-indigo-400">{isBilingual ? 'ਕਰੀਅਰ ਦੀ ਚੋਣ' : 'Choose Your Career Path'}</h2>
            <p className="text-slate-400 mb-8">{isBilingual ? 'ਆਪਣੇ ਭਵਿੱਖ ਦੇ ਕਰੀਅਰ ਦੇ ਮੌਕਿਆਂ ਦੀ ਪੜਚੋਲ ਕਰੋ।' : 'Explore opportunities for your future career.'}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CAREER_PATHS_DATA.map(path => (
                    <Card key={path.id} className="flex flex-col items-center text-center hover:bg-slate-700/50 hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-indigo-600/20 p-4 rounded-full mb-4">
                            <path.icon className="h-10 w-10 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{isBilingual ? path.punjabiName : path.name}</h3>
                        <p className="text-slate-400 text-sm mb-4 flex-grow">{isBilingual ? path.punjabiDescription.substring(0, 100) + '...' : path.description.substring(0, 100) + '...'}</p>
                        <Button onClick={() => setSelectedCareer(path)} className="w-full sm:w-auto">{isBilingual ? 'ਹੋਰ ਜਾਣੋ' : 'Learn More'}</Button>
                    </Card>
                ))}
            </div>

            <MotivationalStories isBilingual={isBilingual} />
        </div>
    );
};

const CareerDetailView: React.FC<{ career: CareerPath, isBilingual: boolean, onBack: () => void }> = ({ career, isBilingual, onBack }) => (
    <div>
        <Button onClick={onBack} variant="secondary" className="mb-6">&larr; {isBilingual ? 'ਵਾਪਸ ਜਾਓ' : 'Back to Careers'}</Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-indigo-600/20 p-3 rounded-lg">
                            <career.icon className="h-8 w-8 text-indigo-300" />
                        </div>
                        <h2 className="text-3xl font-bold text-indigo-400">{isBilingual ? career.punjabiName : career.name}</h2>
                    </div>
                    <p className="text-slate-300 mb-8">{isBilingual ? career.punjabiDescription : career.description}</p>

                    <h3 className="text-2xl font-bold mb-4 text-indigo-300">{isBilingual ? 'ਕਰੀਅਰ ਰੋਡਮੈਪ' : 'Career Roadmap'}</h3>
                    <Roadmap roadmap={career.roadmap} isBilingual={isBilingual} />
                </Card>

                <Card>
                     <h3 className="text-2xl font-bold mb-4 text-indigo-300">{isBilingual ? 'ਮਾਪਿਆਂ ਲਈ ਜਾਣਕਾਰੀ' : 'For Parents'}</h3>
                     <p className="text-slate-400">{isBilingual ? career.punjabiParentInfo : career.parentInfo}</p>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
                <Card>
                    <h3 className="text-xl font-bold mb-4">{isBilingual ? 'ਸਰੋਤ' : 'Resources'}</h3>
                    <ul className="space-y-3">
                        {career.resources.map(res => (
                            <li key={res.id}>
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                                    <p className="font-semibold text-indigo-400">{res.title}</p>
                                    <p className="text-xs text-slate-400">{res.description}</p>
                                </a>
                            </li>
                        ))}
                    </ul>
                </Card>
                 <Card>
                    <h3 className="text-xl font-bold mb-4">{isBilingual ? 'ਮਜ਼ੇਦਾਰ ਕੰਮ' : 'Fun Tasks'}</h3>
                    <ul className="space-y-3">
                       {career.tasks.map((task, index) => (
                           <li key={index} className="p-3 bg-slate-700/50 rounded-lg">
                               <p className="font-semibold">{isBilingual ? task.punjabiTitle : task.title}</p>
                               <p className="text-xs text-slate-400 mt-1">{isBilingual ? task.punjabiDescription : task.description}</p>
                           </li>
                       ))}
                    </ul>
                </Card>
            </div>
        </div>
    </div>
);

const Roadmap: React.FC<{ roadmap: RoadmapStep[], isBilingual: boolean }> = ({ roadmap, isBilingual }) => (
    <div className="relative pl-8">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>
        {roadmap.map((step, index) => (
            <div key={index} className="relative mb-8 last:mb-0">
                <div className="absolute -left-8 top-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-slate-800">
                    <step.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-lg text-slate-200">{isBilingual ? step.punjabiTitle : step.title}</h4>
                <p className="text-slate-400 text-sm">{isBilingual ? step.punjabiDescription : step.description}</p>
            </div>
        ))}
    </div>
);

const MotivationalStories: React.FC<{ isBilingual: boolean }> = ({ isBilingual }) => (
    <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">{isBilingual ? 'ਪ੍ਰੇਰਣਾਦਾਇਕ ਕਹਾਣੀਆਂ' : 'Motivational Stories'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOTIVATIONAL_STORIES_DATA.map(story => (
                <Card key={story.id} className="flex flex-col sm:flex-row items-center gap-6">
                    <img src={story.imageUrl} alt={story.name} className="w-24 h-24 rounded-full shrink-0 border-4 border-indigo-500 object-cover" />
                    <div>
                        <h3 className="text-xl font-bold">{isBilingual ? story.punjabiName : story.name}</h3>
                        <p className="text-slate-400 text-sm mt-2">{isBilingual ? story.punjabiStory : story.story}</p>
                    </div>
                </Card>
            ))}
        </div>
    </div>
);

export default CareerViewpoint;