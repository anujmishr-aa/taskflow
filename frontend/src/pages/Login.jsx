import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ── Left Hero ── */}
      <div style={{ flex:1, background:'linear-gradient(135deg,#0f0c29 0%,#1a1a3e 45%,#24243e 100%)', position:'relative', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px', overflow:'hidden' }}>
        {/* Glow */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 25% 55%,rgba(124,107,239,0.18) 0%,transparent 65%)', pointerEvents:'none' }} />

        {/* Floating project cards */}
        

        {/* Main hero text */}
        <div style={{ position:'relative', zIndex:1, marginTop:'auto', marginBottom:'auto', paddingTop:80 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'#7c6bef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚡</div>
            <span style={{ fontSize:20, fontWeight:700, color:'#fff' }}>TaskFlow</span>
          </div>
          <h1 style={{ fontSize:44, fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:16, letterSpacing:'-1.5px' }}>
            Manage tasks<br />like a pro team.
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:360, marginBottom:30 }}>
            Assign work, track progress, and hit deadlines — all in one place with role-based access.
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {['📋 Project boards','🔐 Role-based access','📅 Deadline tracking'].map(p => (
              <span key={p} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'6px 14px', fontSize:12, color:'rgba(255,255,255,0.65)' }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div style={{ display:'flex', gap:36, position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:24 }}>
          {[['24','Tasks tracked'],['6','Team members'],['98%','On-time rate']].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{n}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form ── */}
      <div style={{ width:480, background:'#f8f9fc', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 36px' }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:40 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'#7c6bef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>⚡</div>
            <span style={{ fontSize:15, fontWeight:700, color:'#111' }}>TaskFlow</span>
          </div>

          <h2 style={{ fontSize:26, fontWeight:700, color:'#111827', marginBottom:6 }}>Welcome back</h2>
          <p style={{ fontSize:14, color:'#6b7280', marginBottom:30 }}>Sign in to your workspace</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:7 }}>Email address</label>
              <div style={{ display:'flex', alignItems:'center', background:'#fff', border:`1.5px solid ${focused==='email'?'#7c6bef':'#e5e7eb'}`, borderRadius:10, padding:'0 14px', transition:'border-color 0.15s', boxShadow: focused==='email'?'0 0 0 3px rgba(124,107,239,0.1)':'none' }}>
                <span style={{ fontSize:15, marginRight:10 }}>✉️</span>
                <input style={{ flex:1, border:'none', outline:'none', padding:'12px 0', fontSize:14, color:'#111', background:'transparent' }}
                  type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')} required />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:7 }}>Password</label>
              <div style={{ display:'flex', alignItems:'center', background:'#fff', border:`1.5px solid ${focused==='password'?'#7c6bef':'#e5e7eb'}`, borderRadius:10, padding:'0 14px', transition:'border-color 0.15s', boxShadow: focused==='password'?'0 0 0 3px rgba(124,107,239,0.1)':'none' }}>
                <span style={{ fontSize:15, marginRight:10 }}>🔒</span>
                <input style={{ flex:1, border:'none', outline:'none', padding:'12px 0', fontSize:14, color:'#111', background:'transparent' }}
                  type="password" name="password" placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')} required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:'linear-gradient(135deg,#7c6bef,#a78bfa)', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontSize:15, fontWeight:600, cursor:'pointer', opacity:loading?0.75:1, transition:'opacity 0.15s, transform 0.1s', letterSpacing:'0.2px' }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ display:'flex', justifyContent:'center', gap:24, margin:'22px 0', borderTop:'1px solid #e5e7eb', paddingTop:22 }}>
            {['🔐 JWT secured','🛡️ Encrypted passwords'].map(t => (
              <span key={t} style={{ fontSize:12, color:'#9ca3af' }}>{t}</span>
            ))}
          </div>

          <p style={{ textAlign:'center', fontSize:13, color:'#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color:'#7c6bef', fontWeight:600, textDecoration:'none' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
