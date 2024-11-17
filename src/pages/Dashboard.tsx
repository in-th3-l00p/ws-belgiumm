import { Link } from 'react-router-dom';
import { Users, Calendar, Shuffle } from 'lucide-react';
import Layout from '../components/Layout';

export default function Dashboard() {
  const cards = [
    {
      title: 'Competitors Management',
      description: 'Manage competitors, their languages, and countries',
      icon: Users,
      href: '/competitors',
      color: 'bg-blue-500',
    },
    {
      title: 'Competition Planning',
      description: 'Manage internet sessions for each module',
      icon: Calendar,
      href: '/planning',
      color: 'bg-green-500',
    },
    {
      title: 'Number Randomizer',
      description: 'Assign random numbers to competitors',
      icon: Shuffle,
      href: '/randomizer',
      color: 'bg-purple-500',
    },
  ];

  return (
    <Layout>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to WorldSkills Belgium</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your competition efficiently with our comprehensive tools
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.href}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className={`${card.color} p-2 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{card.title}</p>
                <p className="text-sm text-gray-500 truncate">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}