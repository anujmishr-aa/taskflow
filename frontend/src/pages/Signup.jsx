import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data);
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    display:'flex', alignItems:'center', background:'#fff',
    border:`1.5px solid ${focused===field?'#7c6bef':'#e5e7eb'}`,
    borderRadius:10, padding:'0 14px', transition:'border-color 0.15s',
    boxShadow: focused===field?'0 0 0 3px rgba(124,107,239,0.1)':'none'
  });

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ── Left Hero ── */}
      <div style={{ flex:1, background:'linear-gradient(135deg,#0f0c29 0%,#1a1a3e 45%,#24243e 100%)', position:'relative', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 70% 40%,rgba(124,107,239,0.15) 0%,transparent 60%)', pointerEvents:'none' }} />

        

        <div style={{ position:'relative', zIndex:1, marginTop:'auto', marginBottom:'auto', paddingTop:60 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'#7c6bef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚡</div>
            <span style={{ fontSize:20, fontWeight:700, color:'#fff' }}>TaskFlow</span>
          </div>
          <h1 style={{ fontSize:44, fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:16, letterSpacing:'-1.5px' }}>
            Your team's<br />command center.
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:360, marginBottom:30 }}>
            Create projects, assign tasks, set priorities and watch your team ship faster — all with a clean kanban board.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              ['✅', 'Create projects and invite teammates'],
              ['🎯', 'Assign tasks with priorities & deadlines'],
              ['📊', 'Track progress with live dashboard stats'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:16 }}>{icon}</span>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:36, position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:24 }}>
          {[['Free','Forever'],['5 min','Setup time'],['100%','Your data']].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{n}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form ── */}
      <div style={{ width: '100%', maxWidth: 480, background:'#f8f9fc', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 36px' }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:40 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'#7c6bef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>⚡</div>
            <span style={{ fontSize:15, fontWeight:700, color:'#111' }}>TaskFlow</span>
          </div>

          <h2 style={{ fontSize:26, fontWeight:700, color:'#111827', marginBottom:6 }}>Create your account</h2>
          <p style={{ fontSize:14, color:'#6b7280', marginBottom:30 }}>Start managing your team's work today</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:7 }}>Full name</label>
              <div style={inputStyle('name')}>
                <span style={{ fontSize:15, marginRight:10 }}>👤</span>
                <input style={{ flex:1, border:'none', outline:'none', padding:'12px 0', fontSize:14, color:'#111', background:'transparent' }}
                  type="text" name="name" placeholder="Anuj Mishra"
                  value={form.name} onChange={handleChange}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused('')} required />
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:7 }}>Email address</label>
              <div style={inputStyle('email')}>
                <span style={{ fontSize:15, marginRight:10 }}>✉️</span>
                <input style={{ flex:1, border:'none', outline:'none', padding:'12px 0', fontSize:14, color:'#111', background:'transparent' }}
                  type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')} required />
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:7 }}>Password</label>
              <div style={inputStyle('password')}>
                <span style={{ fontSize:15, marginRight:10 }}>🔒</span>
                <input style={{ flex:1, border:'none', outline:'none', padding:'12px 0', fontSize:14, color:'#111', background:'transparent' }}
                  type="password" name="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')} required />
              </div>
              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <div style={{ marginTop:8, display:'flex', gap:4, alignItems:'center' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background: form.password.length >= i*2 ? (form.password.length >= 8 ? '#16a34a' : '#d97706') : '#e5e7eb', transition:'background 0.2s' }} />
                  ))}
                  <span style={{ fontSize:11, color: form.password.length >= 8 ? '#16a34a' : '#d97706', marginLeft:6, whiteSpace:'nowrap' }}>
                    {form.password.length >= 8 ? 'Strong' : 'Weak'}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', background:'linear-gradient(135deg,#7c6bef,#a78bfa)', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontSize:15, fontWeight:600, cursor:'pointer', opacity:loading?0.75:1, transition:'opacity 0.15s', letterSpacing:'0.2px' }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ display:'flex', justifyContent:'center', gap:24, margin:'22px 0', borderTop:'1px solid #e5e7eb', paddingTop:22 }}>
            {['🔐 JWT secured','🛡️ Encrypted passwords'].map(t => (
              <span key={t} style={{ fontSize:12, color:'#9ca3af' }}>{t}</span>
            ))}
          </div>

          <p style={{ textAlign:'center', fontSize:13, color:'#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#7c6bef', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
