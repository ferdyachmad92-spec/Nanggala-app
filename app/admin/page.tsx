'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface Coach {
  id?: string | number;
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

interface Athlete {
  id?: string | number;
  Nama: string;
  Foto: string;
  umur?: number;
  kategori?: string;
  spesialis?: string;
  tingkat?: string;
  catatan?: string;
}

type TabType = 'pelatih' | 'atlet';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pelatih');
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [coachForm, setCoachForm] = useState<Coach>({
    Nama: '', Foto: '', Certificate: '', spesialis: '',
    certificates: [], pengalaman: '', bio: '', umur: undefined, lokasi: ''
  });
  const [certInput, setCertInput] = useState('');

  const [athleteForm, setAthleteForm] = useState<Athlete>({
    Nama: '', Foto: '', umur: undefined, kategori: '',
    spesialis: '', tingkat: '', catatan: ''
  });

  const loadCoaches = async () => {
    const { data } = await supabase.from('coach').select('*').order('Nama');
    if (data) setCoaches(data);
  };

  const loadAthletes = async () => {
    const { data } = await supabase.from('athletes').select('*').order('Nama');
    if (data) setAthletes(data);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadCoaches(), loadAthletes()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const resetForm = () => {
    setCoachForm({
      Nama: '', Foto: '', Certificate: '', spesialis: '',
      certificates: [], pengalaman: '', bio: '', umur: undefined, lokasi: ''
    });
    setAthleteForm({
      Nama: '', Foto: '', umur: undefined, kategori: '',
      spesialis: '', tingkat: '', catatan: ''
    });
    setCertInput('');
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingId(null);
    setShowForm(false);
  };

  // Upload foto ke Supabase Storage
  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let photoUrl = activeTab === 'pelatih' ? coachForm.Foto : athleteForm.Foto;

      // Upload foto baru jika ada file yang dipilih
      if (selectedFile) {
        photoUrl = await uploadPhoto(selectedFile);
      }

      if (activeTab === 'pelatih') {
        if (!coachForm.Nama.trim()) return alert('Nama wajib diisi');
        const payload = { ...coachForm, Foto: photoUrl };

        if (editingId) {
          const { error } = await supabase.from('coach').update(payload).eq('id', editingId);
          if (error) throw error;
          alert('Pelatih berhasil diupdate');
        } else {
          const { error } = await supabase.from('coach').insert([payload]);
          if (error) throw error;
          alert('Pelatih berhasil ditambahkan');
        }
      } else {
        if (!athleteForm.Nama.trim()) return alert('Nama wajib diisi');
        const payload = { ...athleteForm, Foto: photoUrl };

        if (editingId) {
          const { error } = await supabase.from('athletes').update(payload).eq('id', editingId);
          if (error) throw error;
          alert('Atlet berhasil diupdate');
        } else {
          const { error } = await supabase.from('athletes').insert([payload]);
          if (error) throw error;
          alert('Atlet berhasil ditambahkan');
        }
      }

      resetForm();
      loadAll();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
      console.error(err);
    }
  };

  const handleEditCoach = (coach: Coach) => {
    setCoachForm({ ...coach, certificates: coach.certificates || [] });
    setEditingId(coach.id || null);
    setPreviewUrl(coach.Foto || '');
    setActiveTab('pelatih');
    setShowForm(true);
  };

  const handleEditAthlete = (athlete: Athlete) => {
    setAthleteForm({ ...athlete });
    setEditingId(athlete.id || null);
    setPreviewUrl(athlete.Foto || '');
    setActiveTab('atlet');
    setShowForm(true);
  };

  
  const handleDeleteCoach = async (id: string | number) => {
    if (!confirm('Yakin ingin menghapus pelatih ini?')) return;
    const { error } = await supabase.from('coach').delete().eq('id', id);
    if (error) alert('Gagal: ' + error.message);
    else {
      alert('Berhasil dihapus');
      loadCoaches();
    }
  };

  const handleDeleteAthlete = async (id: string | number) => {
    if (!confirm('Yakin ingin menghapus atlet ini?')) return;
    const { error } = await supabase.from('athletes').delete().eq('id', id);
    if (error) alert('Gagal: ' + error.message);
    else {
      alert('Berhasil dihapus');
      loadAthletes();
    }
  };

  const addCertificate = () => {
    if (certInput.trim()) {
      setCoachForm(prev => ({
        ...prev,
        certificates: [...(prev.certificates || []), certInput.trim()]
      }));
      setCertInput('');
    }
  };

  const removeCertificate = (index: number) => {
    setCoachForm(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
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

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14, color: '#d4d4d8' };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 50%, #000 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '30px 20px'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '30px' }}>
          <Link href="/" style={{ color: '#f87171', textDecoration: 'none', fontSize: '14px' }}>
            ← Kembali ke Beranda
          </Link>
          <h1 style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: 800 }}>
            Admin <span style={{ color: '#C8102E' }}>Nanggala</span>
          </h1>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            onClick={() => { setActiveTab('pelatih'); resetForm(); }}
            style={{
              padding: '12px 28px', borderRadius: '12px', border: 'none', fontWeight: 700,
              fontSize: '15px', cursor: 'pointer',
              background: activeTab === 'pelatih' ? '#C8102E' : 'rgba(255,255,255,0.08)',
              color: 'white'
            }}
          >
            👨‍🏫 Pelatih ({coaches.length})
          </button>
          <button
            onClick={() => { setActiveTab('atlet'); resetForm(); }}
            style={{
              padding: '12px 28px', borderRadius: '12px', border: 'none', fontWeight: 700,
              fontSize: '15px', cursor: 'pointer',
              background: activeTab === 'atlet' ? '#C8102E' : 'rgba(255,255,255,0.08)',
              color: 'white'
            }}
          >
            🏋️ Atlet ({athletes.length})
          </button>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{
              background: '#C8102E', color: 'white', border: 'none',
              padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
              fontSize: '15px', cursor: 'pointer'
            }}
          >
            + Tambah {activeTab === 'pelatih' ? 'Pelatih' : 'Atlet'}
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(200,16,46,0.3)',
            borderRadius: '18px', padding: '28px', marginBottom: '40px'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingId ? 'Edit' : 'Tambah'} {activeTab === 'pelatih' ? 'Pelatih' : 'Atlet'}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Upload Foto */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Foto (Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ color: '#d4d4d8', marginBottom: 10 }}
                />
                {previewUrl && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12, border: '1px solid #333' }}
                    />
                  </div>
                )}
              </div>

              {activeTab === 'pelatih' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Nama *</label>
                      <input type="text" value={coachForm.Nama} onChange={e => setCoachForm({...coachForm, Nama: e.target.value})} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Spesialis</label>
                      <input type="text" value={coachForm.spesialis} onChange={e => setCoachForm({...coachForm, spesialis: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Certificate (utama)</label>
                      <input type="text" value={coachForm.Certificate} onChange={e => setCoachForm({...coachForm, Certificate: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Umur</label>
                      <input type="number" value={coachForm.umur || ''} onChange={e => setCoachForm({...coachForm, umur: e.target.value ? Number(e.target.value) : undefined})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Lokasi</label>
                      <input type="text" value={coachForm.lokasi || ''} onChange={e => setCoachForm({...coachForm, lokasi: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Pengalaman</label>
                    <input type="text" value={coachForm.pengalaman || ''} onChange={e => setCoachForm({...coachForm, pengalaman: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Bio</label>
                    <textarea value={coachForm.bio || ''} onChange={e => setCoachForm({...coachForm, bio: e.target.value})} rows={3} style={{...inputStyle, resize: 'vertical'}} />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Sertifikasi (bisa lebih dari 1)</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input type="text" value={certInput} onChange={e => setCertInput(e.target.value)} style={{...inputStyle, flex: 1}} placeholder="Tambah sertifikasi..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCertificate())} />
                      <button type="button" onClick={addCertificate} style={{ background: 'rgba(200,16,46,0.2)', border: '1px solid rgba(200,16,46,0.4)', color: 'white', padding: '0 18px', borderRadius: 10, cursor: 'pointer' }}>Tambah</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      {coachForm.certificates?.map((cert, i) => (
                        <span key={i} style={{ background: 'rgba(200,16,46,0.15)', border: '1px solid rgba(200,16,46,0.3)', padding: '5px 12px', borderRadius: 999, fontSize: 13, display: 'flex', alignItems: 'center' }}>
                          {cert}
                          <button type="button" onClick={() => removeCertificate(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: 6 }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Nama *</label>
                      <input type="text" value={athleteForm.Nama} onChange={e => setAthleteForm({...athleteForm, Nama: e.target.value})} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Umur</label>
                      <input type="number" value={athleteForm.umur || ''} onChange={e => setAthleteForm({...athleteForm, umur: e.target.value ? Number(e.target.value) : undefined})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Kategori</label>
                      <input type="text" value={athleteForm.kategori || ''} onChange={e => setAthleteForm({...athleteForm, kategori: e.target.value})} style={inputStyle} placeholder="Junior / Senior" />
                    </div>
                    <div>
                      <label style={labelStyle}>Spesialis</label>
                      <input type="text" value={athleteForm.spesialis || ''} onChange={e => setAthleteForm({...athleteForm, spesialis: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tingkat</label>
                      <input type="text" value={athleteForm.tingkat || ''} onChange={e => setAthleteForm({...athleteForm, tingkat: e.target.value})} style={inputStyle} placeholder="Pemula / Intermediate" />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Catatan</label>
                    <textarea value={athleteForm.catatan || ''} onChange={e => setAthleteForm({...athleteForm, catatan: e.target.value})} rows={3} style={{...inputStyle, resize: 'vertical'}} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" style={{ background: '#C8102E', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                  {editingId ? 'Update Data' : 'Simpan Data'}
                </button>
                <button type="button" onClick={resetForm} style={{ background: 'transparent', color: '#a1a1aa', border: '1px solid #333', padding: '12px 28px', borderRadius: 10, cursor: 'pointer' }}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DAFTAR */}
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>
            Daftar {activeTab === 'pelatih' ? 'Pelatih' : 'Atlet'} ({activeTab === 'pelatih' ? coaches.length : athletes.length})
          </h2>

          {loading ? (
            <p style={{ color: '#a1a1aa' }}>Memuat data...</p>
          ) : activeTab === 'pelatih' ? (
            coaches.length === 0 ? (
              <p style={{ color: '#71717a' }}>Belum ada data pelatih</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {coaches.map(coach => (
                  <div key={coach.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', background: '#222', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {coach.Foto ? (
                        <Image src={coach.Foto} alt={coach.Nama} width={56} height={56} style={{ objectFit: 'cover' }} unoptimized />
                      ) : <span style={{ fontSize: 24 }}>👤</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700 }}>{coach.Nama}</div>
                      <div style={{ color: '#d4a017', fontSize: 13 }}>{coach.Certificate}</div>
                      <div style={{ color: '#a1a1aa', fontSize: 13 }}>{coach.spesialis}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEditCoach(coach)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Edit</button>
                      <button onClick={() => coach.id && handleDeleteCoach(coach.id)} style={{ background: 'rgba(200,16,46,0.15)', border: '1px solid rgba(200,16,46,0.3)', color: '#f87171', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            athletes.length === 0 ? (
              <p style={{ color: '#71717a' }}>Belum ada data atlet</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {athletes.map(athlete => (
                  <div key={athlete.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', background: '#222', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {athlete.Foto ? (
                        <Image src={athlete.Foto} alt={athlete.Nama} width={56} height={56} style={{ objectFit: 'cover' }} unoptimized />
                      ) : <span style={{ fontSize: 24 }}>👤</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700 }}>{athlete.Nama}</div>
                      <div style={{ color: '#d4a017', fontSize: 13 }}>{athlete.kategori} {athlete.tingkat && `• ${athlete.tingkat}`}</div>
                      <div style={{ color: '#a1a1aa', fontSize: 13 }}>{athlete.spesialis}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEditAthlete(athlete)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Edit</button>
                      <button onClick={() => athlete.id && handleDeleteAthlete(athlete.id)} style={{ background: 'rgba(200,16,46,0.15)', border: '1px solid rgba(200,16,46,0.3)', color: '#f87171', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}