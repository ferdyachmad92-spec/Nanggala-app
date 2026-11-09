'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

interface Athlete {
  id: string;
  Nama: string;
  Foto: string;
  umur?: number;
  kategori?: string;
  spesialis?: string;
  tingkat?: string;
  catatan?: string;
}

interface TrainingResult {
  id: string;
  tanggal: string;
  jenis_latihan: string;
  nilai: number;
  satuan: string;
  catatan?: string;
}

export default function AthleteDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Ambil data atlet
      const { data: ath } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', id)
        .single();

      // Ambil hasil latihan
      const { data: res } = await supabase
        .from('training_results')
        .select('*')
        .eq('athlete_id', id)
        .order('tanggal', { ascending: true });

      if (ath) setAthlete(ath);
      if (res) setResults(res);
      setLoading(false);
    };

    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Memuat data atlet...
      </div>
    );
  }

  if (!athlete) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Atlet tidak ditemukan
      </div>
    );
  }

  // Data untuk chart
  const chartData = results.map(r => ({
    tanggal: r.tanggal,
    nilai: Number(r.nilai),
    jenis: r.jenis_latihan
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 50%, #000 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', borderBottom: '1px solid rgba(200,16,46,0.2)',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)'
      }}>
        <Link href="/athletes" style={{ color: '#f87171', textDecoration: 'none' }}>
          ← Kembali ke Daftar Atlet
        </Link>
        <Link href="/" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>
          Beranda
        </Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* ===== BIODATA ===== */}
        <div style={{
          display: 'flex', gap: 30, flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(200,16,46,0.25)',
          borderRadius: 20, padding: 30, marginBottom: 40
        }}>
          <div style={{ width: 200, height: 240, borderRadius: 16, overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
            {athlete.Foto ? (
              <Image src={athlete.Foto} alt={athlete.Nama} width={200} height={240} style={{ objectFit: 'cover' }} unoptimized />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🏋️</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 900 }}>{athlete.Nama}</h1>
            <p style={{ color: '#C8102E', marginBottom: 20, fontSize: 16 }}>
              {athlete.kategori} {athlete.tingkat && `• ${athlete.tingkat}`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 15 }}>
              <div><span style={{ color: '#a1a1aa' }}>Spesialis:</span> <strong>{athlete.spesialis || '-'}</strong></div>
              <div><span style={{ color: '#a1a1aa' }}>Umur:</span> <strong>{athlete.umur ? `${athlete.umur} tahun` : '-'}</strong></div>
            </div>

            {athlete.catatan && (
              <p style={{ marginTop: 20, lineHeight: 1.7, color: '#d4d4d8' }}>{athlete.catatan}</p>
            )}
          </div>
        </div>

        {/* ===== GRAFIK PROGRESS ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: 28, marginBottom: 40
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 22 }}>Progress Latihan</h2>

          {results.length === 0 ? (
            <p style={{ color: '#71717a' }}>Belum ada data latihan. Tambahkan melalui Admin nanti.</p>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="tanggal" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #C8102E', borderRadius: 8 }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="nilai" stroke="#C8102E" strokeWidth={3} dot={{ r: 5 }} name="Nilai / Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ===== TABEL HASIL LATIHAN ===== */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: 28
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 22 }}>Tabel Hasil Latihan</h2>

          {results.length === 0 ? (
            <p style={{ color: '#71717a' }}>Belum ada data</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(200,16,46,0.3)' }}>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Jenis Latihan</th>
                    <th style={thStyle}>Nilai</th>
                    <th style={thStyle}>Satuan</th>
                    <th style={thStyle}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={tdStyle}>{r.tanggal}</td>
                      <td style={tdStyle}>{r.jenis_latihan}</td>
                      <td style={{ ...tdStyle, color: '#C8102E', fontWeight: 700 }}>{r.nilai}</td>
                      <td style={tdStyle}>{r.satuan}</td>
                      <td style={tdStyle}>{r.catatan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', color: '#d4a017', fontWeight: 700
};
const tdStyle: React.CSSProperties = {
  padding: '12px 16px', color: '#d4d4d8'
};