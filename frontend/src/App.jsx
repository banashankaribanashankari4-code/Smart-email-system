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
    .replace(/\[image:[^\]]*\]/gi, '')     // remove [image: ...] tags
    .replace(/[ \t]{2,}/g, ' ')           // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n')           // collapse multiple blank lines
    .trim();
}
 
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
  const interFont = "'Inter', 'Segoe UI', 'Roboto', sans-serif";
 
  if (!user) {
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily:interFont}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>
        <div style={{background:'white', borderRadius:16, padding:48, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', maxWidth:400, width:'100%'}}>
          <div style={{fontSize:48, marginBottom:16}}>📧</div>
          <h1 style={{margin:'0 0 32px', color:'#1a1a2e', fontFamily:interFont, fontWeight:600, fontSize:26, letterSpacing:'-0.5px'}}>Smart Email Assistant</h1>
          <button onClick={() => login()}
            style={{display:'flex', alignItems:'center', gap:12, background:'white', border:'2px solid #ddd', borderRadius:10, padding:'14px 24px', cursor:'pointer', fontSize:15, fontFamily:interFont, fontWeight:500, width:'100%', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
            <img src="https://www.google.com/favicon.ico" width={20} height={20} />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div style={{display:'flex', height:'100vh', fontFamily:interFont, background:'#f5f5f5'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>
 
      {/* SIDEBAR */}
      <div style={{width:200, background:'#1a1a2e', color:'white', padding:16, flexShrink:0, display:'flex', flexDirection:'column', overflowY:'auto'}}>
        <div style={{fontSize:14, fontWeight:'600', marginBottom:4, color:'#4fc3f7'}}>Smart Mail</div>
        <div style={{fontSize:10, color:'#aaa', marginBottom:16, wordBreak:'break-all'}}>{user.email}</div>
 
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11, color:'#aaa', marginBottom:6}}>🌐 Language</div>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            style={{width:'100%', background:'#2d2d4e', color:'white', border:'1px solid #4fc3f7', borderRadius:6, padding:'6px 8px', fontSize:12, fontFamily:interFont, cursor:'pointer'}}>
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
 
        {FOLDERS.map(item => (
          <div key={item.key} onClick={() => handleViewChange(item.key)}
            style={{padding:'10px 12px', borderRadius:8, cursor:'pointer', marginBottom:4,
              background: view===item.key ? '#4fc3f7' : 'transparent',
              color: view===item.key ? '#1a1a2e' : 'white',
              fontWeight: view===item.key ? '600' : '400',
              fontSize: 13}}>
            {item.label}
            {emailsByFolder[item.key]?.length > 0 && (
              <span style={{marginLeft:6, background:'rgba(255,255,255,0.2)', borderRadius:10, padding:'1px 6px', fontSize:10}}>
                {emailsByFolder[item.key].length}
              </span>
            )}
          </div>
        ))}
 
        <div style={{flex:1}} />
 
        <button onClick={() => {
          const folder = FOLDERS.find(f => f.key === view);
          if (folder?.gmailLabel) fetchFolderEmails(accessToken, view, folder.gmailLabel);
        }} disabled={fetching}
          style={{width:'100%', background:'#27ae60', color:'white', border:'none', borderRadius:8, padding:'8px', cursor:'pointer', fontSize:12, fontFamily:interFont, marginBottom:8}}>
          {fetching ? `⏳ ${fetchProgress}%` : '🔄 Refresh'}
        </button>
        <button onClick={() => { setUser(null); setEmailsByFolder({}); setAccessToken(null); }}
          style={{width:'100%', background:'#e74c3c', color:'white', border:'none', borderRadius:8, padding:'8px', cursor:'pointer', fontSize:12, fontFamily:interFont}}>
          Sign Out
        </button>
      </div>
 
      {/* DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <div style={{flex:1, overflowY:'auto'}}>
          <Dashboard emails={allEmails} analysis={analysis} />
        </div>
      )}
 
      {/* EMAIL VIEWS */}
      {view !== 'dashboard' && (
        <>
          {/* EMAIL LIST */}
          <div style={{width:300, background:'white', borderRight:'1px solid #eee', overflowY:'auto', flexShrink:0}}>
            <div style={{padding:'12px 16px', borderBottom:'1px solid #eee', fontWeight:'600', fontSize:13, color:'#555', background:'#fafafa'}}>
              {fetching ? `⏳ Loading... ${fetchProgress}%` : `${FOLDERS.find(f=>f.key===view)?.label} — ${currentFolderEmails.length} emails`}
            </div>
            {fetching && (
              <div style={{height:3, background:'#eee'}}>
                <div style={{height:3, background:'#4fc3f7', width:`${fetchProgress}%`, transition:'width 0.3s'}} />
              </div>
            )}
            {currentFolderEmails.length === 0 && !fetching && (
              <div style={{padding:24, textAlign:'center', color:'#aaa', fontSize:13}}>No emails found</div>
            )}
            {currentFolderEmails.map(email => (
              <div key={email.id} onClick={() => setSelectedId(email.id)}
                style={{padding:'12px 16px', borderBottom:'1px solid #f0f0f0', cursor:'pointer',
                  background: selectedId===email.id ? '#e8f0fe' : 'white',
                  borderLeft: selectedId===email.id ? '3px solid #4fc3f7' : '3px solid transparent'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:2, alignItems:'center'}}>
                  <span style={{fontSize:13, fontWeight: email.unread ? '700' : '500', color:'#1a1a2e', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{email.sender}</span>
                  <span style={{fontSize:11, color:'#999', flexShrink:0}}>{email.date}</span>
                </div>
                <div style={{fontSize:12, fontWeight: email.unread ? '600' : '400', marginBottom:2, color:'#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{email.subject}</div>
                <div style={{fontSize:11, color:'#999', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{email.body.slice(0,70)}</div>
              </div>
            ))}
            {/* LOAD MORE BUTTON */}
            {nextPageTokens[view] && !fetching && (
              <div style={{padding:12, textAlign:'center'}}>
                <button
                  onClick={() => {
                    const folder = FOLDERS.find(f => f.key === view);
                    if (folder?.gmailLabel) fetchFolderEmails(accessToken, view, folder.gmailLabel, nextPageTokens[view], true);
                  }}
                  style={{background:'#1a1a2e', color:'white', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontSize:13, fontFamily:interFont, width:'100%'}}>
                  ⬇ Load More Emails
                </button>
              </div>
            )}
          </div>
 
          {/* EMAIL DETAIL */}
          <div style={{flex:1, overflowY:'auto', background:'white'}}>
            {!selected ? (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#999', fontSize:14, gap:8}}>
                <div style={{fontSize:40}}>📭</div>
                <div>Select an email to read</div>
              </div>
            ) : (
              <div style={{padding:28, maxWidth:800}}>
                <h2 style={{marginBottom:8, fontWeight:'600', fontSize:20, color:'#1a1a2e'}}>{selected.subject}</h2>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:20, padding:'10px 14px', background:'#f9f9f9', borderRadius:8}}>
                  <div style={{width:36, height:36, borderRadius:'50%', background:'#4fc3f7', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'600', fontSize:14, flexShrink:0}}>
                    {selected.sender.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize:13, fontWeight:'600'}}>{selected.sender}</div>
                    <div style={{fontSize:12, color:'#888'}}>{selected.email}</div>
                  </div>
                  <div style={{marginLeft:'auto', fontSize:12, color:'#999'}}>{selected.date} {selected.time}</div>
                </div>
 
                {/* EMAIL BODY — like real Gmail */}
                <div style={{
                  lineHeight:1.8,
                  marginBottom:24,
                  padding:20,
                  background:'#fafafa',
                  borderRadius:8,
                  fontSize:14,
                  color:'#333',
                  borderLeft:'3px solid #e0e0e0',
                  textAlign:'left',
                  wordBreak:'break-word'
                }}>
                  {selected.body.split('\n').map((line, i) => {
                    // detect URLs in line and render as clickable links
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = line.split(urlRegex);
                    return (
                      <div key={i} style={{minHeight:'1.4em'}}>
                        {parts.map((part, j) =>
                          urlRegex.test(part)
                            ? <a key={j} href={part}
                                onClick={e => { e.preventDefault(); window.open(part, '_blank', 'noopener,noreferrer'); }}
                                style={{color:'#1a73e8', textDecoration:'underline', wordBreak:'break-all', fontSize:13, cursor:'pointer'}}>
                                {part}
                              </a>
                            : <span key={j}>{part}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
 
                {/* LANGUAGE INDICATOR */}
                <div style={{background:'#e8f5e9', border:'1px solid #a5d6a7', borderRadius:8, padding:'8px 14px', marginBottom:16, fontSize:13, color:'#2e7d32'}}>
                  🌐 Reply will be generated in: <strong>{LANGUAGES.find(l => l.code === language)?.label}</strong>
                </div>
 
                {/* VOICE */}
                <div style={{background:'#f0f4ff', border:'1px solid #c7d4f5', borderRadius:10, padding:14, marginBottom:16}}>
                  <div style={{fontWeight:'600', marginBottom:10, fontSize:13}}>🎤 Voice Assistant ({language})</div>
                  <div style={{display:'flex', gap:10}}>
                    <button onClick={startListening} disabled={listening}
                      style={{background: listening ? '#e74c3c' : '#3498db', color:'white', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontFamily:interFont}}>
                      {listening ? '🔴 Listening...' : '🎤 Dictate'}
                    </button>
                    {replies[selectedId] && (
                      <button onClick={speaking ? () => { window.speechSynthesis.cancel(); setSpeaking(false); } : speakReply}
                        style={{background: speaking ? '#e74c3c' : '#27ae60', color:'white', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontFamily:interFont}}>
                        {speaking ? '⏹ Stop' : '🔊 Read reply'}
                      </button>
                    )}
                  </div>
                </div>
 
                {/* AI ANALYSIS */}
                <div style={{fontWeight:'600', marginBottom:12, fontSize:14}}>AI Analysis & Smart Reply</div>
                {!analysis[selectedId] ? (
                  <button onClick={handleAnalyze} disabled={loading}
                    style={{background:'#4fc3f7', color:'white', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontSize:14, fontFamily:interFont, fontWeight:'500'}}>
                    {loading ? '⏳ Analyzing...' : '✦ Analyze & Generate Reply'}
                  </button>
                ) : (
                  <div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16}}>
                      {[['Category', analysis[selectedId].category],['Intent', analysis[selectedId].intent||'N/A'],['Urgency', analysis[selectedId].urgency||'N/A'],['Sentiment', analysis[selectedId].sentiment||'N/A']].map(([label, value]) => (
                        <div key={label} style={{background:'#f5f5f5', borderRadius:8, padding:'10px 14px'}}>
                          <div style={{fontSize:11, color:'#999', marginBottom:3}}>{label}</div>
                          <div style={{fontWeight:'600', fontSize:14}}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{background:'#fff8e1', border:'1px solid #ffc107', borderRadius:8, padding:12, marginBottom:12, fontSize:13}}>
                      👁 Human-in-the-Loop: Review and edit before sending real email.
                    </div>
                    {replies[selectedId] && (
                      <div>
                        <textarea value={replies[selectedId]} onChange={e => setReplies(prev => ({...prev, [selectedId]: e.target.value}))}
                          rows={8} style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', fontSize:14, lineHeight:1.6, resize:'vertical', fontFamily:interFont, boxSizing:'border-box'}} />
                        <div style={{display:'flex', gap:10, marginTop:10}}>
                          <button onClick={handleSend} disabled={sent.includes(selectedId)}
                            style={{background:'#27ae60', color:'white', border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontSize:14, fontFamily:interFont, fontWeight:'500'}}>
                            {sent.includes(selectedId) ? '✓ Sent!' : '📤 Send Real Email'}
                          </button>
                          <button onClick={handleRegenerate} disabled={loading}
                            style={{background:'#f5f5f5', border:'1px solid #ddd', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontSize:14, fontFamily:interFont}}>
                            🔄 Regenerate in {language}
                          </button>
                        </div>
                      </div>
                    )}
                    {analysis[selectedId].message && (
                      <div style={{background:'#f0f0f0', borderRadius:8, padding:12, fontSize:13, color:'#666', marginTop:10}}>
                        ℹ {analysis[selectedId].message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
