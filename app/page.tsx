'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Coach {
  id: string | number;
  Nama: string;
  Foto: string;
  Certificate: string;
  spesialis: string;
  certificates: string[];
  pengalaman?: string;
  bio?: string;
  umur?: number;
  lokasi?: string;
}

export default function Home() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const getCoachPhotoUrl = (foto: string): string => {
    return foto || '/placeholder-coach.jpg';
  };

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('coach')
          .select('*')
          .order('Nama', { ascending: true });

        if (data) setCoaches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, []);

  const openCoachDetail = (coach: Coach) => setSelectedCoach(coach);
  const closeModal = () => setSelectedCoach(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 40%, #000000 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Red ambient glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* NAVBAR */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 40px',
        borderBottom: '1px solid rgba(200,16,46,0.2)',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="Nanggala"
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 0 18px rgba(200,16,46,0.35)'
            }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '21px', fontWeight: 800, letterSpacing: '1.2px' }}>
              NANGGALA
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#d4a017', fontWeight: 600, letterSpacing: '1px' }}>
              CLIMBING CLUB
            </p>
          </div>
        </div>


        <Link href="/admin">
          <div style={{
            background: 'rgba(200,16,46,0.12)',
            border: '1px solid rgba(200,16,46,0.4)',
            borderRadius: '14px',
            padding: '9px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.25s'
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(200,16,46,0.22)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(200,16,46,0.12)';
          }}
          >
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>ADMIN</div>
              <div style={{ fontSize: '11px', color: '#f87171' }}>Super Admin</div>
            </div>
          </div>
        </Link>
      </nav>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 20px 80px', position: 'relative', zIndex: 10 }}>
        
        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: 900,
            margin: '0 0 6px 0',
            letterSpacing: '0.5px',
            lineHeight: 1.15
          }}>
            NANGGALA <span style={{ color: '#C8102E' }}>CLIMBING CLUB</span>
          </h2>
          <div style={{
            width: '90px',
            height: '3.5px',
            background: '#C8102E',
            margin: '14px auto 18px',
            borderRadius: '2px'
          }} />
          <p style={{ fontSize: '18px', color: '#a1a1aa', margin: 0 }}>
            Aplikasi Monitoring Performa Atlet
          </p>
        </div>

        {/* ===== CARDS (lebih mirip design versi 1) ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '26px',
          marginBottom: '80px'
        }}>

          {/* CARD ATLET */}
          <div style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '22px',
            padding: '40px 32px',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            transition: 'all 0.3s'
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-7px)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
          }}
          >
            {/* siluet background */}
            <div style={{
              position: 'absolute',
              right: '-10px',
              bottom: '-20px',
              fontSize: '140px',
              opacity: 0.07,
              pointerEvents: 'none',
              lineHeight: 1
            }}>🏋️</div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>🏋️</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>ATLET</h3>
                  <p style={{ margin: 0, color: '#f87171', fontSize: '13px' }}>Athlete Area</p>
                </div>
              </div>

              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#d4d4d8', marginBottom: '28px' }}>
                Member Nanggala Climbing Club. Laporan performa & progress latihan.
              </p>

              <Link href="/athletes">
                <button style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #C8102E 0%, #9f1239 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(200,16,46,0.35)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                >
                  MASUK SEBAGAI ATLET →
                </button>
              </Link>
            </div>
          </div>

          {/* CARD PELATIH */}
          <div style={{
            position: 'relative',
            background: 'rgba(200,16,46,0.09)',
            border: '1px solid rgba(200,16,46,0.35)',
            borderRadius: '22px',
            padding: '40px 32px',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 12px 40px rgba(200,16,46,0.18)',
            transition: 'all 0.3s'
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-7px)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,16,46,0.55)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,16,46,0.35)';
          }}
          >
            {/* siluet background */}
            <div style={{
              position: 'absolute',
              right: '-10px',
              bottom: '-20px',
              fontSize: '140px',
              opacity: 0.08,
              pointerEvents: 'none',
              lineHeight: 1
            }}>👨‍🏫</div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '16px',
                  background: 'rgba(200,16,46,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>👨‍🏫</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>PELATIH</h3>
                  <p style={{ margin: 0, color: '#f87171', fontSize: '13px' }}>Coach Area</p>
                </div>
              </div>

              <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#d4d4d8', marginBottom: '28px' }}>
                Program latihan & monitoring atlet Nanggala Climbing Club.
              </p>

              <Link href="/coach">
                <button style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  background: '#C8102E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(200,16,46,0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                >
                  MASUK SEBAGAI PELATIH →
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* TIM PELATIH */}
        <div>
          <h2 style={{
            fontSize: '34px',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '36px'
          }}>
            Tim Pelatih Profesional <span style={{ color: '#C8102E' }}>({coaches.length})</span>
          </h2>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#a1a1aa' }}>Memuat data...</p>
          ) : coaches.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#71717a' }}>
              Belum ada data pelatih
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '18px'
            }}>
              {coaches.map(coach => (
                <div
                  key={coach.id}
                  onClick={() => openCoachDetail(coach)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(200,16,46,0.18)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,16,46,0.45)';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,16,46,0.18)';
                  }}
                >
                  <div style={{ position: 'relative', height: '210px' }}>
                    <Image
                      src={getCoachPhotoUrl(coach.Foto)}
                      alt={coach.Nama}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="210px"
                      unoptimized
                    />
                  </div>
                  <div style={{ padding: '14px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>{coach.Nama}</h3>
                    <p style={{ margin: '0 0 4px', color: '#d4a017', fontSize: '12px' }}>{coach.Certificate}</p>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '12px' }}>{coach.spesialis}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedCoach && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(6px)'
        }} onClick={closeModal}>
          <div
            style={{
              background: '#111',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '560px',
              maxHeight: '88vh',
              overflow: 'auto',
              border: '1px solid rgba(200,16,46,0.4)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'relative', height: '280px' }}>
              <Image
                src={getCoachPhotoUrl(selectedCoach.Foto)}
                alt={selectedCoach.Nama}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  fontSize: '17px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '26px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 800 }}>{selectedCoach.Nama}</h2>
              <p style={{ color: '#C8102E', marginBottom: '18px' }}>{selectedCoach.spesialis}</p>
              {/* ... sisa modal sama seperti sebelumnya ... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}