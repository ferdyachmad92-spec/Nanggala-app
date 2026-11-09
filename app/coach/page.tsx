'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Athlete {
  id: string | number;
  Nama: string;
  Foto?: string;
  kategori?: string;
  tingkat?: string;
  spesialis?: string;
}

interface TrainingLog {
  id?: string;
  athlete_id: string | number;
  tanggal: string;
  jenis: string;
  grade: string;
  durasi_menit: number;
  catatan_pelatih: string;
}

interface Achievement {
  id?: string;
  athlete_id: string | number;
  nama_kompetisi: string;
  tahun: number;
  peringkat: string;
  kategori: string;
  lokasi: string;
  catatan: string;
}

interface Schedule {
  id?: string;
  judul: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  jenis: string;
  deskripsi: string;
}

type TabType = 'latihan' | 'prestasi' | 'jadwal';

export default function CoachPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('latihan');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [message, setMessage] = useState('');

  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [logForm, setLogForm] = useState<TrainingLog>({
    athlete_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    jenis: 'Lead',
    grade: '',
    durasi_menit: 90,
    catatan_pelatih: ''
  });

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achForm, setAchForm] = useState<Achievement>({
    athlete_id: '',
    nama_kompetisi: '',
    tahun: new Date().getFullYear(),
    peringkat: '',
    kategori: 'Lead',
    lokasi: '',
    catatan: ''
  });

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schForm, setSchForm] = useState<Schedule>({
    judul: '',
    tanggal: '',
    waktu: '',
    lokasi: '',
    jenis: 'Lead',
    deskripsi: ''
  });

  // ==================== PROTEKSI LOGIN ====================
  useEffect(() => {
    const isCoachLoggedIn = localStorage.getItem('coachLoggedIn');
    if (isCoachLoggedIn !== 'true') {
      router.push('/login-coach');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('coachLoggedIn');
    localStorage.removeItem('coachData');
    router.push('/login-coach');
  };
  // =======================================================

  useEffect(() => {
    loadAthletes();
    loadSchedules();
  }, []);

  useEffect(() => {
    if (selectedAthlete) {
      loadLogs(selectedAthlete.id);
      loadAchievements(selectedAthlete.id);
    } else {
      setLogs([]);
      setAchievements([]);
    }
  }, [selectedAthlete]);

  const loadAthletes = async () => {
    setLoadingAthletes(true);
    setMessage('');
    const { data, error } = await supabase
      .from('athletes')
      .select('id, Nama, Foto, kategori, tingkat, spesialis')
      .order('Nama', { ascending: true });

    if (error) {
      setMessage('Gagal memuat atlet: ' + error.message);
      setAthletes([]);
    } else {
      setAthletes(data || []);
      if (!data || data.length === 0) {
        setMessage('Belum ada atlet. Tambahkan dulu di halaman Admin.');
      }
    }
    setLoadingAthletes(false);
  };

  const loadLogs = async (athleteId: string | number) => {
    const { data } = await supabase
      .from('training_logs')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('tanggal', { ascending: false });
    setLogs(data || []);
  };

  const loadAchievements = async (athleteId: string | number) => {
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('tahun', { ascending: false });
    setAchievements(data || []);
  };

  const loadSchedules = async () => {
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .order('tanggal', { ascending: true });
    setSchedules(data || []);
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete) return alert('Pilih atlet terlebih dahulu');

    const payload = {
      athlete_id: selectedAthlete.id,
      tanggal: logForm.tanggal,
      jenis: logForm.jenis,
      grade: logForm.grade,
      durasi_menit: Number(logForm.durasi_menit),
      catatan_pelatih: logForm.catatan_pelatih
    };

    const { error } = await supabase.from('training_logs').insert([payload]);
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      alert('Data latihan berhasil disimpan');
      setLogForm({
        athlete_id: selectedAthlete.id,
        tanggal: new Date().toISOString().split('T')[0],
        jenis: 'Lead',
        grade: '',
        durasi_menit: 90,
        catatan_pelatih: ''
      });
      loadLogs(selectedAthlete.id);
    }
  };

  const handleSubmitAch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete) return alert('Pilih atlet terlebih dahulu');

    const payload = { ...achForm, athlete_id: selectedAthlete.id };
    const { error } = await supabase.from('achievements').insert([payload]);
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      alert('Prestasi berhasil ditambahkan');
      setAchForm({
        athlete_id: selectedAthlete.id,
        nama_kompetisi: '',
        tahun: new Date().getFullYear(),
        peringkat: '',
        kategori: 'Lead',
        lokasi: '',
        catatan: ''
      });
      loadAchievements(selectedAthlete.id);
    }
  };

  const handleSubmitSch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('schedules').insert([schForm]);
    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      alert('Jadwal berhasil ditambahkan');
      setSchForm({ judul: '', tanggal: '', waktu: '', lokasi: '', jenis: 'Lead', deskripsi: '' });
      loadSchedules();
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm('Hapus data latihan ini?')) return;
    await supabase.from('training_logs').delete().eq('id', id);
    if (selectedAthlete) loadLogs(selectedAthlete.id);
  };

  const handleDeleteAch = async (id: string) => {
    if (!confirm('Hapus prestasi ini?')) return;
    await supabase.from('achievements').delete().eq('id', id);
    if (selectedAthlete) loadAchievements(selectedAthlete.id);
  };

  const handleDeleteSch = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    await supabase.from('schedules').delete().eq('id', id);
    loadSchedules();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: 6, fontSize: 13, color: '#d4d4d8'
  };

  const primaryBtn: React.CSSProperties = {
    marginTop: 18,
    background: '#C8102E',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer'
  };

  const listItem: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 16
  };

  const deleteBtn: React.CSSProperties = {
    background: 'rgba(200,16,46,0.15)',
    border: '1px solid rgba(200,16,46,0.3)',
    color: '#f87171',
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 50%, #000 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '30px 20px'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, flexWrap: 'wrap', gap: 15 }}>
          <div>
            <Link href="/" style={{ color: '#f87171', textDecoration: 'none', fontSize: 14 }}>
              ← Kembali ke Beranda
            </Link>
            <h1 style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 800 }}>
              Area <span style={{ color: '#C8102E' }}>Pelatih</span>
            </h1>
            <p style={{ color: '#a1a1aa', margin: '4px 0 0' }}>
              Input data latihan, prestasi & jadwal
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(200,16,46,0.15)',
              border: '1px solid rgba(200,16,46,0.4)',
              color: '#f87171',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>

        {/* ===== DAFTAR ATLET ===== */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Pilih Atlet</h3>
            <button
              onClick={loadAthletes}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Refresh
            </button>
          </div>

          {loadingAthletes ? (
            <p style={{ color: '#a1a1aa' }}>Memuat daftar atlet...</p>
          ) : message ? (
            <p style={{ color: '#f87171' }}>{message}</p>
          ) : athletes.length === 0 ? (
            <p style={{ color: '#71717a' }}>Tidak ada atlet. Tambahkan di halaman Admin.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12
            }}>
              {athletes.map(athlete => (
                <div
                  key={athlete.id}
                  onClick={() => setSelectedAthlete(athlete)}
                  style={{
                    background: selectedAthlete?.id === athlete.id
                      ? 'rgba(200,16,46,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    border: selectedAthlete?.id === athlete.id
                      ? '2px solid #C8102E'
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                    background: '#1a1a1a', flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    {athlete.Foto ? (
                      <Image src={athlete.Foto} alt={athlete.Nama} width={48} height={48} style={{ objectFit: 'cover' }} unoptimized />
                    ) : (
                      <span style={{ fontSize: 20 }}>🏋️</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{athlete.Nama}</div>
                    <div style={{ color: '#a1a1aa', fontSize: 12 }}>
                      {athlete.kategori} {athlete.tingkat && `• ${athlete.tingkat}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedAthlete && (
            <p style={{ color: '#4ade80', marginTop: 12, fontSize: 14 }}>
              Atlet terpilih: <strong>{selectedAthlete.Nama}</strong>
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { key: 'latihan', label: '📝 Input Latihan' },
            { key: 'prestasi', label: '🏆 Prestasi' },
            { key: 'jadwal', label: '📅 Jadwal Latihan' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              style={{
                padding: '11px 22px',
                borderRadius: 12,
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                background: activeTab === tab.key ? '#C8102E' : 'rgba(255,255,255,0.08)',
                color: 'white'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB LATIHAN */}
        {activeTab === 'latihan' && (
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(200,16,46,0.25)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 30
            }}>
              <h3 style={{ marginTop: 0 }}>Input Data Latihan</h3>
              {!selectedAthlete && (
                <p style={{ color: '#f87171', marginBottom: 16 }}>Pilih atlet di atas terlebih dahulu</p>
              )}
              <form onSubmit={handleSubmitLog}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Tanggal *</label>
                    <input type="date" value={logForm.tanggal} onChange={e => setLogForm({...logForm, tanggal: e.target.value})} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Jenis Latihan *</label>
                    <select value={logForm.jenis} onChange={e => setLogForm({...logForm, jenis: e.target.value})} style={inputStyle}>
                      <option>Lead</option>
                      <option>Boulder</option>
                      <option>Speed</option>
                      <option>Strength</option>
                      <option>Endurance</option>
                      <option>Recovery</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Grade</label>
                    <input type="text" value={logForm.grade} onChange={e => setLogForm({...logForm, grade: e.target.value})} placeholder="8a / 7c+ / V7" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Durasi (menit)</label>
                    <input type="number" value={logForm.durasi_menit} onChange={e => setLogForm({...logForm, durasi_menit: Number(e.target.value)})} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Catatan Pelatih *</label>
                  <textarea
                    value={logForm.catatan_pelatih}
                    onChange={e => setLogForm({...logForm, catatan_pelatih: e.target.value})}
                    rows={4}
                    required
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Contoh: Excellent redpoint. Focus on rest positions improved significantly."
                  />
                </div>
                <button type="submit" style={primaryBtn} disabled={!selectedAthlete}>
                  Simpan Data Latihan
                </button>
              </form>
            </div>

            <h3>Riwayat Latihan</h3>
            {!selectedAthlete ? (
              <p style={{ color: '#71717a' }}>Pilih atlet terlebih dahulu</p>
            ) : logs.length === 0 ? (
              <p style={{ color: '#71717a' }}>Belum ada data latihan</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {logs.map(log => (
                  <div key={log.id} style={listItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>
                        {log.tanggal} • {log.jenis} • <span style={{ color: '#C8102E' }}>{log.grade || '-'}</span>
                      </div>
                      <div style={{ color: '#a1a1aa', fontSize: 13, marginTop: 4 }}>
                        {log.durasi_menit} menit — {log.catatan_pelatih}
                      </div>
                    </div>
                    <button onClick={() => log.id && handleDeleteLog(log.id)} style={deleteBtn}>Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB PRESTASI */}
        {activeTab === 'prestasi' && (
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(200,16,46,0.25)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 30
            }}>
              <h3 style={{ marginTop: 0 }}>Tambah Prestasi</h3>
              {!selectedAthlete && <p style={{ color: '#f87171' }}>Pilih atlet di atas</p>}
              <form onSubmit={handleSubmitAch}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Nama Kompetisi *</label>
                    <input type="text" value={achForm.nama_kompetisi} onChange={e => setAchForm({...achForm, nama_kompetisi: e.target.value})} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tahun</label>
                    <input type="number" value={achForm.tahun} onChange={e => setAchForm({...achForm, tahun: Number(e.target.value)})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Peringkat</label>
                    <input type="text" value={achForm.peringkat} onChange={e => setAchForm({...achForm, peringkat: e.target.value})} style={inputStyle} placeholder="Juara 1 / Finalis" />
                  </div>
                  <div>
                    <label style={labelStyle}>Kategori</label>
                    <select value={achForm.kategori} onChange={e => setAchForm({...achForm, kategori: e.target.value})} style={inputStyle}>
                      <option>Lead</option>
                      <option>Boulder</option>
                      <option>Speed</option>
                      <option>Combined</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Lokasi</label>
                    <input type="text" value={achForm.lokasi} onChange={e => setAchForm({...achForm, lokasi: e.target.value})} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Catatan</label>
                  <textarea value={achForm.catatan} onChange={e => setAchForm({...achForm, catatan: e.target.value})} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" style={primaryBtn} disabled={!selectedAthlete}>Simpan Prestasi</button>
              </form>
            </div>

            <h3>Daftar Prestasi</h3>
            {!selectedAthlete ? (
              <p style={{ color: '#71717a' }}>Pilih atlet</p>
            ) : achievements.length === 0 ? (
              <p style={{ color: '#71717a' }}>Belum ada prestasi</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {achievements.map(ach => (
                  <div key={ach.id} style={listItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{ach.nama_kompetisi} ({ach.tahun})</div>
                      <div style={{ color: '#d4a017', fontSize: 13 }}>{ach.peringkat} • {ach.kategori} • {ach.lokasi}</div>
                    </div>
                    <button onClick={() => ach.id && handleDeleteAch(ach.id)} style={deleteBtn}>Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB JADWAL */}
        {activeTab === 'jadwal' && (
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(200,16,46,0.25)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 30
            }}>
              <h3 style={{ marginTop: 0 }}>Tambah Jadwal Latihan</h3>
              <form onSubmit={handleSubmitSch}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Judul *</label>
                    <input type="text" value={schForm.judul} onChange={e => setSchForm({...schForm, judul: e.target.value})} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tanggal</label>
                    <input type="date" value={schForm.tanggal} onChange={e => setSchForm({...schForm, tanggal: e.target.value})} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Waktu</label>
                    <input type="text" value={schForm.waktu} onChange={e => setSchForm({...schForm, waktu: e.target.value})} style={inputStyle} placeholder="08:00 - 11:00" />
                  </div>
                  <div>
                    <label style={labelStyle}>Lokasi</label>
                    <input type="text" value={schForm.lokasi} onChange={e => setSchForm({...schForm, lokasi: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Jenis</label>
                    <select value={schForm.jenis} onChange={e => setSchForm({...schForm, jenis: e.target.value})} style={inputStyle}>
                      <option>Lead</option>
                      <option>Boulder</option>
                      <option>Speed</option>
                      <option>Strength</option>
                      <option>Recovery</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Deskripsi</label>
                  <textarea value={schForm.deskripsi} onChange={e => setSchForm({...schForm, deskripsi: e.target.value})} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" style={primaryBtn}>Simpan Jadwal</button>
              </form>
            </div>

            <h3>Jadwal Latihan Mendatang</h3>
            {schedules.length === 0 ? (
              <p style={{ color: '#71717a' }}>Belum ada jadwal</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {schedules.map(sch => (
                  <div key={sch.id} style={listItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{sch.judul}</div>
                      <div style={{ color: '#d4a017', fontSize: 13 }}>
                        {sch.tanggal} • {sch.waktu} • {sch.jenis}
                      </div>
                      <div style={{ color: '#a1a1aa', fontSize: 13 }}>{sch.lokasi}</div>
                    </div>
                    <button onClick={() => sch.id && handleDeleteSch(sch.id)} style={deleteBtn}>Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}