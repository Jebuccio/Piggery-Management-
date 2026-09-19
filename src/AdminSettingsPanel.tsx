import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from './supabaseClient';

interface AdminSettingsPanelProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  user?: any;
}

export default function AdminSettingsPanel({
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  user,
}: AdminSettingsPanelProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone_number || '');
        setAvatarUrl(data.avatar_url || '');
      } else {
        const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        setFullName(defaultName);
      }
    } catch (err: any) {
      console.error('Profile load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        phone_number: phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email || email === user?.email) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setStatusMessage({
        type: 'success',
        text: 'Confirmation email sent to new address. Please verify to complete change.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update email' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setStatusMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setStatusMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setAvatarUrl(publicUrl);

      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });

      setStatusMessage({ type: 'success', text: 'Profile photo uploaded and updated!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error uploading photo' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">⚙️ Account Settings & Appearance</h2>
        <p className="text-gray-500 text-sm">
          Manage your personal profile, auth credentials, and platform visual preferences.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="neu-flat p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full neu-pressed overflow-hidden flex items-center justify-center text-2xl font-bold text-blue-500">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              fullName.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <label className="neu-button px-4 py-2 rounded-xl text-xs font-bold text-blue-500 cursor-pointer inline-block">
              {uploading ? 'Uploading...' : '📷 Change Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-gray-400 mt-2">
              JPG, PNG, or GIF. Max 2MB. Saved securely in Supabase Storage.
            </p>
          </div>
        </div>
      </div>

      {/* Account Info Form */}
      <form onSubmit={handleUpdateProfile} className="neu-flat p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base">Personal Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-gray-400 font-bold block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="neu-pressed w-full p-3 rounded-xl outline-none"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 font-bold block mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 900 000 0000"
              className="neu-pressed w-full p-3 rounded-xl outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neu-button px-6 py-2.5 rounded-xl font-bold text-xs text-blue-500 hover:scale-105 transition-transform"
        >
          {loading ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>

      {/* Email & Security Credentials */}
      <div className="neu-flat p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base">Authentication & Security</h3>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-gray-400 font-bold block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neu-pressed w-full p-3 rounded-xl outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleUpdateEmail}
              disabled={loading}
              className="neu-button py-3 px-4 rounded-xl font-bold text-blue-500"
            >
              Update Email
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-2">
            <div className="md:col-span-2">
              <label className="text-gray-400 font-bold block mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="neu-pressed w-full p-3 rounded-xl outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={loading}
              className="neu-button py-3 px-4 rounded-xl font-bold text-blue-500"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Appearance Controls */}
      <div className="neu-flat p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base">Interface Appearance</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold">Theme Mode</p>
            <p className="text-[10px] text-gray-400">Toggle between Light and Dark visual design</p>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="neu-button px-4 py-2 rounded-xl text-xs font-bold text-blue-500"
          >
            {darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-bold">Base Font Size ({fontSize}px)</p>
            <p className="text-[10px] text-gray-400">Adjust content scaling across the application</p>
          </div>
          <div className="flex items-center gap-3 w-48">
            <span className="text-xs font-bold">A-</span>
            <input
              type="range"
              min="12"
              max="18"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-blue-500 h-1.5 neu-pressed rounded-lg cursor-pointer"
            />
            <span className="text-sm font-bold">A+</span>
          </div>
        </div>
      </div>
    </div>
  );
}