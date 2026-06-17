import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';

const T = {
  grad: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradLight: 'linear-gradient(135deg, rgba(102,126,234,0.10) 0%, rgba(118,75,162,0.10) 100%)',
  purple: '#667eea',
  purpleDark: '#764ba2',
  purpleDeep: '#4a4080',
  offWhite: '#f3f0ff',
  border: 'rgba(102,126,234,0.18)',
  borderLight: 'rgba(102,126,234,0.12)',
  text: '#1a1040',
  textMuted: '#7b6fa0',
  textLight: '#a89ec4',
  font: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
};

const COLORS = ['#667eea', '#764ba2', '#27ae60', '#e74c3c', '#f39c12', '#1abc9c'];

export default function Dashboard({ emails, analysis }) {
  const totalEmails   = emails.length;
  const unreadCount   = emails.filter(e => e.unread).length;
  const analyzedCount = Object.keys(analysis).length;

  const categoryData = useMemo(() => {
    const counts = {};
    Object.values(analysis).forEach(a => {
      const cat = a.category || 'Unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    if (Object.keys(counts).length === 0)
      return [{ name: 'Not analyzed yet', value: totalEmails }];
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [analysis, totalEmails]);

  const urgencyData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    Object.values(analysis).forEach(a => {
      const u = (a.urgency || '').toLowerCase();
      if (u.includes('high')) counts.High++;
      else if (u.includes('medium')) counts.Medium++;
      else if (u.includes('low')) counts.Low++;
    });
    return [
      { name: 'High',   count: counts.High,   fill: '#e74c3c' },
      { name: 'Medium', count: counts.Medium, fill: '#f39c12' },
      { name: 'Low',    count: counts.Low,    fill: '#27ae60' },
    ];
  }, [analysis]);

  const sentimentData = useMemo(() => {
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    Object.values(analysis).forEach(a => {
      const s = (a.sentiment || '').toLowerCase();
      if (s.includes('positive')) counts.Positive++;
      else if (s.includes('negative')) counts.Negative++;
      else counts.Neutral++;
    });
    return [
      { name: 'Positive', count: counts.Positive, fill: '#27ae60' },
      { name: 'Neutral',  count: counts.Neutral,  fill: '#667eea' },
      { name: 'Negative', count: counts.Negative, fill: '#e74c3c' },
    ];
  }, [analysis]);

  const emailsPerDay = useMemo(() => {
    const counts = {};
    emails.forEach(e => {
      const day = e.time || 'Unknown';
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts).slice(0, 10).map(([time, count]) => ({ time, count }));
  }, [emails]);

  const cardStyle = {
    background: 'white', borderRadius: 14, padding: 20,
    border: `1px solid ${T.borderLight}`,
    boxShadow: '0 2px 12px rgba(102,126,234,0.08)',
    fontFamily: T.font,
  };

  const metricCards = [
    { label: 'Total Emails', value: totalEmails,   color: T.purple },
    { label: 'Unread',       value: unreadCount,   color: '#e74c3c' },
    { label: 'Analyzed',     value: analyzedCount, color: '#27ae60' },
    { label: 'Read',         value: emails.length - unreadCount, color: T.purpleDark },
  ];

  return (
    <div style={{padding:24, background: T.offWhite, minHeight:'100%', fontFamily: T.font}}>

      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', gap:12, marginBottom:22,
        background:'white', borderRadius:14, padding:'14px 20px',
        border:`1px solid ${T.borderLight}`,
        boxShadow:'0 2px 12px rgba(102,126,234,0.08)'
      }}>
        <div style={{
          width:40, height:40, borderRadius:10, background: T.grad,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
          boxShadow:'0 4px 12px rgba(102,126,234,0.35)'
        }}>📊</div>
        <div>
          <h2 style={{margin:0, fontWeight:700, fontSize:18, color: T.text, letterSpacing:'-0.3px'}}>
            Analytics Dashboard
          </h2>
          <div style={{fontSize:12, color: T.textMuted, marginTop:2}}>
            Real-time insights from your Gmail inbox
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20}}>
        {metricCards.map(({ label, value, color }) => (
          <div key={label} style={{
            ...cardStyle,
            textAlign:'center',
            background:`linear-gradient(135deg, white, rgba(102,126,234,0.03))`
          }}>
            <div style={{fontSize:38, fontWeight:700, color, lineHeight:1}}>{value}</div>
            <div style={{fontSize:12, color: T.textMuted, marginTop:6, fontWeight:500}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Category + Urgency */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14}}>

        {/* Category pie */}
        <div style={cardStyle}>
          <div style={{fontWeight:600, marginBottom:14, fontSize:14, color: T.text}}>
            📁 Email Categories
          </div>
          {analyzedCount === 0 ? (
            <div style={{color: T.textLight, fontSize:13, textAlign:'center', padding:40}}>
              Analyze emails to see category data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false} fontSize={11}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius:8, border:`1px solid ${T.border}`, fontSize:12}} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Urgency bar */}
        <div style={cardStyle}>
          <div style={{fontWeight:600, marginBottom:14, fontSize:14, color: T.text}}>
            🚨 Urgency Levels
          </div>
          {analyzedCount === 0 ? (
            <div style={{color: T.textLight, fontSize:13, textAlign:'center', padding:40}}>
              Analyze emails to see urgency data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={urgencyData} margin={{top:5, right:10, left:-20, bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(102,126,234,0.08)" />
                <XAxis dataKey="name" fontSize={12} tick={{fill: T.textMuted}} />
                <YAxis fontSize={12} allowDecimals={false} tick={{fill: T.textMuted}} />
                <Tooltip contentStyle={{borderRadius:8, border:`1px solid ${T.border}`, fontSize:12}} />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {urgencyData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Sentiment + Emails per day */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>

        {/* Sentiment bar */}
        <div style={cardStyle}>
          <div style={{fontWeight:600, marginBottom:14, fontSize:14, color: T.text}}>
            😊 Sentiment Analysis
          </div>
          {analyzedCount === 0 ? (
            <div style={{color: T.textLight, fontSize:13, textAlign:'center', padding:40}}>
              Analyze emails to see sentiment data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sentimentData} margin={{top:5, right:10, left:-20, bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(102,126,234,0.08)" />
                <XAxis dataKey="name" fontSize={12} tick={{fill: T.textMuted}} />
                <YAxis fontSize={12} allowDecimals={false} tick={{fill: T.textMuted}} />
                <Tooltip contentStyle={{borderRadius:8, border:`1px solid ${T.border}`, fontSize:12}} />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Emails over time */}
        <div style={cardStyle}>
          <div style={{fontWeight:600, marginBottom:14, fontSize:14, color: T.text}}>
            📈 Emails in Inbox
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={emailsPerDay} margin={{top:5, right:10, left:-20, bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(102,126,234,0.08)" />
              <XAxis dataKey="time" fontSize={10} tick={{fill: T.textMuted}} />
              <YAxis fontSize={12} allowDecimals={false} tick={{fill: T.textMuted}} />
              <Tooltip contentStyle={{borderRadius:8, border:`1px solid ${T.border}`, fontSize:12}} />
              <Line
                type="monotone" dataKey="count" stroke={T.purple}
                strokeWidth={2.5} dot={{fill: T.purple, r:4}}
                activeDot={{r:6, fill: T.purpleDark}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tip */}
      {analyzedCount === 0 && (
        <div style={{
          marginTop:16, background: T.gradLight,
          border:`1px solid ${T.border}`, borderRadius:12,
          padding:'12px 16px', fontSize:13, color: T.purpleDeep
        }}>
          💡 <strong>Tip:</strong> Go to Inbox → click an email → click "Analyze & Generate Reply" to populate the charts!
        </div>
      )}
    </div>
  );
}