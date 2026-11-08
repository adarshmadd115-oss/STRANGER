import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Shield,
  Smartphone,
  Send,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Languages,
  Code2,
  FolderGit2,
  Download,
  Terminal,
  Activity,
  Layers,
  Database,
  ExternalLink,
  Copy,
  Check,
  Play,
  Volume2
} from 'lucide-react';
import {
  ChatMessage,
  AgentTask,
  Language,
  validateToolCall,
  planTaskForInput,
  ALLOWED_TOOLS
} from './utils/agentSimulator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'build' | 'sync'>('simulator');
  const [language, setLanguage] = useState<Language>('en');
  const [isListening, setIsListening] = useState(false);
  const [floatingOverlay, setFloatingOverlay] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showMemories, setShowMemories] = useState(false);
  const [input, setInput] = useState('');

  const [memories, setMemories] = useState([
    { key: 'target_device', value: 'Redmi 13C 5G (4GB RAM + 2GB Virtual)', category: 'hardware' },
    { key: 'primary_language', value: 'English / हिन्दी (Bilingual)', category: 'preference' },
    { key: 'security_policy', value: 'Mandatory confirmation for file sharing & downloads', category: 'security' },
    { key: 'allow_list', value: '8 native tools permitted. Shell/arbitrary code blocked.', category: 'policy' }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      text: 'Welcome to STRANGER. I am your private personal Android AI agent. My Jetpack Compose shell, bilingual speech engine, task planner, and security allow-list are active.',
      fromUser: false,
      timestamp: Date.now() - 60000,
      language: 'en'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      text: query,
      fromUser: true,
      timestamp: Date.now(),
      language
    };

    const task = planTaskForInput(query, language);

    let replyText = '';
    if (language === 'hi') {
      replyText = task
        ? 'मैंने आपके आदेश के लिए बहु-चरणीय कार्य योजना बनाई है। कृपया नीचे दी गई कार्रवाई की पुष्टि करें।'
        : `आदेश प्राप्त: "${query}"। STRANGER शेल व अनुमति सूची सक्रिय हैं। माइलस्टोन M2 में Gemini API को जोड़ा जाएगा।`;
    } else {
      replyText = task
        ? 'I have formulated a multi-step task for your request. Please review and confirm the action below.'
        : `Command received: "${query}". STRANGER shell and allow-list are active. Gemini reasoning engine is configured for M2.`;
    }

    const botMsg: ChatMessage = {
      id: 'bot-' + (Date.now() + 1),
      text: replyText,
      fromUser: false,
      timestamp: Date.now() + 500,
      language,
      task: task || undefined
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleSimulateVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const voiceSamples = language === 'hi'
        ? ['नवीनतम AKTU नोट्स PDF डाउनलोड करो', 'राहुल को WhatsApp पर असाइनमेंट भेजो', 'नमस्ते STRANGER, मौसम का हाल बताओ']
        : ['Download latest syllabus notes PDF', 'Share project document on WhatsApp', 'Search web for Android 15 features'];
      const randomPrompt = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
      handleSend(randomPrompt);
    }, 2400);
  };

  const handleConfirmTask = (task: AgentTask) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.task?.id === task.id) {
          return {
            ...m,
            task: {
              ...m.task,
              status: 'completed',
              steps: m.task.steps.map((s) => ({ ...s, status: 'done' }))
            }
          };
        }
        return m;
      })
    );

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'res-' + Date.now(),
          text: `Action "${task.actionProposal?.toolName}" confirmed by user. Execution completed safely through Android native intent.`,
          fromUser: false,
          timestamp: Date.now(),
          language
        }
      ]);
    }, 400);
  };

  const handleCancelTask = (task: AgentTask) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.task?.id === task.id) {
          return {
            ...m,
            task: {
              ...m.task,
              status: 'cancelled',
              steps: m.task.steps.map((s, idx) => (idx === 2 ? { ...s, status: 'failed' } : s))
            }
          };
        }
        return m;
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        id: 'res-' + Date.now(),
        text: `Action "${task.actionProposal?.toolName}" was cancelled. Zero data was transmitted or modified.`,
        fromUser: false,
        timestamp: Date.now(),
        language
      }
    ]);
  };

  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex h-screen w-screen bg-[#07080B] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#1B1E2B] bg-[#0B0C10] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Branding */}
          <div className="p-5 border-b border-[#1B1E2B] flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#9B8CFF] flex items-center justify-center shadow-lg shadow-purple-950/40">
              <Bot className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-widest text-slate-100 uppercase">
                STRANGER
              </h1>
              <span className="text-[10px] tracking-wider text-[#9B8CFF] font-semibold">
                ANDROID AI AGENT
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="p-3 space-y-1.5">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-[#1E1B33] text-[#9B8CFF] border border-[#3E3472]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141C]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Smartphone className="h-4 w-4" />
                <span>Redmi 13C Simulator</span>
              </div>
              <span className="text-[9px] bg-[#272346] text-[#B8A9FF] px-1.5 py-0.5 rounded font-mono">
                LIVE
              </span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-[#1E1B33] text-[#9B8CFF] border border-[#3E3472]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141C]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Code2 className="h-4 w-4" />
                <span>Kotlin Android Source</span>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                19 FILES
              </span>
            </button>

            <button
              onClick={() => setActiveTab('build')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'build'
                  ? 'bg-[#1E1B33] text-[#9B8CFF] border border-[#3E3472]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141C]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="h-4 w-4" />
                <span>Gradle Build & Tests</span>
              </div>
              <span className="text-[9px] bg-[#102B21] text-[#70D6C2] px-1.5 py-0.5 rounded font-mono font-bold">
                10/10 PASS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'sync'
                  ? 'bg-[#1E1B33] text-[#9B8CFF] border border-[#3E3472]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141C]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FolderGit2 className="h-4 w-4" />
                <span>GitHub Remote Sync</span>
              </div>
              <span className="text-[9px] bg-purple-950/60 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                main
              </span>
            </button>
          </nav>
        </div>

        {/* Device & Hardware Specs Box */}
        <div className="p-4 m-3 rounded-2xl bg-[#12141D] border border-[#212435] text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="text-slate-400">Target Phone</span>
            <span className="text-[#70D6C2]">Redmi 13C 5G</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Memory Budget</span>
            <span className="text-slate-200 font-mono">4 GB + 2 GB Ext</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Min / Target SDK</span>
            <span className="text-slate-200 font-mono">26 / 35 (Android 15)</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>APK Binary Size</span>
            <span className="text-[#9B8CFF] font-mono font-bold">16.0 MB</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-[#07080B] overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-[#1B1E2B] px-6 flex items-center justify-between shrink-0 bg-[#0B0C10]/80 backdrop-blur">
          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Repository:
            </span>
            <a
              href="https://github.com/adarshmadd115-oss/STRANGER"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#9B8CFF] hover:underline flex items-center space-x-1 font-mono"
            >
              <span>adarshmadd115-oss/STRANGER</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-slate-600">|</span>
            <span className="inline-flex items-center space-x-1.5 text-[11px] text-[#70D6C2] bg-[#122A23] px-2 py-0.5 rounded-full font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#70D6C2] animate-pulse" />
              <span>Allow-list Active</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Bilingual toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1A182E] border border-[#3E3472] text-xs font-semibold text-purple-200 hover:bg-[#252144] transition-colors"
            >
              <Languages className="h-3.5 w-3.5 text-[#9B8CFF]" />
              <span>{language === 'en' ? 'English (en-IN)' : 'हिन्दी (hi-IN)'}</span>
            </button>

            {/* Memory Modal Trigger */}
            <button
              onClick={() => setShowMemories(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#131622] border border-[#262B40] text-xs font-medium text-slate-300 hover:bg-[#1A1F30] transition-colors"
            >
              <Database className="h-3.5 w-3.5 text-[#70D6C2]" />
              <span>Memories ({memories.length})</span>
            </button>
          </div>
        </header>

        {/* Tab 1: Live Simulator */}
        {activeTab === 'simulator' && (
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            {/* Phone Container mimicking Redmi 13C 5G */}
            <div className="relative w-[390px] h-[780px] bg-[#0B0C10] rounded-[44px] p-3 shadow-2xl border-4 border-[#242738] flex flex-col justify-between overflow-hidden">
              {/* Notch & Speaker */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
                <div className="w-12 h-3.5 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#12141D]" />
                </div>
              </div>

              {/* Phone Top Bar */}
              <div className="pt-5 px-3 pb-2 flex items-center justify-between border-b border-[#1A1D2B]">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-lg bg-[#272346] flex items-center justify-center border border-[#9B8CFF]/40">
                    <Sparkles className="h-4 w-4 text-[#B8A9FF]" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black tracking-wider text-slate-100">
                      STRANGER
                    </h2>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tight">
                      M1 SHELL · REDMI 13C
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] bg-[#122A23] text-[#70D6C2] px-2 py-0.5 rounded font-mono font-semibold">
                    ONLINE
                  </span>
                </div>
              </div>

              {/* Floating Overlay simulation notification banner */}
              {floatingOverlay && (
                <div className="mx-3 mt-2 p-2.5 rounded-xl bg-[#1E2835] border border-[#70D6C2]/40 text-[11px] text-teal-100 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-[#70D6C2] animate-ping" />
                    <span>Floating Assistant active over apps</span>
                  </div>
                  <button
                    onClick={() => setFloatingOverlay(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
                {/* Security Status Card */}
                <div className="p-3 rounded-2xl bg-[#151720] border border-[#262A3B]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5 text-[#70D6C2]">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold tracking-wider uppercase">
                        Zero Shell Safety
                      </span>
                    </div>
                    <span className="text-[9px] bg-[#272346] text-[#B8A9FF] px-1.5 py-0.5 rounded font-mono font-semibold">
                      ALLOW-LIST
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Tool allow-list enforced. All downloads, messaging, and storage actions require explicit user confirmation.
                  </p>
                </div>

                {/* Quick action chips */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'hi' ? 'त्वरित आदेश' : 'Quick Actions'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleSend(language === 'hi' ? 'Syllabus PDF डाउनलोड करो' : 'Download syllabus notes PDF')}
                      className="px-2.5 py-1 rounded-full bg-[#1C1E2B] hover:bg-[#25283B] text-[10px] font-medium text-[#B8A9FF] border border-[#3E3472]/40"
                    >
                      📄 Download PDF
                    </button>
                    <button
                      onClick={() => handleSend(language === 'hi' ? 'WhatsApp पर नोट्स शेयर करो' : 'Share document on WhatsApp')}
                      className="px-2.5 py-1 rounded-full bg-[#1C1E2B] hover:bg-[#25283B] text-[10px] font-medium text-[#70D6C2] border border-[#214D41]/40"
                    >
                      💬 WhatsApp Share
                    </button>
                    <button
                      onClick={() => handleSend(language === 'hi' ? 'Android 15 के फीचर्स खोजो' : 'Search web for Android 15 features')}
                      className="px-2.5 py-1 rounded-full bg-[#1C1E2B] hover:bg-[#25283B] text-[10px] font-medium text-slate-300 border border-[#2C3042]"
                    >
                      🌐 Web Search
                    </button>
                  </div>
                </div>

                {/* Message items */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.fromUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl text-[12px] leading-relaxed ${
                        msg.fromUser
                          ? 'bg-[#312A54] text-white rounded-br-xs border border-[#4C427E]'
                          : 'bg-[#191C27] text-slate-100 rounded-bl-xs border border-[#282C3D]'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Embedded Task Plan Card */}
                      {msg.task && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-[#12141D] border border-[#2D3247] space-y-2 text-[11px]">
                          <div className="flex items-center justify-between border-b border-[#212435] pb-1.5">
                            <span className="font-bold text-[#9B8CFF]">
                              {msg.task.title}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                msg.task.status === 'completed'
                                  ? 'bg-teal-950 text-teal-300'
                                  : msg.task.status === 'cancelled'
                                  ? 'bg-red-950 text-red-300'
                                  : 'bg-amber-950 text-amber-300'
                              }`}
                            >
                              {msg.task.status}
                            </span>
                          </div>

                          <div className="font-mono text-[10px] text-slate-400 bg-black/40 p-1.5 rounded">
                            {msg.task.summary}
                          </div>

                          {/* Steps progress */}
                          <div className="space-y-1.5">
                            {msg.task.steps.map((st, i) => (
                              <div key={st.id} className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-300">
                                  {i + 1}. {st.title}
                                </span>
                                {st.status === 'done' ? (
                                  <CheckCircle2 className="h-3 w-3 text-[#70D6C2]" />
                                ) : st.status === 'running' ? (
                                  <span className="h-2 w-2 rounded-full bg-[#9B8CFF] animate-ping" />
                                ) : st.status === 'failed' ? (
                                  <XCircle className="h-3 w-3 text-red-400" />
                                ) : (
                                  <span className="text-slate-600 text-[9px]">WAIT</span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Confirmation Buttons Gate */}
                          {msg.task.requiresConfirmation && msg.task.status === 'awaiting_confirmation' && (
                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#212435]">
                              <button
                                onClick={() => handleCancelTask(msg.task!)}
                                className="px-2.5 py-1 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-950/40 text-[10px] font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleConfirmTask(msg.task!)}
                                className="px-3 py-1 rounded-lg bg-[#8F80F5] hover:bg-[#9B8CFF] text-black text-[10px] font-bold flex items-center space-x-1"
                              >
                                <Check className="h-3 w-3 text-black" />
                                <span>Confirm & Execute</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <span className="block text-[8px] text-slate-500 text-right mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Phone Floating Assistant Button */}
              <button
                onClick={() => setFloatingOverlay(!floatingOverlay)}
                className={`absolute bottom-20 right-5 h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                  floatingOverlay ? 'bg-[#70D6C2] text-black' : 'bg-[#8F80F5] text-black'
                }`}
                title="Toggle Floating Assistant"
              >
                <Bot className="h-5 w-5" />
              </button>

              {/* Listening pulse overlay */}
              {isListening && (
                <div className="mx-3 mb-2 p-3 rounded-2xl bg-[#251E3D] border border-[#9B8CFF] flex items-center justify-between text-xs text-purple-200 animate-pulse">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-[#70D6C2] animate-bounce" />
                    <span>{language === 'hi' ? 'STRANGER सुन रहा है...' : 'Listening to speech...'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#70D6C2]">en-IN / hi-IN</span>
                </div>
              )}

              {/* Input composer bottom bar */}
              <div className="p-2 border-t border-[#1A1D2B] bg-[#0E1017]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center space-x-1.5"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={language === 'hi' ? 'STRANGER को संदेश भेजें…' : 'Message STRANGER…'}
                    className="flex-1 bg-[#151720] border border-[#2A2E42] focus:border-[#9B8CFF] rounded-full px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
                  />

                  {/* Speech button */}
                  <button
                    type="button"
                    onClick={handleSimulateVoice}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-[#252238] border border-[#4C4570] text-[#B8A9FF] hover:bg-[#342F4F]'
                    }`}
                    title="Simulate Voice Input"
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="h-8 w-8 rounded-full bg-[#8F80F5] hover:bg-[#9B8CFF] disabled:opacity-40 text-black flex items-center justify-center font-bold"
                  >
                    <Send className="h-3.5 w-3.5 text-black" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[9px] text-slate-500 px-2 pt-1.5 font-mono">
                  <span>Redmi 13C 5G · Low-RAM mode</span>
                  <span className="text-[#70D6C2]">Allow-list enforced</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Kotlin Android Source Inspector */}
        {activeTab === 'code' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 mb-1">
                STRANGER Pure Android Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Pristine, clean Kotlin Jetpack Compose codebase initialized in repository{' '}
                <code className="text-[#9B8CFF] font-mono">adarshmadd115-oss/STRANGER</code>. All legacy LPG code has been eliminated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MainActivity.kt card */}
              <div className="p-4 rounded-2xl bg-[#0D0F16] border border-[#1E2235] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-[#9B8CFF]" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      app/src/main/java/.../MainActivity.kt
                    </span>
                  </div>
                  <button
                    onClick={() => copyText('MainActivity.kt source copied', 'main')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedCode === 'main' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode === 'main' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#050608] p-3 rounded-xl font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto space-y-1">
                  <div className="text-purple-400">package ai.stranger.app</div>
                  <div className="text-slate-500">// Dark theme, bilingual recognizer intent & Compose UI</div>
                  <div>val strangerColors = darkColorScheme(</div>
                  <div className="pl-4">primary = Color(0xFF9B8CFF),</div>
                  <div className="pl-4">secondary = Color(0xFF70D6C2),</div>
                  <div className="pl-4">background = Color(0xFF0B0C10)</div>
                  <div>)</div>
                  <div className="text-slate-400">// Fixed: eliminated internal RowColumnParentData.weight import</div>
                </div>
              </div>

              {/* ToolAllowList.kt card */}
              <div className="p-4 rounded-2xl bg-[#0D0F16] border border-[#1E2235] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-[#70D6C2]" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      app/src/main/java/.../ToolAllowList.kt
                    </span>
                  </div>
                  <button
                    onClick={() => copyText('ToolAllowList.kt source copied', 'allow')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedCode === 'allow' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode === 'allow' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#050608] p-3 rounded-xl font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto space-y-1">
                  <div className="text-purple-400">object ToolAllowList &#123;</div>
                  <div className="pl-4 text-teal-300">val ALLOWED_TOOLS = setOf(</div>
                  <div className="pl-8">"open_app", "search_files", "download_file",</div>
                  <div className="pl-8">"share_media", "web_search", "store_memory",</div>
                  <div className="pl-8">"view_memories", "delete_memory"</div>
                  <div className="pl-4">)</div>
                  <div className="text-slate-500">// Enforces regex package check, HTTPS check, and confirmation</div>
                  <div>&#125;</div>
                </div>
              </div>

              {/* GitHub Actions build-apk.yml */}
              <div className="p-4 rounded-2xl bg-[#0D0F16] border border-[#1E2235] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      .github/workflows/build-apk.yml
                    </span>
                  </div>
                  <button
                    onClick={() => copyText('build-apk.yml source copied', 'ci')}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedCode === 'ci' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode === 'ci' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#050608] p-3 rounded-xl font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto space-y-1">
                  <div className="text-amber-400">name: Build STRANGER APK</div>
                  <div>on: push: branches: [ main ]</div>
                  <div>jobs:</div>
                  <div className="pl-4">build: runs-on: ubuntu-latest</div>
                  <div className="pl-6 text-slate-400">gradle :app:testDebugUnitTest :app:assembleDebug</div>
                  <div className="pl-6 text-teal-400">upload-artifact: STRANGER-debug-APK</div>
                </div>
              </div>

              {/* Directory Structure */}
              <div className="p-4 rounded-2xl bg-[#0D0F16] border border-[#1E2235] space-y-3">
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Committed Project Structure
                  </span>
                </div>
                <div className="bg-[#050608] p-3 rounded-xl font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto space-y-1">
                  <div>📁 STRANGER/</div>
                  <div className="pl-4">├── 📁 .github/workflows/ (build-apk.yml)</div>
                  <div className="pl-4">├── 📁 app/src/main/ (Compose UI, Security, Models)</div>
                  <div className="pl-4">├── 📁 app/src/test/ (ToolAllowListTest, TaskPlanningTest)</div>
                  <div className="pl-4">├── 📁 gradle/ (libs.versions.toml, wrapper)</div>
                  <div className="pl-4">├── 📄 build.gradle.kts (Android app plugin)</div>
                  <div className="pl-4">├── 📄 settings.gradle.kts (rootProject = "STRANGER")</div>
                  <div className="pl-4">└── 📄 README.md (Architecture & roadmap)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Build & Verification Suite */}
        {activeTab === 'build' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 mb-1">
                Local Gradle Compilation & Automated Test Verification
              </h2>
              <p className="text-xs text-slate-400">
                Verified with local OpenJDK 17, Android SDK 36, and Gradle 9.3.1. Zero errors.
              </p>
            </div>

            {/* Build Result Card */}
            <div className="p-5 rounded-2xl bg-[#0D1814] border border-[#174635] flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-[#123629] flex items-center justify-center text-[#70D6C2]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-teal-100">
                      BUILD SUCCESSFUL
                    </span>
                    <span className="text-[10px] bg-[#122A23] text-[#70D6C2] px-2 py-0.5 rounded font-mono font-bold">
                      2m 29s
                    </span>
                  </div>
                  <p className="text-xs text-teal-300/80 mt-0.5">
                    Tasks: 41 actionable tasks executed (1 from cache). All compileKotlin, dex, and unit test checks passed.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="text-slate-400">Output APK:</div>
                <div className="text-[#70D6C2] font-bold">app-debug.apk (16 MB)</div>
              </div>
            </div>

            {/* Test Suite Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Executed Unit Tests (10 Tests — 100% Passed)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#0D0F16] border border-[#1E2235] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      ai.stranger.app.ToolAllowListTest
                    </span>
                    <span className="text-[10px] bg-teal-950 text-teal-300 font-mono px-2 py-0.5 rounded font-bold">
                      8/8 PASS
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>✓ testRejectArbitraryCommands</span>
                      <span className="text-slate-600 font-mono">1ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testRejectSystemCommandExecution</span>
                      <span className="text-slate-600 font-mono">7ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testValidOpenApp</span>
                      <span className="text-slate-600 font-mono">1ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testInvalidPackageNameRejected</span>
                      <span className="text-slate-600 font-mono">&lt;1ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testDownloadRequiresConfirmation</span>
                      <span className="text-slate-600 font-mono">&lt;1ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testDownloadRejectsInsecureHttp</span>
                      <span className="text-slate-600 font-mono">29ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testShareMediaRequiresConfirmation</span>
                      <span className="text-slate-600 font-mono">&lt;1ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testStoreAndSearchMemory</span>
                      <span className="text-slate-600 font-mono">&lt;1ms</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D0F16] border border-[#1E2235] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      ai.stranger.app.TaskPlanningTest
                    </span>
                    <span className="text-[10px] bg-teal-950 text-teal-300 font-mono px-2 py-0.5 rounded font-bold">
                      2/2 PASS
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>✓ testTaskPlanningTransitions</span>
                      <span className="text-slate-600 font-mono">70ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ testLanguageSelectionLocales (en-IN, hi-IN)</span>
                      <span className="text-slate-600 font-mono">1ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* APK Download & Installation Steps */}
            <div className="p-5 rounded-2xl bg-[#11131E] border border-[#232840] space-y-3">
              <div className="flex items-center space-x-2 text-[#9B8CFF]">
                <Download className="h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-100">
                  APK Generation & Physical Device Testing on Redmi 13C 5G
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The debug APK has been verified locally and is ready to be produced automatically by GitHub Actions:
              </p>
              <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-1">
                <li>
                  Push the committed code to GitHub repository <code className="text-[#9B8CFF] font-mono">adarshmadd115-oss/STRANGER</code>.
                </li>
                <li>
                  GitHub Actions will run <code className="text-[#70D6C2] font-mono">.github/workflows/build-apk.yml</code> on Ubuntu.
                </li>
                <li>
                  Go to <span className="text-slate-200 font-semibold">GitHub Actions tab &gt; Build STRANGER APK &gt; Artifacts</span>.
                </li>
                <li>
                  Download <code className="text-purple-300 font-mono">STRANGER-debug-APK.zip</code>, unzip, and transfer to your Redmi 13C 5G.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 4: GitHub Remote Sync Guide */}
        {activeTab === 'sync' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 mb-1">
                GitHub Repository Push Instructions
              </h2>
              <p className="text-xs text-slate-400">
                The new repository <code className="text-[#9B8CFF] font-mono">https://github.com/adarshmadd115-oss/STRANGER</code> was verified to be empty.
                All 19 source files have been initialized, tested, and committed locally to branch <code className="text-teal-400 font-mono">main</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0F16] border border-[#1E2235] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Option A: Push using your GitHub Personal Access Token (PAT)
              </h3>
              <p className="text-xs text-slate-400">
                Since cloud terminal sessions require write authorization, execute this single command using your GitHub Token:
              </p>
              <div className="bg-[#050608] p-3 rounded-xl flex items-center justify-between font-mono text-xs text-purple-300">
                <code>git push https://&lt;YOUR_GITHUB_TOKEN&gt;@github.com/adarshmadd115-oss/STRANGER.git main</code>
                <button
                  onClick={() =>
                    copyText(
                      'git push https://<YOUR_GITHUB_TOKEN>@github.com/adarshmadd115-oss/STRANGER.git main',
                      'pat'
                    )
                  }
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCode === 'pat' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0F16] border border-[#1E2235] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Option B: Clone directly from the STRANGER.bundle
              </h3>
              <p className="text-xs text-slate-400">
                We also packed the entire repository into a portable bundle file (<code className="text-teal-300 font-mono">STRANGER.bundle</code>, 63 KB).
                You can clone it anywhere:
              </p>
              <div className="bg-[#050608] p-3 rounded-xl flex items-center justify-between font-mono text-xs text-teal-300">
                <code>git clone STRANGER.bundle my-stranger-app</code>
                <button
                  onClick={() => copyText('git clone STRANGER.bundle my-stranger-app', 'bundle')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCode === 'bundle' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Memories & Preferences Modal */}
      {showMemories && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12141D] border border-[#272B40] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#212435] pb-3">
              <div className="flex items-center space-x-2 text-[#70D6C2]">
                <Database className="h-5 w-5" />
                <h3 className="font-bold text-sm text-slate-100">
                  Stored User Memories & Preferences
                </h3>
              </div>
              <button
                onClick={() => setShowMemories(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              STRANGER remembers user preferences locally on device. You have full transparency to inspect or delete any remembered item.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {memories.map((m) => (
                <div
                  key={m.key}
                  className="p-3 rounded-xl bg-[#181B27] border border-[#262A3B] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] text-[#B8A9FF] block">
                      {m.key} ({m.category})
                    </span>
                    <span className="text-slate-200">{m.value}</span>
                  </div>
                  <button
                    onClick={() => setMemories(memories.filter((x) => x.key !== m.key))}
                    className="p-1.5 rounded-lg hover:bg-red-950/40 text-red-400 transition-colors"
                    title="Delete Memory"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMemories(false)}
                className="px-4 py-2 rounded-xl bg-[#8F80F5] hover:bg-[#9B8CFF] text-black text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
