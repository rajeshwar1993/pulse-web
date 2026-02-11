'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const AVATAR_SEEDS = [
  'felix', 'aneka', 'sam', 'charlie', 'alex',
  'jordan', 'taylor', 'morgan', 'casey', 'riley',
  'avery', 'quinn', 'sage', 'river', 'skyler',
];

export default function ProfileSetup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarUrls = AVATAR_SEEDS.map(
    (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  );

  const isValid = displayName.trim().length >= 2 && selectedAvatar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email!,
        display_name: displayName.trim(),
        avatar_url: selectedAvatar,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (insertError) throw insertError;

      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--teal)] mb-8">
          Set up your profile
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Display Name */}
          <div className="mb-6">
            <label className="block text-[var(--slate-700)] font-semibold mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-3 border border-[var(--slate-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent"
              placeholder="Enter your name"
              disabled={isLoading}
            />
            <div className="text-sm text-[var(--slate-500)] mt-1">
              {displayName.length}/50
            </div>
          </div>

          {/* Avatar Gallery */}
          <div className="mb-6">
            <label className="block text-[var(--slate-700)] font-semibold mb-2">
              Choose your avatar
            </label>
            <div className="grid grid-cols-5 gap-3">
              {avatarUrls.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  disabled={isLoading}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                    selectedAvatar === url
                      ? 'border-[var(--teal)] ring-2 ring-[var(--teal)] ring-opacity-50'
                      : 'border-[var(--slate-200)] hover:border-[var(--slate-400)]'
                  }`}
                >
                  <img
                    src={url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Selected Avatar Preview */}
          {selectedAvatar && (
            <div className="mb-6">
              <label className="block text-[var(--slate-700)] font-semibold mb-2">
                Selected Avatar
              </label>
              <div className="w-32 h-32 mx-auto border-4 border-[var(--teal)] rounded-xl overflow-hidden">
                <img
                  src={selectedAvatar}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full py-4 bg-[var(--teal)] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
