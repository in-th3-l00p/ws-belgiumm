import { useState, useEffect } from 'react';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import { Shuffle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Competitor {
  id: string;
  firstName: string;
  lastName: string;
  language: string;
  country: string;
  competitorNumber?: number;
}

export default function Randomizer() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'competitors'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Competitor[];
      setCompetitors(data);
      
      // Check if numbers are already assigned
      const hasNumbers = data.some((c) => c.competitorNumber !== undefined);
      setIsLocked(hasNumbers);
    });

    return () => unsubscribe();
  }, []);

  const randomizeNumbers = async () => {
    if (isLocked) {
      const confirm = window.confirm(
        'Numbers have already been assigned. Do you want to reassign them?'
      );
      if (!confirm) return;
    }

    setIsRandomizing(true);
    try {
      // Create array of numbers from 1 to n
      const numbers = Array.from(
        { length: competitors.length },
        (_, index) => index + 1
      );

      // Shuffle array using Fisher-Yates algorithm
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }

      // Assign numbers to competitors
      const updates = competitors.map((competitor, index) =>
        updateDoc(doc(db, 'competitors', competitor.id), {
          competitorNumber: numbers[index],
        })
      );

      await Promise.all(updates);
      toast.success('Competition numbers assigned successfully');
      setIsLocked(true);
    } catch (error) {
      toast.error('Failed to assign competition numbers');
    } finally {
      setIsRandomizing(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Competition Number Randomizer
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Randomly assign competition numbers to participants
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={randomizeNumbers}
              disabled={isRandomizing}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              {isRandomizing ? 'Assigning...' : 'Randomize Numbers'}
            </button>
          </div>
        </div>

        {isLocked && (
          <div className="mt-4 rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Numbers Already Assigned
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Competition numbers have been assigned. You can still reassign them
                  if needed, but this might affect other parts of the competition.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Competition Number
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Competitor Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Language
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {[...competitors]
                      .sort((a, b) => {
                        const aNum = a.competitorNumber || Infinity;
                        const bNum = b.competitorNumber || Infinity;
                        return aNum - bNum;
                      })
                      .map((competitor) => (
                        <tr key={competitor.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {competitor.competitorNumber ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                #{competitor.competitorNumber}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {competitor.firstName} {competitor.lastName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                            {competitor.language}
                          </td>
                        </tr>
                      ))}
                    {competitors.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-4 text-sm text-gray-500 text-center"
                        >
                          No competitors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}