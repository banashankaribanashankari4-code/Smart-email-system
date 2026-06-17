import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { analyzeEmail, regenerateReply } from './api.js';
import axios from 'axios';
import Dashboard from './Dashboard.jsx';

const LANGUAGES = [
  { code: 'English', label: '🇬🇧 English' },
  { code: 'Kannada', label: '🇮🇳 ಕನ್ನಡ' },
  { code: 'Hindi', label: '🇮🇳 हिंदी' },
  { code: 'Tamil', label: '🇮🇳 தமிழ்' },
  { code: 'Telugu', label: '🇮🇳 తెలుగు' },
  { code: 'French', label: '🇫🇷 French' },
  { code: 'Spanish', label: '🇪🇸 Spanish' },
];

const FOLDERS = [
  { key: 'inbox',      label: '📥 Inbox',       gmailLabel: 'INBOX' },
  { key: 'important',  label: '🚨 Important',    gmailLabel: 'IMPORTANT' },
  { key: 'promotions', label: '🏷️ Promotions',   gmailLabel: 'CATEGORY_PROMOTIONS' },
  { key: 'spam',       label: '🚫 Spam',         gmailLabel: 'SPAM' },
  { key: 'sent',       label: '📤 Sent',         gmailLabel: 'SENT' },
  { key: 'dashboard',  label: '📊 Dashboard',    gmailLabel: null },
];

function decodeBase64(data) {
  const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
  try {
    return decodeURIComponent(
      binary.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    return binary;
  }
}

function htmlToText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('script, style, head').forEach(el => el.remove());
  return tmp.innerText.replace(/\s+/g, ' ').trim();
}

function extractBody(payload) {
  function collectParts(p, parts = []) {
    if (p.parts) {
      for (const part of p.parts) collectParts(part, parts);
    } else if (p.body?.data) {
      parts.push({ mimeType: p.mimeType, data: p.body.data });
    }
    return parts;
  }
  const allParts = collectParts(payload);
  const plain = allParts.find(p => p.mimeType === 'text/plain');
  if (plain) return decodeBase64(plain.data);
  const html = allParts.find(p => p.mimeType === 'text/html');
  if (html) return htmlToText(decodeBase64(html.data));
  if (payload.body?.data) return decodeBase64(payload.body.data);
  return '(no body)';
}

