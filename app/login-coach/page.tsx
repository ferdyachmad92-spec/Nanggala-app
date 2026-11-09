'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginCoachPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('coach')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        setError('Username atau password salah');
        setLoading(false);
        return;
      }

      // Simpan data pelatih yang login
      localStorage.setItem('coachLoggedIn', 'true');
      localStorage.setItem('coachData', JSON.stringify(data));
      router.push('/coach');
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 50%, #000 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(200,16,46,0.3)',
        borderRadius: '18px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800 }}>
            Login <span style={{ color: '#C8102E' }}>Pelatih</span>
          </h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
            Nanggala Climbing Club
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', color: 'white', fontSize: '15px'
              }}
              placeholder="Username pelatih"
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', color: 'white', fontSize: '15px'
              }}
              placeholder="Password"
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: '#C8102E', color: 'white', border: 'none',
              borderRadius: '12px', fontWeight: 700, fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}