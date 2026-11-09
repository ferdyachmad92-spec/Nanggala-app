'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // ======================
  // UBAH USERNAME & PASSWORD DI SINI
  // ======================
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'nanggala123'; // ← ganti password sesuai keinginan kamu

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      router.push('/admin');
    } else {
      setError('Username atau password salah');
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
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800 }}>
            Login <span style={{ color: '#C8102E' }}>Admin</span>
          </h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
            Nanggala Climbing Club
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d4d4d8' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none'
              }}
              placeholder="Masukkan username"
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d4d4d8' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none'
              }}
              placeholder="Masukkan password"
            />
          </div>

          {error && (
            <p style={{
              color: '#f87171',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center',
              background: 'rgba(200,16,46,0.1)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: '#C8102E',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'}
            onMouseOut={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}