function cleanBody(text) {
  return text
    .replace(/\[image:[^\]]*\]/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Theme tokens ──────────────────────────────────────────────────────────────
const T = {
  grad: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradLight: 'linear-gradient(135deg, rgba(102,126,234,0.10) 0%, rgba(118,75,162,0.10) 100%)',
  gradCard: 'linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)',
  purple: '#667eea',
  purpleDark: '#764ba2',
  purpleDeep: '#4a4080',
  sidebarBg: 'linear-gradient(180deg, #2d1b69 0%, #1a1040 100%)',
  offWhite: '#f3f0ff',
  border: 'rgba(102,126,234,0.18)',
  borderLight: 'rgba(102,126,234,0.12)',
  text: '#1a1040',
  textMuted: '#7b6fa0',
  textLight: '#a89ec4',
  font: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [emailsByFolder, setEmailsByFolder] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [analysis, setAnalysis] = useState({});
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [sent, setSent] = useState([]);
  const [view, setView] = useState('inbox');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [language, setLanguage] = useState('English');
  const [nextPageTokens, setNextPageTokens] = useState({});

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;
      setAccessToken(token);
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userInfo.data);
      fetchFolderEmails(token, 'inbox', 'INBOX');
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
  });

  async function fetchFolderEmails(token, folderKey, gmailLabel, pageToken = null, append = false) {
    if (!gmailLabel) return;
    setFetching(true);
    setFetchProgress(0);
    if (!append) setSelectedId(null);
    try {
      let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=${gmailLabel}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      const listRes = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const messages = listRes.data.messages || [];
      const nextPageToken = listRes.data.nextPageToken || null;
      const emailDetails = [];
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        setFetchProgress(Math.round(((i + 1) / messages.length) * 100));
        const detail = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const headers = detail.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        const senderName = from.includes('<') ? from.split('<')[0].trim() : from;
        const senderEmail = from.includes('<') ? from.split('<')[1].replace('>', '') : from;
        const rawBody = extractBody(detail.data.payload);
        const body = cleanBody(rawBody).slice(0, 2000) || '(no body)';
        emailDetails.push({
          id: msg.id, folder: folderKey,
          unread: detail.data.labelIds?.includes('UNREAD'),
          sender: senderName, email: senderEmail,
          subject,
          time: new Date(date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
          date: new Date(date).toLocaleDateString([], {day:'2-digit', month:'short'}),
          body,
          threadId: detail.data.threadId
        });
        await new Promise(r => setTimeout(r, 150));
      }
      setEmailsByFolder(prev => ({
        ...prev,
        [folderKey]: append ? [...(prev[folderKey] || []), ...emailDetails] : emailDetails
      }));
      setNextPageTokens(prev => ({ ...prev, [folderKey]: nextPageToken }));
    } catch (e) {
      alert('Failed to fetch emails: ' + e.message);
    }
    setFetching(false);
    setFetchProgress(0);
  }

  function handleViewChange(folderKey) {
    setView(folderKey);
    setSelectedId(null);
    const folder = FOLDERS.find(f => f.key === folderKey);
    if (folder?.gmailLabel && !emailsByFolder[folderKey]) {
      fetchFolderEmails(accessToken, folderKey, folder.gmailLabel);
    }
  }

  async function handleSend() {
    const allEmails = Object.values(emailsByFolder).flat();
    const selected = allEmails.find(e => e.id === selectedId);
    const reply = replies[selectedId];
    try {
      const emailContent = [
        `To: ${selected.email}`,
        `Subject: Re: ${selected.subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        reply
      ].join('\n');
      const encoded = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
        { raw: encoded },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSent(prev => [...prev, selectedId]);
      alert('✅ Real email sent successfully!');
    } catch (e) {
      alert('Send failed: ' + e.message);
    }
  }

  async function handleAnalyze() {
    const allEmails = Object.values(emailsByFolder).flat();
    const selected = allEmails.find(e => e.id === selectedId);
    if (!selected) return;
    setLoading(true);
    try {
      const result = await analyzeEmail({
        sender: selected.sender, sender_email: selected.email,
        subject: selected.subject, body: selected.body
      }, language);
      setAnalysis(prev => ({ ...prev, [selectedId]: result }));
      if (result.suggested_reply) setReplies(prev => ({ ...prev, [selectedId]: result.suggested_reply }));
    } catch (e) { alert('Analysis failed!'); }
    setLoading(false);
  }

  async function handleRegenerate() {
    const allEmails = Object.values(emailsByFolder).flat();
    const selected = allEmails.find(e => e.id === selectedId);
    setLoading(true);
    try {
      const result = await regenerateReply({
        sender: selected.sender, subject: selected.subject, body: selected.body
      }, language);
      setReplies(prev => ({ ...prev, [selectedId]: result.reply }));
    } catch (e) { alert('Regeneration failed!'); }
    setLoading(false);
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice input'); return; }
    const r = new SR();
    const langMap = {
      'English': 'en-US', 'Kannada': 'kn-IN', 'Hindi': 'hi-IN',
      'Tamil': 'ta-IN', 'Telugu': 'te-IN', 'French': 'fr-FR', 'Spanish': 'es-ES'
    };
    r.lang = langMap[language] || 'en-US';
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (selectedId) {
        setReplies(prev => ({ ...prev, [selectedId]: (prev[selectedId] || '') + ' ' + text }));
      }
    };
    r.start();
  }

  function speakReply() {
    const reply = replies[selectedId];
    if (!reply) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(reply);
    const langMap = {
      'English': 'en-US', 'Kannada': 'kn-IN', 'Hindi': 'hi-IN',
      'Tamil': 'ta-IN', 'Telugu': 'te-IN', 'French': 'fr-FR', 'Spanish': 'es-ES'
    };
    u.lang = langMap[language] || 'en-US';
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  const currentFolderEmails = emailsByFolder[view] || [];
  const allEmails = Object.values(emailsByFolder).flat();
  const selected = allEmails.find(e => e.id === selectedId);

  // ── LOGIN PAGE ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        height:'100vh', background: T.grad, fontFamily: T.font
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <div style={{
          background:'rgba(255,255,255,0.97)', borderRadius: 20, padding: 48,
          textAlign:'center', boxShadow:'0 24px 80px rgba(102,126,234,0.35)',
          maxWidth: 400, width:'90%'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: T.grad,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 34, margin:'0 auto 20px',
            boxShadow:'0 8px 24px rgba(102,126,234,0.4)'
          }}>📧</div>
          <h1 style={{
            margin:'0 0 6px', color: T.text, fontFamily: T.font,
            fontWeight: 700, fontSize: 24, letterSpacing:'-0.5px'
          }}>Smart Email Assistant</h1>
          
          <button onClick={() => login()} style={{
            display:'flex', alignItems:'center', gap: 12, background:'white',
            border:`2px solid ${T.border}`, borderRadius: 12,
            padding:'13px 24px', cursor:'pointer', fontSize: 14,
            fontFamily: T.font, fontWeight: 500, width:'100%',
            justifyContent:'center', boxShadow:'0 2px 12px rgba(102,126,234,0.15)'
          }}>
            <img src="https://www.google.com/favicon.ico" width={20} height={20} />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <div style={{display:'flex', height:'100vh', fontFamily: T.font, background: T.offWhite}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(102,126,234,0.28); border-radius: 8px; }
        textarea:focus { outline: none; border-color: #667eea !important; box-shadow: 0 0 0 3px rgba(102,126,234,0.13); }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 212, background: T.sidebarBg, color:'white',
        padding: 16, flexShrink: 0, display:'flex', flexDirection:'column',
        overflowY:'auto', boxShadow:'4px 0 24px rgba(45,27,105,0.3)'
      }}>
        {/* Brand */}
        <div style={{marginBottom: 20}}>
          <div style={{display:'flex', alignItems:'center', gap: 9, marginBottom: 6}}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: T.grad, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize: 16,
              boxShadow:'0 4px 12px rgba(102,126,234,0.5)'
            }}>📧</div>
            <span style={{fontSize: 14, fontWeight: 700, color:'white', letterSpacing:'-0.3px'}}>
              Smart Mail
            </span>
          </div>
          <div style={{
            fontSize: 10, color:'rgba(255,255,255,0.4)',
            wordBreak:'break-all', lineHeight: 1.4, paddingLeft: 2
          }}>{user.email}</div>
        </div>

        {/* Language */}
        <div style={{marginBottom: 16}}>
          <div style={{
            fontSize: 10, color:'rgba(255,255,255,0.4)', marginBottom: 5,
            textTransform:'uppercase', letterSpacing:'0.6px'
          }}>🌐 Language</div>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{
            width:'100%', background:'rgba(255,255,255,0.08)',
            color:'white', border:'1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, padding:'7px 10px', fontSize: 12,
            fontFamily: T.font, cursor:'pointer'
          }}>
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} style={{background:'#2d1b69'}}>{l.label}</option>
            ))}
          </select>
        </div>

        <div style={{height:1, background:'rgba(255,255,255,0.08)', marginBottom:12}} />

        {/* Nav */}
        {FOLDERS.map(item => (
          <div key={item.key} onClick={() => handleViewChange(item.key)} style={{
            padding:'9px 12px', borderRadius: 10, cursor:'pointer', marginBottom: 3,
            background: view===item.key
              ? 'linear-gradient(135deg, rgba(102,126,234,0.55), rgba(118,75,162,0.55))'
              : 'transparent',
            border: view===item.key ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
            color: view===item.key ? 'white' : 'rgba(255,255,255,0.6)',
            fontWeight: view===item.key ? 600 : 400,
            fontSize: 13, display:'flex', alignItems:'center',
            justifyContent:'space-between', transition:'all 0.15s'
          }}>
            <span>{item.label}</span>
            {emailsByFolder[item.key]?.length > 0 && (
              <span style={{
                background: view===item.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: 10, padding:'1px 7px', fontSize: 10, fontWeight: 600
              }}>
                {emailsByFolder[item.key].length}
              </span>
            )}
          </div>
        ))}

        <div style={{flex:1}} />

        <button onClick={() => {
          const folder = FOLDERS.find(f => f.key === view);
          if (folder?.gmailLabel) fetchFolderEmails(accessToken, view, folder.gmailLabel);
        }} disabled={fetching} style={{
          width:'100%', background:'rgba(102,126,234,0.2)',
          color:'rgba(200,190,255,1)', border:'1px solid rgba(102,126,234,0.3)',
          borderRadius: 8, padding:'8px', cursor:'pointer',
          fontSize: 12, fontFamily: T.font, marginBottom: 8
        }}>
          {fetching ? `⏳ ${fetchProgress}%` : '🔄 Refresh'}
        </button>
        <button onClick={() => { setUser(null); setEmailsByFolder({}); setAccessToken(null); }} style={{
          width:'100%', background:'rgba(231,76,60,0.2)',
          color:'rgba(255,150,140,1)', border:'1px solid rgba(231,76,60,0.3)',
          borderRadius: 8, padding:'8px', cursor:'pointer',
          fontSize: 12, fontFamily: T.font
        }}>
          Sign Out
        </button>
      </div>

      {/* ── DASHBOARD ── */}
      {view === 'dashboard' && (
        <div style={{flex:1, overflowY:'auto', background: T.offWhite}}>
          <Dashboard emails={allEmails} analysis={analysis} />
        </div>
      )}

      {/* ── EMAIL VIEWS ── */}
      {view !== 'dashboard' && (
        <>
          {/* EMAIL LIST */}
          <div style={{
            width: 292, background:'white',
            borderRight:`1px solid ${T.borderLight}`,
            overflowY:'auto', flexShrink: 0,
            boxShadow:'2px 0 12px rgba(102,126,234,0.07)'
          }}>
            {/* Header */}
            <div style={{
              padding:'11px 14px', borderBottom:`1px solid ${T.borderLight}`,
              fontSize: 12, fontWeight: 600, color: T.textMuted,
              background: T.gradCard, position:'sticky', top:0, zIndex:2
            }}>
              {fetching
                ? `⏳ Loading... ${fetchProgress}%`
                : `${FOLDERS.find(f=>f.key===view)?.label} — ${currentFolderEmails.length} emails`}
            </div>

            {/* Progress bar */}
            {fetching && (
              <div style={{height:3, background:'rgba(102,126,234,0.08)'}}>
                <div style={{
                  height:3, background: T.grad,
                  width:`${fetchProgress}%`, transition:'width 0.3s'
                }} />
              </div>
            )}

            {currentFolderEmails.length === 0 && !fetching && (
              <div style={{padding:32, textAlign:'center', color: T.textLight, fontSize:13}}>
                <div style={{fontSize:32, marginBottom:8}}>📭</div>
                No emails found
              </div>
            )}

            {currentFolderEmails.map(email => (
              <div key={email.id} onClick={() => setSelectedId(email.id)} style={{
                padding:'11px 14px', borderBottom:`1px solid ${T.borderLight}`,
                cursor:'pointer',
                background: selectedId===email.id ? T.gradLight : 'white',
                borderLeft: selectedId===email.id ? `3px solid ${T.purple}` : '3px solid transparent',
                transition:'background 0.12s'
              }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:2, alignItems:'center'}}>
                  <span style={{
                    fontSize:13, fontWeight: email.unread ? 700 : 500,
                    color: T.text, maxWidth:155, overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap'
                  }}>{email.sender}</span>
                  <span style={{fontSize:10, color: T.textLight, flexShrink:0}}>{email.date}</span>
                </div>
                <div style={{
                  fontSize:12, fontWeight: email.unread ? 600 : 400, marginBottom:2,
                  color: email.unread ? T.text : T.textMuted,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>{email.subject}</div>
                <div style={{
                  fontSize:11, color: T.textLight,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>{email.body.slice(0,70)}</div>
              </div>
            ))}

            {nextPageTokens[view] && !fetching && (
              <div style={{padding:12}}>
                <button onClick={() => {
                  const folder = FOLDERS.find(f => f.key === view);
                  if (folder?.gmailLabel) fetchFolderEmails(accessToken, view, folder.gmailLabel, nextPageTokens[view], true);
                }} style={{
                  background: T.grad, color:'white', border:'none',
                  borderRadius:8, padding:'10px', cursor:'pointer',
                  fontSize:13, fontFamily: T.font, width:'100%', fontWeight:500
                }}>
                  ⬇ Load More Emails
                </button>
              </div>
            )}
          </div>

          {/* EMAIL DETAIL */}
          <div style={{flex:1, overflowY:'auto', background: T.offWhite}}>
            {!selected ? (
              <div style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', height:'100%', gap:12
              }}>
                <div style={{
                  width:80, height:80, borderRadius:20,
                  background: T.gradLight, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:38, border:`1px solid ${T.border}`
                }}>📭</div>
                <div style={{color: T.textMuted, fontWeight:500, fontSize:14}}>
                  Select an email to read
                </div>
              </div>
            ) : (
              <div style={{padding:28, maxWidth:820, margin:'0 auto'}}>

                {/* Subject */}
                <h2 style={{
                  marginBottom:14, fontWeight:700, fontSize:19,
                  color: T.text, letterSpacing:'-0.3px', lineHeight:1.35
                }}>{selected.subject}</h2>

                {/* Sender card */}
                <div style={{
                  display:'flex', alignItems:'center', gap:10, marginBottom:18,
                  padding:'10px 14px', background:'white', borderRadius:12,
                  border:`1px solid ${T.borderLight}`,
                  boxShadow:'0 2px 10px rgba(102,126,234,0.08)'
                }}>
                  <div style={{
                    width:38, height:38, borderRadius:'50%', background: T.grad,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'white', fontWeight:700, fontSize:15, flexShrink:0,
                    boxShadow:'0 2px 8px rgba(102,126,234,0.35)'
                  }}>
                    {selected.sender.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize:13, fontWeight:600, color: T.text}}>{selected.sender}</div>
                    <div style={{fontSize:11, color: T.textMuted}}>{selected.email}</div>
                  </div>
                  <div style={{marginLeft:'auto', fontSize:11, color: T.textLight}}>
                    {selected.date} · {selected.time}
                  </div>
                </div>

                {/* Body */}
                <div style={{
                  lineHeight:1.8, marginBottom:18, padding:20,
                  background:'white', borderRadius:12, fontSize:14,
                  color:'#333', borderLeft:`3px solid ${T.purple}`,
                  border:`1px solid ${T.borderLight}`,
                  boxShadow:'0 2px 10px rgba(102,126,234,0.06)',
                  textAlign:'left', wordBreak:'break-word'
                }}>
                  {selected.body.split('\n').map((line, i) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = line.split(urlRegex);
                    return (
                      <div key={i} style={{minHeight:'1.4em'}}>
                        {parts.map((part, j) =>
                          urlRegex.test(part)
                            ? <a key={j} href={part}
                                onClick={e => { e.preventDefault(); window.open(part, '_blank', 'noopener,noreferrer'); }}
                                style={{color: T.purple, textDecoration:'underline', wordBreak:'break-all', fontSize:13, cursor:'pointer'}}>
                                {part}
                              </a>
                            : <span key={j}>{part}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Language indicator */}
                <div style={{
                  background: T.gradLight, border:`1px solid ${T.border}`,
                  borderRadius:10, padding:'8px 14px', marginBottom:14,
                  fontSize:13, color: T.purpleDeep
                }}>
                  🌐 Reply will be generated in: <strong>{LANGUAGES.find(l => l.code === language)?.label}</strong>
                </div>

                {/* Voice */}
                <div style={{
                  background:'white', border:`1px solid ${T.borderLight}`,
                  borderRadius:12, padding:14, marginBottom:14,
                  boxShadow:'0 2px 10px rgba(102,126,234,0.06)'
                }}>
                  <div style={{fontWeight:600, marginBottom:10, fontSize:13, color: T.text}}>
                    🎤 Voice Assistant <span style={{color: T.textMuted, fontWeight:400}}>({language})</span>
                  </div>
                  <div style={{display:'flex', gap:10}}>
                    <button onClick={startListening} disabled={listening} style={{
                      background: listening
                        ? 'linear-gradient(135deg,#e74c3c,#c0392b)'
                        : T.grad,
                      color:'white', border:'none', borderRadius:8,
                      padding:'8px 16px', cursor:'pointer', fontSize:13,
                      fontFamily: T.font, fontWeight:500,
                      boxShadow:'0 3px 10px rgba(102,126,234,0.3)'
                    }}>
                      {listening ? '🔴 Listening...' : '🎤 Dictate'}
                    </button>
                    {replies[selectedId] && (
                      <button
                        onClick={speaking ? () => { window.speechSynthesis.cancel(); setSpeaking(false); } : speakReply}
                        style={{
                          background: speaking
                            ? 'linear-gradient(135deg,#e74c3c,#c0392b)'
                            : 'linear-gradient(135deg,#27ae60,#1e8449)',
                          color:'white', border:'none', borderRadius:8,
                          padding:'8px 16px', cursor:'pointer', fontSize:13,
                          fontFamily: T.font, fontWeight:500,
                          boxShadow:'0 3px 10px rgba(39,174,96,0.25)'
                        }}>
                        {speaking ? '⏹ Stop' : '🔊 Read reply'}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Analysis */}
                <div style={{
                  background:'white', border:`1px solid ${T.borderLight}`,
                  borderRadius:12, padding:18,
                  boxShadow:'0 2px 10px rgba(102,126,234,0.06)'
                }}>
                  <div style={{fontWeight:600, marginBottom:14, fontSize:14, color: T.text}}>
                    ✦ AI Analysis & Smart Reply
                  </div>

                  {!analysis[selectedId] ? (
                    <button onClick={handleAnalyze} disabled={loading} style={{
                      background: loading ? 'rgba(102,126,234,0.55)' : T.grad,
                      color:'white', border:'none', borderRadius:10,
                      padding:'11px 24px', cursor: loading ? 'default' : 'pointer',
                      fontSize:14, fontFamily: T.font, fontWeight:600,
                      boxShadow:'0 4px 18px rgba(102,126,234,0.38)'
                    }}>
                      {loading ? '⏳ Analyzing...' : '✦ Analyze & Generate Reply'}
                    </button>
                  ) : (
                    <div>
                      {/* Stats */}
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
                        {[
                          ['Category', analysis[selectedId].category],
                          ['Intent',   analysis[selectedId].intent||'N/A'],
                          ['Urgency',  analysis[selectedId].urgency||'N/A'],
                          ['Sentiment',analysis[selectedId].sentiment||'N/A']
                        ].map(([label, value]) => (
                          <div key={label} style={{
                            background: T.gradCard, borderRadius:10,
                            padding:'10px 14px', border:`1px solid ${T.borderLight}`
                          }}>
                            <div style={{
                              fontSize:10, color: T.textMuted, marginBottom:3,
                              textTransform:'uppercase', letterSpacing:'0.5px'
                            }}>{label}</div>
                            <div style={{fontWeight:700, fontSize:14, color: T.text}}>{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Human-in-loop */}
                      <div style={{
                        background:'linear-gradient(135deg,rgba(243,156,18,0.09),rgba(243,156,18,0.04))',
                        border:'1px solid rgba(243,156,18,0.28)',
                        borderRadius:8, padding:'9px 14px', marginBottom:12,
                        fontSize:13, color:'#7d5a00'
                      }}>
                        👁 Human-in-the-Loop: Review and edit before sending real email.
                      </div>

                      {/* Reply textarea + buttons */}
                      {replies[selectedId] && (
                        <div>
                          <textarea
                            value={replies[selectedId]}
                            onChange={e => setReplies(prev => ({...prev, [selectedId]: e.target.value}))}
                            rows={8}
                            style={{
                              width:'100%', padding:14, borderRadius:10,
                              border:`1.5px solid ${T.border}`, fontSize:14,
                              lineHeight:1.7, resize:'vertical', fontFamily: T.font,
                              background: T.offWhite, color: T.text,
                              transition:'border-color 0.2s, box-shadow 0.2s'
                            }}
                          />
                          <div style={{display:'flex', gap:10, marginTop:10, flexWrap:'wrap'}}>
                            <button onClick={handleSend} disabled={sent.includes(selectedId)} style={{
                              background: sent.includes(selectedId)
                                ? 'rgba(39,174,96,0.45)'
                                : 'linear-gradient(135deg,#27ae60,#1e8449)',
                              color:'white', border:'none', borderRadius:10,
                              padding:'10px 22px', cursor:'pointer', fontSize:14,
                              fontFamily: T.font, fontWeight:600,
                              boxShadow:'0 4px 14px rgba(39,174,96,0.3)'
                            }}>
                              {sent.includes(selectedId) ? '✓ Sent!' : '📤 Send Real Email'}
                            </button>
                            <button onClick={handleRegenerate} disabled={loading} style={{
                              background: T.gradLight, border:`1.5px solid ${T.border}`,
                              borderRadius:10, padding:'10px 22px', cursor:'pointer',
                              fontSize:14, fontFamily: T.font, fontWeight:500,
                              color: T.purpleDeep
                            }}>
                              🔄 Regenerate in {language}
                            </button>
                          </div>
                        </div>
                      )}

                      {analysis[selectedId].message && (
                        <div style={{
                          background: T.gradCard, borderRadius:8,
                          padding:12, fontSize:13, color: T.textMuted,
                          marginTop:10, border:`1px solid ${T.borderLight}`
                        }}>
                          ℹ {analysis[selectedId].message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}