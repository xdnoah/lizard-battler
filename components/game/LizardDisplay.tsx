import { Lizard, LizardLocation } from '@/lib/types/database';
import { getLocationEmoji, formatDuration, getHappinessBarColor } from '@/lib/utils/format';

interface LizardDisplayProps {
  lizard: Lizard;
  location: LizardLocation;
}

export default function LizardDisplay({ lizard, location }: LizardDisplayProps) {
  // Calculate time at current location
  const locationSince = new Date(location.location_since);
  const now = new Date();
  const hoursAtLocation = (now.getTime() - locationSince.getTime()) / (1000 * 60 * 60);

  // Get lizard color based on appearance_id
  const getAppearanceColor = (id: number) => {
    const colors = [
      'bg-green-500',
      'bg-blue-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-orange-500',
    ];
    return colors[id - 1] || 'bg-green-500';
  };

  // Get evolution stage based on level
  const getEvolutionStage = (level: number) => {
    if (level >= 100) return 'Ancient';
    if (level >= 75) return 'Veteran';
    if (level >= 50) return 'Adult';
    if (level >= 25) return 'Juvenile';
    return 'Baby';
  };

  // Get size based on evolution stage
  const getSize = (level: number) => {
    if (level >= 100) return 'w-48 h-48';
    if (level >= 75) return 'w-40 h-40';
    if (level >= 50) return 'w-36 h-36';
    if (level >= 25) return 'w-32 h-32';
    return 'w-28 h-28';
  };

  const locationEmoji = getLocationEmoji(location.current_location);
  const happinessBarColor = getHappinessBarColor(lizard.happiness);
  const appearanceColor = getAppearanceColor(lizard.appearance_id);
  const size = getSize(lizard.level);
  const evolutionStage = getEvolutionStage(lizard.level);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* Lizard sprite - placeholder for now */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {/* Main lizard body */}
          <div
            className={`${size} ${appearanceColor} rounded-full mx-auto relative overflow-hidden transition-all duration-300`}
            style={{
              opacity: lizard.happiness >= 70 ? 1 : lizard.happiness >= 30 ? 0.9 : 0.7,
            }}
          >
            {/* Simple eyes */}
            <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white rounded-full" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full" />

            {/* Location accessory indicator */}
            <div className="absolute bottom-2 right-2 text-2xl">
              {locationEmoji}
            </div>
          </div>

          {/* Evolution stage label */}
          <div className="text-center mt-2">
            <span className="text-sm font-semibold text-gray-600">{evolutionStage}</span>
          </div>
        </div>
      </div>

      {/* Location info */}
      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Currently at:</span>
          <span className="text-lg font-bold text-green-600">
            {locationEmoji} {location.current_location.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Time here:</span>
          <span className="font-semibold text-gray-800">
            {formatDuration(hoursAtLocation)}
          </span>
        </div>
      </div>

      {/* Happiness bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Happiness</span>
          <span className="text-sm font-bold text-gray-800">{lizard.happiness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`${happinessBarColor} h-full rounded-full transition-all duration-300`}
            style={{ width: `${lizard.happiness}%` }}
          />
        </div>
      </div>

      {/* Gold info */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Gold:</span>
          <span className="text-xl font-bold text-yellow-600">
            💰 {lizard.gold.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
