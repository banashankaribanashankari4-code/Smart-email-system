import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
 
const COLORS = ['#4fc3f7', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];
const interFont = "'Inter', 'Segoe UI', 'Roboto', sans-serif";
 
export default function Dashboard({ emails, analysis }) {
 
  // --- Metric counts ---
  const totalEmails = emails.length;
  const unreadCount = emails.filter(e => e.unread).length;
  const analyzedCount = Object.keys(analysis).length;
 
  // --- Category pie chart data ---
  const categoryData = useMemo(() => {
    const counts = {};
    Object.values(analysis).forEach(a => {
      const cat = a.category || 'Unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    if (Object.keys(counts).length === 0) {
      return [{ name: 'Not analyzed yet', value: totalEmails }];
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [analysis, totalEmails]);
 
  // --- Urgency bar chart ---
  const urgencyData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    Object.values(analysis).forEach(a => {
      const u = a.urgency || '';
      if (u.toLowerCase().includes('high')) counts.High++;
      else if (u.toLowerCase().includes('medium')) counts.Medium++;
      else if (u.toLowerCase().includes('low')) counts.Low++;
    });
    return [
      { name: 'High', count: counts.High, fill: '#e74c3c' },
      { name: 'Medium', count: counts.Medium, fill: '#f39c12' },
      { name: 'Low', count: counts.Low, fill: '#27ae60' },
    ];
  }, [analysis]);
 
  // --- Sentiment bar chart ---
  const sentimentData = useMemo(() => {
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    Object.values(analysis).forEach(a => {
      const s = a.sentiment || '';
      if (s.toLowerCase().includes('positive')) counts.Positive++;
      else if (s.toLowerCase().includes('negative')) counts.Negative++;
      else counts.Neutral++;
    });
    return [
      { name: 'Positive', count: counts.Positive, fill: '#27ae60' },
      { name: 'Neutral', count: counts.Neutral, fill: '#4fc3f7' },
      { name: 'Negative', count: counts.Negative, fill: '#e74c3c' },
    ];
  }, [analysis]);
 
  // --- Emails per day line chart ---
  const emailsPerDay = useMemo(() => {
    const counts = {};
    emails.forEach(e => {
      const day = e.time || 'Unknown';
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts).slice(0, 10).map(([time, count]) => ({ time, count }));
  }, [emails]);
 
  const cardStyle = {
    background: 'white', borderRadius: 12, padding: 20,
    border: '1px solid #eee', fontFamily: interFont
  };
 
  const metricCard = (label, value, color) => (
    <div style={{ ...cardStyle, textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 36, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
    </div>
  );
 
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100%', fontFamily: interFont }}>
      <h2 style={{ marginBottom: 20, fontWeight: 600, fontSize: 20, color: '#1a1a2e' }}>
        📊 Analytics Dashboard
      </h2>
 
      {/* METRIC CARDS */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {metricCard('Total Emails', totalEmails, '#4fc3f7')}
        {metricCard('Unread', unreadCount, '#e74c3c')}
        {metricCard('Analyzed', analyzedCount, '#27ae60')}
        {metricCard('Replied', emails.length - unreadCount, '#9b59b6')}
      </div>
 
      {/* ROW 1 — Category + Urgency */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
 
        {/* Category Pie */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Email Categories</div>
          {analyzedCount === 0 ? (
            <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 40 }}>
              Analyze emails to see category data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
 
        {/* Urgency Bar */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Urgency Levels</div>
          {analyzedCount === 0 ? (
            <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 40 }}>
              Analyze emails to see urgency data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={urgencyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {urgencyData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
 
      {/* ROW 2 — Sentiment + Emails per day */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
 
        {/* Sentiment Bar */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Sentiment Analysis</div>
          {analyzedCount === 0 ? (
            <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 40 }}>
              Analyze emails to see sentiment data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sentimentData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
 
        {/* Emails per time (line chart) */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Emails in Inbox</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={emailsPerDay} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" fontSize={10} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4fc3f7" strokeWidth={2} dot={{ fill: '#4fc3f7', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
 
      </div>
 
      {analyzedCount === 0 && (
        <div style={{ marginTop: 20, background: '#fff8e1', border: '1px solid #ffc107', borderRadius: 10, padding: 14, fontSize: 13, color: '#7d6608' }}>
          💡 Tip: Go to Inbox → click an email → click "Analyze & Generate Reply" to populate the charts with real data!
        </div>
      )}
    </div>
  );
}
