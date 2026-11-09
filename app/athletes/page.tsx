'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Athlete {
  id: string | number;
  Nama: string;
  Foto: string;
  umur?: number;
  kategori?: string;
  spesialis?: string;
  tingkat?: string;
  catatan?: string;
}

interface TrainingLog {
  id: string;
  tanggal: string;
  jenis: string;
  grade: string;
  durasi_menit: number;
  catatan_pelatih: string;
}

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Athlete | null>(null);
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [progressData, setProgressData] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSesi: 0,
    bestGrade: '-',
    avgGrade: '-',
    sesiBulanIni: 0,
    totalJam: 0,
    highGradeRate: '-'
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('athletes')
        .select('*')
        .order('Nama', { ascending: true });
      if (data) setAthletes(data);
      setLoading(false);
    };
    load();
  }, []);

  // ===== Konversi Grade ke Angka (lebih akurat) =====
  const gradeToNumber = (grade: string): number => {
    if (!grade || grade === '-') return 0;
    const g = grade.toLowerCase().trim();

    // V-scale (boulder)
    if (g.startsWith('v')) {
      const num = parseFloat(g.replace('v', ''));
      return isNaN(num) ? 0 : 5 + num * 0.3; // mapping kasar ke french
    }

    // French grade (6a, 6b+, 7c, 8a, dll)
    const match = g.match(/^(\d)([abc])?(\+)?/);
    if (!match) return 0;

    let value = parseInt(match[1]);
    if (match[2] === 'b') value += 0.3;
    if (match[2] === 'c') value += 0.6;
    if (match[3] === '+') value += 0.15;

    return value;
  };

  const numberToGrade = (num: number): string => {
    if (num <= 0) return '-';
    const base = Math.floor(num);
    const decimal = num - base;

    if (decimal < 0.2) return `${base}a`;
    if (decimal < 0.45) return `${base}b`;
    if (decimal < 0.7) return `${base}c`;
    return `${base}c+`;
  };

  // ===== Hitung semua data real =====
  const calculateRealData = (logsData: TrainingLog[]) => {
    if (!logsData || logsData.length === 0) {
      setProgressData([]);
      setSessionData([]);
      setSkillData([
        { skill: 'Strength', value: 40 },
        { skill: 'Endurance', value: 40 },
        { skill: 'Technique', value: 40 },
        { skill: 'Flexibility', value: 40 },
        { skill: 'Mental', value: 40 },
        { skill: 'Speed', value: 40 },
        { skill: 'Power', value: 40 },
      ]);
      setStats({
        totalSesi: 0,
        bestGrade: '-',
        avgGrade: '-',
        sesiBulanIni: 0,
        totalJam: 0,
        highGradeRate: '-'
      });
      return;
    }

    // --- Stats ---
    const totalSesi = logsData.length;
    const totalMenit = logsData.reduce((sum, l) => sum + (Number(l.durasi_menit) || 0), 0);
    const totalJam = Math.round(totalMenit / 60);

    const gradeNumbers = logsData
      .map(l => gradeToNumber(l.grade))
      .filter(n => n > 0);

    const bestGradeNum = gradeNumbers.length ? Math.max(...gradeNumbers) : 0;
    const avgGradeNum = gradeNumbers.length
      ? gradeNumbers.reduce((a, b) => a + b, 0) / gradeNumbers.length
      : 0;

    const now = new Date();
    const sesiBulanIni = logsData.filter(l => {
      const d = new Date(l.tanggal);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const highGradeCount = gradeNumbers.filter(n => n >= 7).length;
    const highGradeRate = gradeNumbers.length
      ? Math.round((highGradeCount / gradeNumbers.length) * 100) + '%'
      : '-';

    setStats({
      totalSesi,
      bestGrade: numberToGrade(bestGradeNum),
      avgGrade: numberToGrade(avgGradeNum),
      sesiBulanIni,
      totalJam,
      highGradeRate
    });

    // --- Progress Chart (rata-rata grade per bulan) ---
    const monthGradeMap: Record<string, number[]> = {};

    logsData.forEach(l => {
      const d = new Date(l.tanggal);
      if (isNaN(d.getTime())) return;

      // Format: "Agu 26"
      const key = d.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
      const g = gradeToNumber(l.grade);
      if (g > 0) {
        if (!monthGradeMap[key]) monthGradeMap[key] = [];
        monthGradeMap[key].push(g);
      }
    });

    const progress = Object.entries(monthGradeMap)
      .map(([bulan, arr]) => ({
        bulan,
        grade: Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
      }))
      .sort((a, b) => a.bulan.localeCompare(b.bulan));

    setProgressData(progress);

    // --- Session Chart (jumlah sesi per bulan) ---
    const monthSessionMap: Record<string, number> = {};

    logsData.forEach(l => {
      const d = new Date(l.tanggal);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
      monthSessionMap[key] = (monthSessionMap[key] || 0) + 1;
    });

    const sessions = Object.entries(monthSessionMap)
      .map(([bulan, sesi]) => ({ bulan, sesi }))
      .sort((a, b) => a.bulan.localeCompare(b.bulan));

    setSessionData(sessions);

    // --- Skill Radar (berdasarkan jenis latihan) ---
    const skillCount: Record<string, number> = {
      Strength: 0,
      Endurance: 0,
      Technique: 0,
      Flexibility: 0,
      Mental: 0,
      Speed: 0,
      Power: 0
    };

    logsData.forEach(l => {
      const jenis = (l.jenis || '').toLowerCase();
      if (jenis.includes('strength') || jenis.includes('campus') || jenis.includes('hangboard')) {
        skillCount.Strength += 2;
      }
      if (jenis.includes('endurance') || jenis.includes('volume')) {
        skillCount.Endurance += 2;
      }
      if (jenis.includes('lead') || jenis.includes('technique')) {
        skillCount.Technique += 2;
      }
      if (jenis.includes('boulder')) {
        skillCount.Power += 2;
      }
      if (jenis.includes('speed')) {
        skillCount.Speed += 2;
      }
      if (jenis.includes('recovery') || jenis.includes('mobility') || jenis.includes('flex')) {
        skillCount.Flexibility += 2;
      }
      // Setiap sesi menambah mental
      skillCount.Mental += 1;
    });

    const maxVal = Math.max(...Object.values(skillCount), 1);
    const skills = Object.entries(skillCount).map(([skill, count]) => ({
      skill,
      value: Math.min(95, Math.round(35 + (count / maxVal) * 60))
    }));

    setSkillData(skills);
  };

  const openDetail = async (athlete: Athlete) => {
    setSelected(athlete);
    setLoadingLogs(true);

    const { data, error } = await supabase
      .from('training_logs')
      .select('*')
      .eq('athlete_id', athlete.id)
      .order('tanggal', { ascending: false });

    if (error) {
      console.error(error);
      setLogs([]);
      calculateRealData([]);
    } else {
      const logsData = data || [];
      setLogs(logsData);
      calculateRealData(logsData);
    }

    setLoadingLogs(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 50%, #000 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid rgba(200,16,46,0.2)',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'white' }}>
          <img src="/logo.png" alt="Nanggala" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>NANGGALA</div>
            <div style={{ fontSize: 11, color: '#d4a017' }}>CLIMBING CLUB</div>
          </div>
        </Link>
        <Link href="/" style={{ color: '#f87171', textDecoration: 'none', fontSize: 14 }}>← Kembali</Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '50px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>
            Daftar <span style={{ color: '#C8102E' }}>Atlet</span>
          </h1>
          <p style={{ color: '#a1a1aa' }}>Program Monitoring Performa Atlet (Data Real-time)</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#a1a1aa' }}>Memuat data...</p>
        ) : athletes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#71717a' }}>Belum ada data atlet. Tambahkan melalui Admin.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {athletes.map(athlete => (
              <div
                key={athlete.id}
                onClick={() => openDetail(athlete)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(200,16,46,0.18)',
                  borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s'
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
                <div style={{ position: 'relative', height: 220 }}>
                  {athlete.Foto ? (
                    <Image src={athlete.Foto} alt={athlete.Nama} fill style={{ objectFit: 'cover' }} sizes="220px" unoptimized />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🏋️</div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700 }}>{athlete.Nama}</h3>
                  <p style={{ margin: '0 0 4px', color: '#d4a017', fontSize: 13 }}>
                    {athlete.kategori} {athlete.tingkat && `• ${athlete.tingkat}`}
                  </p>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: 13 }}>{athlete.spesialis}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 100, overflowY: 'auto', padding: '30px 20px'
        }} onClick={() => setSelected(null)}>
          
          <div style={{
            background: '#0c0c0c', borderRadius: 20, width: '100%', maxWidth: 1000,
            border: '1px solid rgba(200,16,46,0.35)', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', gap: 24, padding: 28, borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
              <div style={{ width: 150, height: 150, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
                {selected.Foto ? (
                  <Image src={selected.Foto} alt={selected.Nama} width={150} height={150} style={{ objectFit: 'cover' }} unoptimized />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🏋️</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800 }}>{selected.Nama}</h2>
                    <p style={{ color: '#C8102E', margin: '0 0 12px', fontSize: 15 }}>
                      {selected.kategori} {selected.tingkat && `• ${selected.tingkat}`} {selected.spesialis && `• ${selected.spesialis}`}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} style={{
                    background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white',
                    width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16
                  }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  {selected.umur && <span style={badgeStyle}>Umur: {selected.umur} tahun</span>}
                  <span style={badgeStyle}>Data Real-time</span>
                </div>
                {selected.catatan && (
                  <p style={{ color: '#d4d4d8', lineHeight: 1.65, margin: 0, fontSize: 14 }}>{selected.catatan}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, padding: '20px 28px' }}>
              {[
                { label: 'Total Sesi', value: stats.totalSesi },
                { label: 'Best Grade', value: stats.bestGrade },
                { label: 'Rata-rata Grade', value: stats.avgGrade },
                { label: 'Sesi Bulan Ini', value: stats.sesiBulanIni },
                { label: 'Total Jam Latihan', value: stats.totalJam + 'h' },
                { label: 'High Grade Rate', value: stats.highGradeRate },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.2)',
                  borderRadius: 12, padding: '14px 16px', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#C8102E' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: '10px 28px 18px' }}>
              <div style={chartCardStyle}>
                <h4 style={chartTitleStyle}>Progress Grade (Data Real)</h4>
                {progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="bulan" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="grade" name="Grade" stroke="#C8102E" strokeWidth={3} dot={{ fill: '#C8102E', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: '#71717a', textAlign: 'center', padding: 40 }}>Belum ada data grade</p>
                )}
              </div>

              <div style={chartCardStyle}>
                <h4 style={chartTitleStyle}>Jumlah Sesi per Bulan (Data Real)</h4>
                {sessionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={sessionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="bulan" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                      <Bar dataKey="sesi" name="Sesi" fill="#C8102E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: '#71717a', textAlign: 'center', padding: 40 }}>Belum ada data sesi</p>
                )}
              </div>
            </div>

            {/* Radar */}
            <div style={{ padding: '0 28px 20px' }}>
              <div style={chartCardStyle}>
                <h4 style={chartTitleStyle}>Skill Profile (Estimasi dari Jenis Latihan)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="skill" stroke="#ccc" fontSize={13} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#555" />
                    <Radar name="Level" dataKey="value" stroke="#C8102E" fill="#C8102E" fillOpacity={0.4} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabel */}
            <div style={{ padding: '0 28px 36px' }}>
              <h4 style={{ ...chartTitleStyle, marginBottom: 14 }}>
                Riwayat Latihan (Data Real dari Pelatih) — {logs.length} sesi
              </h4>
              
              {loadingLogs ? (
                <p style={{ color: '#a1a1aa' }}>Memuat riwayat...</p>
              ) : logs.length === 0 ? (
                <p style={{ color: '#71717a' }}>Belum ada data latihan. Minta pelatih untuk menginput di halaman Coach.</p>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(200,16,46,0.18)' }}>
                        <th style={thStyle}>Tanggal</th>
                        <th style={thStyle}>Jenis</th>
                        <th style={thStyle}>Grade</th>
                        <th style={thStyle}>Durasi</th>
                        <th style={thStyle}>Catatan Pelatih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <tr key={log.id} style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                        }}>
                          <td style={tdStyle}>{log.tanggal}</td>
                          <td style={tdStyle}>{log.jenis}</td>
                          <td style={{ ...tdStyle, color: '#C8102E', fontWeight: 700 }}>{log.grade || '-'}</td>
                          <td style={tdStyle}>{log.durasi_menit} min</td>
                          <td style={{ ...tdStyle, maxWidth: 320 }}>{log.catatan_pelatih || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  background: 'rgba(200,16,46,0.15)',
  border: '1px solid rgba(200,16,46,0.3)',
  padding: '4px 12px',
  borderRadius: 999,
  fontSize: 12
};

const chartCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: 16
};

const chartTitleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 700,
  color: '#e5e5e5'
};

const thStyle: React.CSSProperties = {
  padding: '12px 14px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#f87171',
  whiteSpace: 'nowrap'
};

const tdStyle: React.CSSProperties = {
  padding: '11px 14px',
  color: '#d4d4d8'
};