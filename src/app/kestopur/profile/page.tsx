'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard } from '@/components/kestopur/ui';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kpFetch('/wp-admin/profile').then(r => setProfile(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin theme-text-neon" />
    </div>
  );

  if (!profile) return (
    <div className="space-y-6">
      <KpPageHeader title="Profile" subtitle="Your account information" />
      <KpCard>
        <div className="p-12 text-center">
          <User className="h-12 w-12 mx-auto mb-3 opacity-20 theme-text-subtle" />
          <p className="text-sm theme-text-muted">Profile data unavailable. Connect to the Kestopur backend.</p>
        </div>
      </KpCard>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <KpPageHeader title="Profile" subtitle="Your account information" />

      {/* Avatar + meta */}
      <KpCard>
        <div className="p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 theme-btn-neon">
            {profile.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold theme-text">{profile.name || 'Unknown User'}</h2>
            <p className="text-sm mt-0.5 theme-text-muted">{profile.email}</p>
            {profile.roles?.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {profile.roles.map((r: any) => (
                  <span key={r.id || r} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                    {typeof r === 'string' ? r : r.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </KpCard>

      {/* Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpCard>
          <div className="px-5 py-4 border-b theme-border">
            <span className="font-semibold text-sm theme-text">Contact Information</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { icon: Mail, label: 'Email', value: profile.email },
              { icon: Phone, label: 'Phone', value: profile.phone || '—' },
              { icon: User, label: 'User Type', value: profile.user_type || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0 theme-text-subtle" />
                <div>
                  <p className="text-xs theme-text-subtle">{label}</p>
                  <p className="text-sm theme-text">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </KpCard>

        <KpCard>
          <div className="px-5 py-4 border-b theme-border">
            <span className="font-semibold text-sm theme-text">Account Details</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Account ID', value: profile.id?.slice(0, 16) + '...' || '—' },
              { label: 'Status', value: profile.status || 'active' },
              { label: 'Member Since', value: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs theme-text-subtle">{label}</p>
                <p className="text-sm font-medium theme-text">{value}</p>
              </div>
            ))}
          </div>
        </KpCard>
      </div>
    </div>
  );
}
