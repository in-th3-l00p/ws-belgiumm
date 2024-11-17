import { useState, useEffect } from 'react';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import { Play, Pause, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Competitor {
  id: string;
  firstName: string;
  lastName: string;
  competitorNumber?: number;
}

interface Session {
  id: string;
  competitorId: string;
  day: number;
  module: 'morning' | 'evening';
  startTime?: number;
  endTime?: number;
  totalTime?: number;
}

export default function Planning() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeCompetitors = onSnapshot(
      collection(db, 'competitors'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Competitor[];
        setCompetitors(data);
      }
    );

    const unsubscribeSessions = onSnapshot(
      collection(db, 'sessions'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Session[];
        setSessions(data);
      }
    );

    return () => {
      unsubscribeCompetitors();
      unsubscribeSessions();
    };
  }, []);

  const startSession = async (competitorId: string, day: number, module: 'morning' | 'evening') => {
    const existingSession = sessions.find(
      (s) => s.competitorId === competitorId && s.day === day && s.module === module
    );

    if (existingSession?.totalTime && existingSession.totalTime >= 600) {
      toast.error('Maximum session time (10 minutes) reached');
      return;
    }

    if (activeTimer) {
      toast.error('Another session is already active');
      return;
    }

    try {
      if (existingSession) {
        await updateDoc(doc(db, 'sessions', existingSession.id), {
          startTime: Date.now(),
        });
      }
      setActiveTimer(`${competitorId}-${day}-${module}`);
    } catch (error) {
      toast.error('Failed to start session');
    }
  };

  const stopSession = async (competitorId: string, day: number, module: 'morning' | 'evening') => {
    const session = sessions.find(
      (s) => s.competitorId === competitorId && s.day === day && s.module === module
    );

    if (!session) return;

    const endTime = Date.now();
    const sessionTime = session.startTime ? Math.floor((endTime - session.startTime) / 1000) : 0;
    const totalTime = (session.totalTime || 0) + sessionTime;

    try {
      await updateDoc(doc(db, 'sessions', session.id), {
        endTime,
        totalTime,
        startTime: null,
      });
      setActiveTimer(null);
    } catch (error) {
      toast.error('Failed to stop session');
    }
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTable = (day: number, module: 'morning' | 'evening') => (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {module === 'morning' ? 'Morning' : 'Evening'} Module
      </h3>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Competitor
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Time Used
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {competitors.map((competitor) => {
              const session = sessions.find(
                (s) => s.competitorId === competitor.id && s.day === day && s.module === module
              );
              const isActive = activeTimer === `${competitor.id}-${day}-${module}`;
              const totalTime = session?.totalTime || 0;
              const isMaxed = totalTime >= 600;

              return (
                <tr key={competitor.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {competitor.competitorNumber && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                        #{competitor.competitorNumber}
                      </span>
                    )}
                    {competitor.firstName} {competitor.lastName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {formatTime(session?.totalTime)}
                      {isMaxed && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Max reached
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {!isActive ? (
                      <button
                        onClick={() => startSession(competitor.id, day, module)}
                        disabled={isMaxed}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </button>
                    ) : (
                      <button
                        onClick={() => stopSession(competitor.id, day, module)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Stop
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Competition Planning</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage internet sessions for competitors during each module
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              {[1, 2, 3].map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              {[1, 2, 3].map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveTab(day)}
                  className={`${
                    activeTab === day
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  } px-3 py-2 font-medium text-sm rounded-md`}
                >
                  Day {day}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8 space-y-8">
            {renderTable(activeTab, 'morning')}
            {renderTable(activeTab, 'evening')}
          </div>
        </div>
      </div>
    </Layout>
  );
}