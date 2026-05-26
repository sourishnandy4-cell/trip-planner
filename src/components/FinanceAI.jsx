import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Key, Sparkles, Trash2, ArrowRight, Loader2, Cpu, HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { fetchItinerary } from '../lib/itineraryService';
import { fetchRecentExpenses, fetchTripMembers } from '../lib/expenseService';
import { calculateNetBalances } from '../lib/balanceCalculator';

export const FinanceAI = ({ tripId, tripName, tripDestination, totalBudget, currencySymbol = '₹' }) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('wandr_gemini_key') || '');
  const [tempKey, setTempKey] = useState('');
  const [showKeyForm, setShowKeyForm] = useState(!apiKey);
  
  const [model, setModel] = useState('auto');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedModelInfo, setResolvedModelInfo] = useState(null);

  const messagesEndRef = useRef(null);

  const modelsList = [
    { id: 'auto', name: 'Auto Select (Failover / Least Rate Limit)' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Least Rate Limits)' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Legacy)' }
  ];

  // Initialize Chat History
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Hello! I am Wandr Finance AI. 🤖\n\nI have fully loaded and analyzed the live budget, itinerary activities, and nett splits for your active trip **"${tripName}"**.\n\nI am ready to help you split bills, suggest cost-saving tips, or check if you are over budget. Ask me something like:\n* *"Am I over budget?"*\n* *"Who owes the most to whom?"*\n* *"Summarize my category expenses in a table."*\n* *"Suggest a budget itinerary plan for tomorrow based on our location."*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [tripId, tripName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (!tempKey.trim()) return;
    localStorage.setItem('wandr_gemini_key', tempKey.trim());
    setApiKey(tempKey.trim());
    setShowKeyForm(false);
    setError(null);
  };

  const handleClearKey = () => {
    if (window.confirm("Are you sure you want to remove your Gemini API Key? You will need to re-enter it to use the chatbot.")) {
      localStorage.removeItem('wandr_gemini_key');
      setApiKey('');
      setTempKey('');
      setShowKeyForm(true);
      setMessages([]);
    }
  };

  // Compile full dynamic context from database
  const generateSystemPrompt = async () => {
    try {
      const [itineraryRes, expensesRes, membersRes, balancesRes] = await Promise.all([
        fetchItinerary(tripId),
        fetchRecentExpenses(tripId),
        fetchTripMembers(tripId),
        calculateNetBalances(tripId)
      ]);

      const itinerary = itineraryRes.data || [];
      const expenses = expensesRes.data || [];
      const rawMembers = membersRes.data || [];
      const balances = balancesRes.data || [];

      // Normalise members — expenseService returns {id, name} objects in both modes
      const members = rawMembers.map(m => (typeof m === 'string' ? m : m.name)).filter(Boolean);

      // Format Itinerary
      const formattedItinerary = itinerary.map(item => 
        `- ${new Date(item.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}: ${item.title} at "${item.location || 'N/A'}" (${item.category_icon})`
      ).join('\n');

      // Format Expenses
      const formattedExpenses = expenses.map(item => 
        `- ${item.description}: ${currencySymbol}${item.amount} paid by ${item.paid_by} [Category: ${item.category}]`
      ).join('\n');

      // Format Balances
      const formattedBalances = balances.map(item => 
        `- ${item.from} owes ${item.to} ${currencySymbol}${item.amount}`
      ).join('\n');

      return `You are Wandr Finance AI, a helpful, premium travel assistant and budget analyzer for the Wandr Travel Planner app.
You have access to the user's active trip details. Analyze their expenses, itinerary, and companions and answer their queries.

ACTIVE TRIP DETAILS:
- Trip Name: ${tripName}
- Destination: ${tripDestination || 'N/A'}
- Total Budget: ${currencySymbol}${totalBudget}
- Travel Companions: ${members.join(', ') || 'Only you'}

CURRENT EXPENSES LOG:
${formattedExpenses || 'No expenses logged yet.'}

NET COMPANION BALANCES (WHO OWES WHOM):
${formattedBalances || 'All balances are settled. No debts.'}

ITINERARY TIMELINE ACTIVITIES:
${formattedItinerary || 'No itinerary activities planned yet.'}

Please use the appropriate currency symbol (${currencySymbol}) when discussing amounts. Keep answers concise, helpful, and highly insightful. Limit formatting to bold text, lists, or clean markdown tables where useful. No long-winded introductions or conversational filler. Always be direct and travel-smart.`;
    } catch (err) {
      return 'You are Wandr Finance AI. Help the traveler manage their travel budget.';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading || !apiKey) return;

    const userText = inputText.trim();
    setInputText('');
    setError(null);
    setResolvedModelInfo(null);

    // Append User message
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const systemPrompt = await generateSystemPrompt();
      
      // Determine sequence of models
      const modelSequence = model === 'auto' 
        ? ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'] 
        : [model];

      let lastError = null;
      let responseText = null;
      let finalResolvedModel = null;

      // Executing failover sequence
      for (const modelName of modelSequence) {
        try {
          const requestBody = {
            contents: [
              ...messages.slice(-6).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
              })),
              {
                role: 'user',
                parts: [{ text: userText }]
              }
            ],
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            }
          };

          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status}`;
            throw new Error(`[${modelName}] ${errMsg}`);
          }

          const data = await response.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (responseText) {
            finalResolvedModel = modelName;
            break; // Success! Break out of the failover sequence
          }
        } catch (err) {
          console.warn(`[Finance AI] ${modelName} failed or rate limited: ${err.message}`);
          lastError = err;
        }
      }

      if (!responseText) {
        throw new Error(lastError?.message || 'All selected Gemini AI models returned rate limits or connection errors. Please check your API Key and try again.');
      }

      // Format clean AI response bubble
      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: responseText,
        resolvedModel: finalResolvedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      if (model === 'auto') {
        setResolvedModelInfo(`Resolved via ${finalResolvedModel} due to sandbox rate-limit safety.`);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during generative contents compilation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100/50 p-6 md:p-8 flex flex-col h-[calc(100vh-140px)] min-h-[450px] font-sans">
      
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-2xl shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-primary tracking-tight">Finance AI Advisor</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ready for "${tripName}"</span>
            </div>
          </div>
        </div>

        {/* Configurations Toggles */}
        <div className="flex items-center gap-2">
          {apiKey && (
            <>
              {/* Model Select */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-xl">
                <Cpu className="w-3.5 h-3.5 text-gray-500" />
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="text-[10px] font-bold bg-transparent border-none p-0 focus:ring-0 text-gray-600 focus:outline-none cursor-pointer"
                >
                  {modelsList.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Reset key */}
              <button
                onClick={handleClearKey}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Remove API Key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* RENDER API KEY SCREEN */}
      {showKeyForm ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto space-y-6 text-center py-8">
          <div className="p-4 bg-accent/15 text-accent rounded-3xl shadow-sm">
            <Key className="w-10 h-10 stroke-[2.5]" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Enter Gemini API Key</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Wandr leverages Google's **Gemini Flash** free models to parse travel timeline logs, splits, and budgets directly in your browser. 
            </p>
          </div>

          <form onSubmit={handleSaveKey} className="w-full space-y-3">
            <div className="relative">
              <input
                type="password"
                required
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-center text-sm rounded-2xl border-gray-200 px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-accent/25 bg-white text-gray-800 transition-all font-sans"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-1.5 hover:shadow-lg transition-all duration-200"
            >
              Configure AI Advisor <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 w-full flex items-start gap-3 text-left">
            <HelpCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Where do I get one?</span>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                You can obtain a **100% free** API key from Google AI Studio. 
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-bold ml-1 inline-flex items-center gap-0.5"
                >
                  Get Key in 1 Click ↗
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* RENDER CHATBOT SCREEN */
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* Messages Board */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  msg.sender === 'user' 
                    ? 'bg-slate-50 border-slate-100 text-primary' 
                    : 'bg-primary border-primary text-white'
                }`}>
                  {msg.sender === 'user' ? msg.sender[0].toUpperCase() : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Content Bubble */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm border ${
                    msg.sender === 'user'
                      ? 'bg-accent/15 border-accent/20 text-primary rounded-tr-none'
                      : 'bg-slate-50 border-slate-150 text-gray-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  
                  <div className={`flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider px-1.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {msg.resolvedModel && (
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md text-[8px]">
                        {msg.resolvedModel}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Response Loading state */}
            {loading && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs text-gray-500 font-bold animate-pulse">Finance AI is analyzing your trip sheets...</span>
                </div>
              </div>
            )}

            {/* Error notifications */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-650 text-xs shadow-sm max-w-[90%] mx-auto animate-shake">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold block">Generative Failure</span>
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Model info banner (For auto select) */}
          {resolvedModelInfo && (
            <div className="absolute bottom-16 left-0 right-0 bg-slate-50 border border-slate-100 p-2 text-[10px] text-gray-400 text-center font-bold uppercase rounded-lg flex items-center justify-center gap-1.5 shadow-inner">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
              <span>{resolvedModelInfo}</span>
            </div>
          )}

          {/* Chat Form panel */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-150 pt-4 flex gap-2">
            <input
              type="text"
              required
              disabled={loading || !apiKey}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={loading ? 'Waiting for advisor...' : 'Ask about budgets, timeline plans, or balances...'}
              className="flex-1 text-sm rounded-2xl border-gray-200 px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-transparent bg-white text-gray-800 transition-all font-sans disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim() || !apiKey}
              className="p-3.5 bg-primary hover:bg-primary/95 text-white rounded-2xl shadow hover:shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
