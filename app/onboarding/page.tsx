'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createLizard } from '@/lib/supabase/queries';

const LIZARD_APPEARANCES = [
  { id: 1, name: 'Green Guardian', color: 'bg-green-500', description: 'A vibrant green lizard with a brave spirit' },
  { id: 2, name: 'Blue Blaze', color: 'bg-blue-500', description: 'A cool blue lizard with swift movements' },
  { id: 3, name: 'Red Fury', color: 'bg-red-500', description: 'A fierce red lizard with fiery determination' },
  { id: 4, name: 'Purple Mystic', color: 'bg-purple-500', description: 'A mysterious purple lizard with hidden powers' },
  { id: 5, name: 'Orange Blitz', color: 'bg-orange-500', description: 'An energetic orange lizard always ready for action' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedAppearance, setSelectedAppearance] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleCreateLizard = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Get player ID
      const { data: playerData } = await supabase
        .from('players')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!playerData) {
        setError('Player not found');
        setLoading(false);
        return;
      }

      // Create lizard
      await createLizard(supabase, playerData.id, name, selectedAppearance);

      // Redirect to home
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create lizard');
      }
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-4 text-green-600">
            Welcome to Lizard Battler!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            You're about to embark on an amazing adventure! Let's create your lizard companion.
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">Your lizard can:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Train at different locations to gain permanent stat bonuses</li>
                <li>• Battle other players in automated combat</li>
                <li>• Level up using gold to become stronger</li>
                <li>• Earn passive gold even when you're offline!</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Remember to:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Feed, play, and let your lizard rest to keep it happy</li>
                <li>• Switch locations strategically to build your perfect stats</li>
                <li>• Collect passive gold when you return to the game</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Let's Create My Lizard!
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-2 text-green-600">
            Name Your Lizard
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Choose a unique name for your companion
          </p>

          <div className="mb-8">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Lizard Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter a cool name..."
              required
              minLength={1}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">1-20 characters</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!name.trim() || name.length > 20}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-2 text-green-600">
            Choose Your Lizard's Appearance
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Pick a color that represents your lizard's personality
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {LIZARD_APPEARANCES.map((appearance) => (
              <button
                key={appearance.id}
                onClick={() => setSelectedAppearance(appearance.id)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedAppearance === appearance.id
                    ? 'border-green-600 bg-green-50 scale-105'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className={`w-20 h-20 ${appearance.color} rounded-full mx-auto mb-3`} />
                <h3 className="font-bold text-lg text-center">{appearance.name}</h3>
                <p className="text-sm text-gray-600 text-center">{appearance.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreateLizard}
              disabled={loading}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create My Lizard!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
