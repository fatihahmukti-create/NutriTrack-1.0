import React, { useState, useEffect } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal, FoodLogEntry, ActivityLogEntry, ChatMessage, Language, AppTheme, DailyInsight } from './types';
import { analyzeMessage } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Profile from './components/Profile';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'profile'>('dashboard');

  // User State
  const [user, setUser] = useState<UserProfile>({
    name: 'User',
    age: 25,
    gender: Gender.FEMALE,
    weight: 60,
    height: 165,
    activity: ActivityLevel.MODERATE,
    goal: Goal.MAINTAIN,
    tdee: 2000,
    language: Language.ID,
    theme: AppTheme.FUTURISTIC,
  });

  // Data State
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);

  // Initial greeting
  useEffect(() => {
    if (chatHistory.length === 0) {
       const greeting = user.language === Language.ID 
        ? "Halo! Saya NutriTrack AI. Siap membantu nutrisi dan aktivitasmu." 
        : "System Online. I'm NutriTrack AI. Ready to optimize your nutrition and activity.";
       setChatHistory([{ id: 'init', role: 'model', text: greeting }]);
    }
  }, [user.language]);

  const handleSendMessage = async (text: string, imageBase64?: string) => {
    // 1. Add user message to history
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        text: text,
        image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined
    };
    
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setAiLoading(true);

    // 2. Call AI Service
    const aiResponse = await analyzeMessage(
        text, 
        imageBase64, 
        updatedHistory, 
        user, 
        logs
    );

    // 3. Process Response
    setAiLoading(false);
    
    // Add AI text reply to chat
    const aiMsgId = (Date.now() + 1).toString();
    setChatHistory(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: aiResponse.reply
    }]);

    // Update daily insights (motivation, food analysis, etc.)
    if (aiResponse.daily_motivation || aiResponse.next_meal_suggestion) {
        setDailyInsight({
            motivation: aiResponse.daily_motivation || "Stay consistent!",
            nextMealSuggestion: aiResponse.next_meal_suggestion || "Healthy balanced meal.",
            foodInsights: (aiResponse.food_analysis || []).map(f => ({
                foodName: f.name,
                nutritional_highlight: f.nutritional_highlight,
                health_impact: f.health_impact
            }))
        });
    }

    // Add Food Log if detected
    if (aiResponse.food_entry) {
        const newLog: FoodLogEntry = {
            id: Date.now().toString(),
            name: aiResponse.food_entry.name,
            calories: aiResponse.food_entry.calories,
            protein: aiResponse.food_entry.protein,
            carbs: aiResponse.food_entry.carbs,
            fat: aiResponse.food_entry.fat,
            timestamp: Date.now(),
            mealType: (aiResponse.food_entry.meal_type_suggestion as any) || 'Snack'
        };
        setLogs(prev => [...prev, newLog]);
    }

    // Add Activity Log if detected
    if (aiResponse.activity_entry) {
        const newActivity: ActivityLogEntry = {
            id: Date.now().toString(),
            name: aiResponse.activity_entry.name,
            caloriesBurned: aiResponse.activity_entry.calories_burned,
            timestamp: Date.now()
        };
        setActivityLogs(prev => [...prev, newActivity]);
    }

    // Switch to dashboard automatically on mobile after logging significant events
    if (window.innerWidth < 768 && (aiResponse.food_entry || aiResponse.activity_entry)) {
         // Optional: setActiveTab('dashboard');
    }
  };

  const isId = user.language === Language.ID;
  const isFuturistic = user.theme === AppTheme.FUTURISTIC;
  const isElegant = user.theme === AppTheme.ELEGANT;
  const isModern = user.theme === AppTheme.MODERN;

  // Global Theme Styles
  const bgClass = isFuturistic
    ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100"
    : isElegant
        ? "bg-stone-50 text-stone-800"
        : "bg-gray-50 text-gray-900";

  const navClass = isFuturistic
    ? "bg-slate-950/70 backdrop-blur-xl border-b border-white/5"
    : isElegant
        ? "bg-white/90 backdrop-blur-md border-b border-stone-200"
        : "bg-white border-b border-gray-200 shadow-sm";

  const brandTextClass = isFuturistic
    ? "text-white"
    : isElegant
        ? "text-stone-800 font-serif"
        : "text-blue-900";

  const activeTabClass = isFuturistic
    ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
    : isElegant
        ? "bg-stone-800 text-stone-50"
        : "bg-blue-600 text-white shadow-md";

  const inactiveTabClass = isFuturistic
    ? "text-slate-400 hover:text-white hover:bg-white/5"
    : isElegant
        ? "text-stone-500 hover:text-stone-900 hover:bg-stone-200"
        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50";

  return (
    <div className={`min-h-screen font-sans pb-24 md:pb-0 transition-colors duration-500 ${bgClass} selection:bg-cyan-500/30`}>
      
      {/* Background Effect for Futuristic */}
      {isFuturistic && <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>}

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-500 ${navClass}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8 flex items-center justify-center">
                    {isFuturistic && <div className="absolute inset-0 bg-cyan-500 blur-md opacity-50 rounded-lg"></div>}
                    <div className={`relative w-full h-full rounded-lg flex items-center justify-center font-bold ${isFuturistic ? 'bg-slate-900 border border-cyan-500/50 text-cyan-400' : isElegant ? 'bg-stone-800 text-stone-50' : 'bg-blue-600 text-white'}`}>N</div>
                </div>
                <h1 className={`text-xl font-bold tracking-tight ${brandTextClass}`}>
                  Nutri<span className={isFuturistic ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 glow-text' : isElegant ? 'text-emerald-700' : 'text-blue-600'}>Track</span>
                </h1>
                <span className={`px-2 py-0.5 rounded sm:inline-block hidden font-mono tracking-widest uppercase text-[10px] ${isFuturistic ? 'bg-cyan-900/30 border border-cyan-500/30 text-cyan-400' : isElegant ? 'bg-stone-200 text-stone-600' : 'bg-blue-100 text-blue-600'}`}>v3.0 Themes</span>
            </div>
            <div className={`hidden md:flex space-x-1 p-1 rounded-full border ${isFuturistic ? 'bg-white/5 border-white/10' : isElegant ? 'bg-stone-100 border-stone-200' : 'bg-gray-100 border-gray-200'}`}>
                 {['dashboard', 'chat', 'profile'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          activeTab === tab ? activeTabClass : inactiveTabClass
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                 ))}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
            <Dashboard 
                user={user} 
                logs={logs} 
                activityLogs={activityLogs} 
                dailyInsight={dailyInsight} 
            />
        )}
        
        {activeTab === 'chat' && (
             <ChatInterface 
                history={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={aiLoading}
                language={user.language}
                theme={user.theme}
             />
        )}
        
        {activeTab === 'profile' && (
            <Profile user={user} onUpdate={setUser} theme={user.theme} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={`fixed bottom-4 left-4 right-4 md:hidden z-50 rounded-2xl shadow-2xl ${isFuturistic ? 'bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-black/50' : 'bg-white border border-gray-200 shadow-gray-300'}`}>
        <div className="flex justify-around items-center h-16 px-2">
            {[
              { id: 'dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Dashboard' },
              { id: 'chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'AI Chat' },
              { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile' }
            ].map((item) => (
              <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                    activeTab === item.id 
                        ? (isFuturistic ? 'text-cyan-400' : isElegant ? 'text-stone-800' : 'text-blue-600') 
                        : (isFuturistic ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')
                  }`}
              >
                  {activeTab === item.id && (
                    <span className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-b-full ${isFuturistic ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : isElegant ? 'bg-stone-800' : 'bg-blue-600'}`}></span>
                  )}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            ))}
        </div>
      </nav>
    </div>
  );
};

export default App;