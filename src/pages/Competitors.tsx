import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import { countries } from 'countries-list';
import toast from 'react-hot-toast';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';

interface Competitor {
  id: string;
  firstName: string;
  lastName: string;
  language: 'english' | 'french';
  country: string;
}

export default function Competitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    language: 'english',
    country: '',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'competitors'), (snapshot) => {
      const competitorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Competitor[];
      setCompetitors(competitorsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompetitor) {
        await updateDoc(doc(db, 'competitors', editingCompetitor.id), formData);
        toast.success('Competitor updated successfully');
      } else {
        await addDoc(collection(db, 'competitors'), formData);
        toast.success('Competitor added successfully');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this competitor?')) {
      try {
        await deleteDoc(doc(db, 'competitors', id));
        toast.success('Competitor deleted successfully');
      } catch (error) {
        toast.error('An error occurred');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      language: 'english',
      country: '',
    });
    setEditingCompetitor(null);
  };

  const openEditModal = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormData({
      firstName: competitor.firstName,
      lastName: competitor.lastName,
      language: competitor.language,
      country: competitor.country,
    });
    setIsModalOpen(true);
  };

  const countryOptions = Object.entries(countries).map(([code, country]) => ({
    value: code,
    label: country.name,
  }));

  const englishCompetitors = competitors.filter((c) => c.language === 'english');
  const frenchCompetitors = competitors.filter((c) => c.language === 'french');

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Competitors Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage competitors participating in the WorldSkills competition
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Competitor
            </button>
          </div>
        </div>

        {/* English Competitors Table */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">English Speaking Competitors</h2>
          <CompetitorsTable
            competitors={englishCompetitors}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>

        {/* French Competitors Table */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">French Speaking Competitors</h2>
          <CompetitorsTable
            competitors={frenchCompetitors}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-medium mb-4">
                {editingCompetitor ? 'Edit Competitor' : 'Add New Competitor'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as 'english' | 'french' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="english">English</option>
                    <option value="french">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a country</option>
                    {countryOptions.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingCompetitor ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function CompetitorsTable({
  competitors,
  onEdit,
  onDelete,
}: {
  competitors: Competitor[];
  onEdit: (competitor: Competitor) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-4 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Country</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {competitors.map((competitor) => (
                  <tr key={competitor.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {competitor.firstName} {competitor.lastName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {countries[competitor.country as keyof typeof countries]?.name}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => onEdit(competitor)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(competitor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {competitors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-sm text-gray-500 text-center">
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
  );
}