import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Key, Trash2, ArrowRight, Loader2, Cpu, HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { fetchItinerary } from '../lib/itineraryService';
import { fetchRecentExpenses, fetchTripMembers } from '../lib/expenseService';
import { calculateNetBalances } from '../lib/balanceCalculator';

// ── Lightweight inline markdown renderer ──────────────────────────────────────
const inlineMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-extrabold text-primary">{part.slice(2,-2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic">{part.slice(1,-1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-slate-100 text-primary font-mono text-xs px-1 py-0.5 rounded">{part.slice(1,-1)}</code>;
    return part;
  });
};

const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="font-extrabold text-primary mt-3 mb-1 text-sm">{line.slice(4)}</h4>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="font-extrabold text-primary mt-3 mb-1">{line.slice(3)}</h3>);
      i++; continue;
    }
    if (line.match(/^[\*\-] /)) {
      const bullets = [];
      while (i < lines.length && lines[i].match(/^[\*\-] /)) {
        bullets.push(<li key={i} className="text-gray-700">{inlineMarkdown(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2 text-sm">{bullets}</ul>);
      continue;
    }
    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(<li key={i} className="text-gray-700">{inlineMarkdown(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-2 text-sm">{items}</ol>);
      continue;
    }
    if (line.match(/^[-*]{3,}$/)) {
      elements.push(<hr key={i} className="border-gray-100 my-3" />); i++; continue;
    }
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />); i++; continue;
    }
    elements.push(<p key={i} className="text-sm leading-relaxed">{inlineMarkdown(line)}</p>);
    i++;
  }
  return elements;
};
// ─────────────────────────────────────────────────────────────────────────────

export const FinanceAI = ({ tripId, tripName, tripDestination, totalBudget, currencySymbol = '₹' }) => {
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem('wandr_gemini_key') || '');
  const [tempKey, setTempKey]   = useState('');
  const [showKeyForm, setShowKeyForm] = useState(!localStorage.getItem('wandr_gemini_key'));
  const [model, setModel]       = useState('auto');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [resolvedModelInfo, setResolvedModelInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const modelsList = [
    { id: 'auto',             name: 'Auto Select (Failover)' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Legacy)' },
  ];

  useEffect(() => {
    setMessages([{
      id: 'welcome', sender: 'ai',
      text: `Hello! I'm Wandr Finance AI 🤖\n\nI've analyzed the live budget, itinerary, and splits for **"${tripName}"**. Ask me:\n* *"Am I over budget?"*\n* *"Who owes the most?"*\n* *"Summarize expenses by category."*\n* *"Suggest a budget plan for tomorrow."*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, [tripId, tripName]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (!tempKey.trim()) return;
    localStorage.setItem('wandr_gemini_key', tempKey.trim());
    setApiKey(tempKey.trim()); setShowKeyForm(false); setError(null);
  };

  const handleClearKey = () => {
    if (!window.confirm('Remove your Gemini API Key?')) return;
    localStorage.removeItem('wandr_gemini_key');
    setApiKey(''); setTempKey(''); setShowKeyForm(true); setMessages([]);
  };

  const generateSystemPrompt = async () => {
    try {
      const [iRes, eRes, mRes, bRes] = await Promise.all([
        fetchItinerary(tripId), fetchRecentExpenses(tripId),
        fetchTripMembers(tripId), calculateNetBalances(tripId),
      ]);
      const members  = (mRes.data || []).map(m => typeof m === 'string' ? m : m.name).filter(Boolean);
      const itinerary = (iRes.data || []).map(it =>
        `- ${new Date(it.start_time).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}: ${it.title} @ "${it.location||'N/A'}" (${it.category_icon})`
      ).join('\n');
      const expenses  = (eRes.data || []).map(e =>
        `- ${e.description}: ${currencySymbol}${e.amount} paid by ${e.paid_by} [${e.category}]`
      ).join('\n');
      const balances  = (bRes.data || []).map(b =>
        `- ${b.from} owes ${b.to} ${currencySymbol}${b.amount}`
      ).join('\n');

      return `You are Wandr Finance AI — a concise, expert travel budget assistant.
Trip: ${tripName} | Destination: ${tripDestination||'N/A'} | Budget: ${currencySymbol}${totalBudget}
Companions: ${members.join(', ')||'Solo'}

EXPENSES:\n${expenses||'None yet.'}
BALANCES:\n${balances||'All settled.'}
ITINERARY:\n${itinerary||'None yet.'}

Use ${currencySymbol} for amounts. Be direct, insightful, use markdown formatting (bold, lists, tables).`;
    } catch {
      return 'You are Wandr Finance AI. Help the traveler manage their budget.';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading || !apiKey) return;
    const userText = inputText.trim();
    setInputText(''); setError(null); setResolvedModelInfo(null);

    const userMsg = { id:'user-'+Date.now(), sender:'user', text:userText,
      timestamp: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const systemPrompt = await generateSystemPrompt();
      const modelSeq = model === 'auto'
        ? ['gemini-2.5-flash','gemini-2.0-flash','gemini-1.5-flash'] : [model];

      let responseText = null, lastError = null, finalModel = null;

      for (const modelName of modelSeq) {
        try {
          const body = {
            contents: [
              ...messages.slice(-6).map(m => ({ role: m.sender==='user'?'user':'model', parts:[{text:m.text}] })),
              { role:'user', parts:[{text:userText}] }
            ],
            systemInstruction: { parts:[{text:systemPrompt}] }
          };
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }
          );
          if (!res.ok) {
            const err = await res.json().catch(()=>({}));
            throw new Error(`[${modelName}] ${err.error?.message||'HTTP '+res.status}`);
          }
          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) { finalModel = modelName; break; }
        } catch (err) {
          console.warn('[Finance AI]', err.message);
          lastError = err;
        }
      }

      if (!responseText) throw new Error(lastError?.message || 'All models failed. Check your API key.');

      setMessages(prev => [...prev, {
        id:'ai-'+Date.now(), sender:'ai', text:responseText, resolvedModel:finalModel,
        timestamp: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
      }]);
      if (model === 'auto') setResolvedModelInfo(`Resolved via ${finalModel}`);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100/50 p-6 md:p-8 flex flex-col h-[calc(100vh-140px)] min-h-[450px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-2xl shadow-sm"><Bot className="w-5 h-5" /></div>
          <div>
            <h2 className="font-extrabold text-lg text-primary tracking-tight">Finance AI Advisor</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ready for "{tripName}"</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {apiKey && (
            <>
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-xl">
                <Cpu className="w-3.5 h-3.5 text-gray-500" />
                <select value={model} onChange={e => setModel(e.target.value)}
                  className="text-[10px] font-bold bg-transparent border-none p-0 focus:ring-0 text-gray-600 focus:outline-none cursor-pointer">
                  {modelsList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <button onClick={handleClearKey} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Remove API Key">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* API Key Setup Screen */}
      {showKeyForm ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto space-y-6 text-center py-8">
          <div className="p-4 bg-accent/15 text-accent rounded-3xl shadow-sm">
            <Key className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Enter Gemini API Key</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Wandr uses Google's free Gemini Flash models to analyze budgets and itineraries directly in your browser.</p>
          </div>
          <form onSubmit={handleSaveKey} className="w-full space-y-3">
            <input type="password" required value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="AIzaSy..."
              className="w-full text-center text-sm rounded-2xl border-gray-200 px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-accent/25 bg-white text-gray-800 transition-all font-sans" />
            <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-1.5 hover:shadow-lg transition-all">
              Configure AI Advisor <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 w-full flex items-start gap-3 text-left">
            <HelpCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Where do I get one?</span>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Free key from Google AI Studio.
                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-bold ml-1">Get Key ↗</a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Chat Screen */
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[88%] ${msg.sender==='user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border text-xs font-extrabold ${
                  msg.sender==='user' ? 'bg-slate-50 border-slate-100 text-primary' : 'bg-primary border-primary text-white'
                }`}>
                  {msg.sender==='user' ? msg.text[0]?.toUpperCase() || 'U' : <Bot className="w-4 h-4" />}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className={`p-4 rounded-3xl shadow-sm border ${
                    msg.sender==='user'
                      ? 'bg-accent/15 border-accent/20 text-primary rounded-tr-none'
                      : 'bg-slate-50 border-slate-150 text-gray-700 rounded-tl-none'
                  }`}>
                    {msg.sender === 'ai'
                      ? <div className="space-y-1">{renderMarkdown(msg.text)}</div>
                      : <p className="text-sm leading-relaxed">{msg.text}</p>
                    }
                  </div>
                  <div className={`flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase px-1.5 ${msg.sender==='user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.resolvedModel && <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[8px]">{msg.resolvedModel}</span>}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm flex-shrink-0"><Bot className="w-4 h-4" /></div>
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs text-gray-500 font-bold animate-pulse">Finance AI is analyzing your trip data...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-xs shadow-sm max-w-[90%] mx-auto">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div><span className="font-extrabold text-red-600 block mb-1">Error</span><p className="text-red-500 leading-relaxed">{error}</p></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {resolvedModelInfo && (
            <div className="bg-slate-50 border border-slate-100 p-2 mb-2 text-[10px] text-gray-400 text-center font-bold uppercase rounded-lg flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /><span>{resolvedModelInfo}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="border-t border-gray-150 pt-4 flex gap-2">
            <input
              type="text" required disabled={loading || !apiKey} value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={loading ? 'Waiting for advisor...' : 'Ask about budgets, balances, or trip plans...'}
              className="flex-1 text-sm rounded-2xl border-gray-200 px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-transparent bg-white text-gray-800 transition-all font-sans disabled:opacity-60"
            />
            <button type="submit" disabled={loading || !inputText.trim() || !apiKey}
              className="p-3.5 bg-primary hover:bg-primary/95 text-white rounded-2xl shadow hover:shadow-md flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
