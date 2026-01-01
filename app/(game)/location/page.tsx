import { createClient } from '@/lib/supabase/server';
import { getMyLizard, getLizardLocation, getAllLocations } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import LocationCard from '@/components/game/LocationCard';

export default async function LocationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get player
  const { data: playerData } = await supabase
    .from('players')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!playerData) {
    redirect('/auth/login');
  }

  // Get lizard
  const lizard = await getMyLizard(supabase, playerData.id);

  if (!lizard) {
    redirect('/onboarding');
  }

  // Get location data
  const lizardLocation = await getLizardLocation(supabase, lizard.id);
  const allLocations = await getAllLocations(supabase);

  // Calculate current time at location
  const locationSince = new Date(lizardLocation.location_since);
  const now = new Date();
  const hoursAtCurrentLocation = (now.getTime() - locationSince.getTime()) / (1000 * 60 * 60);
  const fullHours = Math.floor(hoursAtCurrentLocation);
  const partialHours = hoursAtCurrentLocation - fullHours;

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Training Locations</h1>
        <p className="text-gray-600">Choose where your lizard trains to gain permanent stat bonuses</p>
      </div>

      {/* Current location info */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Currently At:</h2>
          <span className="text-xl font-bold text-green-600">
            {lizardLocation.current_location.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Time here:</span>
            <span className="font-semibold">
              {fullHours}h {Math.floor(partialHours * 60)}m
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Full hours counted:</span>
            <span className="font-semibold text-green-600">{fullHours}h</span>
          </div>
          {partialHours > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
              <span className="text-xs text-yellow-700">
                ⚠️ Switching now will lose {Math.floor(partialHours * 60)} minutes of progress!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* All locations */}
      <div className="space-y-3 mb-6">
        {allLocations.map((location) => {
          // Get hours spent at this location
          const hoursKey = `${location.location_name}_hours` as keyof typeof lizardLocation;
          const hoursSpent = lizardLocation[hoursKey] as number || 0;

          return (
            <LocationCard
              key={location.location_name}
              location={location}
              hoursSpent={hoursSpent}
              isCurrentLocation={lizardLocation.current_location === location.location_name}
              lizardId={lizard.id}
            />
          );
        })}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How Location Training Works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Bonuses accumulate every hour (even when offline)</li>
          <li>• Only FULL hours count - partial hours are lost when switching</li>
          <li>• Bonuses are PERMANENT and stack indefinitely</li>
          <li>• You can battle and care for your lizard from any location</li>
        </ul>
      </div>
    </div>
  );
}
