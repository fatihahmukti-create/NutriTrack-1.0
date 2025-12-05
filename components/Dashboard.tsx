import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { UserProfile, FoodLogEntry, ActivityLogEntry, Language, AppTheme, DailyInsight } from '../types';

interface DashboardProps {
  user: UserProfile;
  logs: FoodLogEntry[];
  activityLogs: ActivityLogEntry[];
  dailyInsight: DailyInsight | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, logs, activityLogs, dailyInsight }) => {
  const isId = user.language === Language.ID;
  const targetCalories = user.customCalorieTarget || user.tdee;
  
  const consumedCalories = logs.reduce((acc, log) => acc + log.calories, 0);
  const burnedCalories = activityLogs.reduce((acc, log) => acc + log.caloriesBurned, 0);
  const netCalories = Math.max(0, consumedCalories - burnedCalories);
  const remainingCalories = targetCalories - netCalories;
  
  const macros = logs.reduce((acc, log) => ({
    protein: acc.protein + log.protein,
    carbs: acc.carbs + log.carbs,
    fat: acc.fat + log.fat,
  }), { protein: 0, carbs: 0, fat: 0 });

  const progressPercentage = Math.min(100, (netCalories / targetCalories) * 100);

  // Theme Logic
  const isFuturistic = user.theme === AppTheme.FUTURISTIC;
  const isElegant = user.theme === AppTheme.ELEGANT;
  const isModern = user.theme === AppTheme.MODERN;

  // Colors
  const colors = {
    protein: isFuturistic ? '#22d3ee' : isElegant ? '#059669' : '#3b82f6', // Cyan/Emerald/Blue
    carbs: isFuturistic ? '#a855f7' : isElegant ? '#d97706' : '#8b5cf6',   // Purple/Amber/Violet
    fat: isFuturistic ? '#f472b6' : isElegant ? '#be123c' : '#ef4444',     // Pink/Rose/Red
    remaining: isFuturistic ? '#1e293b' : isElegant ? '#e7e5e4' : '#e5e7eb',
    textPrimary: isFuturistic ? 'text-white' : isElegant ? 'text-stone-800' : 'text-gray-900',
    textSecondary: isFuturistic ? 'text-slate-400' : isElegant ? 'text-stone-500' : 'text-gray-500',
    cardBg: isFuturistic 
      ? 'bg-white/5 backdrop-blur-md border border-white/10 glow-box' 
      : isElegant 
        ? 'bg-white border border-stone-200 shadow-sm' 
        : 'bg-white border border-gray-100 shadow-lg',
  };

  const macroData = [
    { name: isId ? 'Protein' : 'Protein', value: macros.protein, color: colors.protein },
    { name: isId ? 'Karbo' : 'Carbs', value: macros.carbs, color: colors.carbs },
    { name: isId ? 'Lemak' : 'Fat', value: macros.fat, color: colors.fat },
  ];

  const weightData = [
    { day: 'M', weight: user.weight + 0.5 },
    { day: 'T', weight: user.weight + 0.2 },
    { day: 'W', weight: user.weight },
    { day: 'T', weight: user.weight - 0.2 },
    { day: 'F', weight: user.weight - 0.4 },
    { day: 'S', weight: user.weight - 0.5 },
    { day: 'S', weight: user.weight - 0.6 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calorie Card */}
        <div className={`relative overflow-hidden p-6 rounded-3xl group transition-all ${colors.cardBg}`}>
            {isFuturistic && <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-24 h-24 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
            </div>}
            
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 ${isFuturistic ? 'text-cyan-400' : isElegant ? 'text-stone-500' : 'text-blue-500'}`}>{isId ? 'Status Energi' : 'Energy Status'}</h3>
                    <div className="flex items-baseline mt-2">
                        <span className={`text-4xl font-bold tracking-tight ${colors.textPrimary}`}>{netCalories}</span>
                        <span className={`text-sm ml-2 ${colors.textSecondary}`}>/ {targetCalories} kcal</span>
                    </div>
                    <div className="flex gap-4 mt-4">
                         <div>
                            <p className={`text-[10px] uppercase ${colors.textSecondary}`}>{isId ? 'Masuk' : 'In'}</p>
                            <p className={`text-sm font-mono ${isElegant ? 'text-emerald-700' : 'text-emerald-500'}`}>+{consumedCalories}</p>
                         </div>
                         <div className={`border-l pl-4 ${isFuturistic ? 'border-white/10' : 'border-gray-200'}`}>
                            <p className={`text-[10px] uppercase ${colors.textSecondary}`}>{isId ? 'Keluar' : 'Out'}</p>
                            <p className={`text-sm font-mono ${isElegant ? 'text-amber-700' : 'text-amber-500'}`}>-{burnedCalories}</p>
                         </div>
                    </div>
                </div>
                <div className="h-24 w-24 relative">
                     <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={colors.remaining}
                            strokeWidth="2"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={remainingCalories < 0 ? "#f87171" : colors.protein} 
                            strokeWidth="2"
                            strokeDasharray={`${progressPercentage}, 100`}
                            strokeLinecap="round"
                            className={isFuturistic ? "drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]" : ""}
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className={`text-xs font-bold ${colors.textPrimary}`}>{Math.round(progressPercentage)}%</span>
                     </div>
                </div>
            </div>
        </div>

        {/* Macro Card */}
        <div className={`p-6 rounded-3xl ${colors.cardBg}`}>
             <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isFuturistic ? 'text-cyan-400' : isElegant ? 'text-stone-500' : 'text-blue-500'}`}>{isId ? 'Komposisi Nutrisi' : 'Nutrient Composition'}</h3>
             <div className="flex items-center">
                <div className="h-24 w-24 flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={macroData}
                                innerRadius={28}
                                outerRadius={38}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                            >
                                {macroData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="ml-6 flex-1 space-y-3">
                    {macroData.map((macro) => (
                        <div key={macro.name} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-sm mr-3" style={{ backgroundColor: macro.color }}></div>
                                <span className={`${colors.textSecondary}`}>{macro.name}</span>
                            </div>
                            <span className={`font-mono font-bold ${colors.textPrimary}`}>{macro.value}g</span>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Logs List */}
        <div className={`md:col-span-2 p-6 rounded-3xl ${colors.cardBg}`}>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isFuturistic ? 'text-cyan-400' : isElegant ? 'text-stone-500' : 'text-blue-500'}`}>{isId ? 'Log Asupan' : 'Intake Log'}</h3>
            {logs.length === 0 ? (
                <div className={`text-center py-8 border border-dashed rounded-2xl ${isFuturistic ? 'border-slate-700' : 'border-gray-200'}`}>
                    <p className={`text-sm ${colors.textSecondary}`}>{isId ? 'Belum ada data terekam.' : 'No data recorded yet.'}</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
                    {logs.slice().reverse().map((log) => (
                        <div key={log.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${isFuturistic ? 'bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50' : 'bg-gray-50 border border-gray-100'}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-xl ${isFuturistic ? 'bg-slate-800 text-cyan-500' : 'bg-white text-blue-500 shadow-sm'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`font-semibold text-sm ${colors.textPrimary}`}>{log.name}</p>
                                    <p className={`text-[10px] uppercase tracking-wide ${colors.textSecondary}`}>{log.mealType}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-sm font-mono ${colors.textPrimary}`}>+{log.calories} <span className="text-xs font-sans font-normal opacity-60">kcal</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Activity Logs List */}
        <div className={`md:col-span-1 p-6 rounded-3xl ${colors.cardBg}`}>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isElegant ? 'text-amber-700' : 'text-amber-500'}`}>{isId ? 'Log Aktivitas' : 'Activity Log'}</h3>
            {activityLogs.length === 0 ? (
                <div className={`text-center py-8 border border-dashed rounded-2xl ${isFuturistic ? 'border-slate-700' : 'border-gray-200'}`}>
                    <p className={`text-sm ${colors.textSecondary}`}>{isId ? 'Belum ada aktivitas.' : 'No activity recorded.'}</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
                    {activityLogs.slice().reverse().map((log) => (
                        <div key={log.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${isFuturistic ? 'bg-slate-900/50 border border-slate-800' : 'bg-gray-50 border border-gray-100'}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-xl ${isFuturistic ? 'bg-slate-800 text-amber-500' : 'bg-white text-amber-500 shadow-sm'}`}>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`font-semibold text-sm truncate max-w-[100px] ${colors.textPrimary}`}>{log.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-sm font-mono ${isElegant ? 'text-amber-700' : 'text-amber-500'}`}>-{log.caloriesBurned}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Weight Chart */}
      <div className={`p-6 rounded-3xl ${colors.cardBg}`}>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isFuturistic ? 'text-cyan-400' : isElegant ? 'text-stone-500' : 'text-blue-500'}`}>{isId ? 'Progres Berat Badan' : 'Mass Trajectory'}</h3>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weightData}>
                    <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isElegant ? '#059669' : '#3b82f6'} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={isElegant ? '#059669' : '#3b82f6'} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: isFuturistic ? '#64748b' : '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{ 
                            backgroundColor: isFuturistic ? '#0f172a' : '#ffffff', 
                            borderRadius: '12px', 
                            border: isFuturistic ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                            color: isFuturistic ? '#fff' : '#1f2937',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }} 
                    />
                    <Bar dataKey="weight" fill="url(#colorWeight)" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* NEW: AI Insights & Evaluation Section */}
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <h2 className={`text-xl font-bold ${colors.textPrimary}`}>{isId ? 'Saran & Evaluasi AI' : 'AI Insights & Evaluation'}</h2>
        </div>

        {dailyInsight ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Motivation Card */}
                 <div className={`p-6 rounded-3xl relative overflow-hidden ${colors.cardBg}`}>
                    <div className={`absolute top-0 right-0 p-4 opacity-20 transform rotate-12 ${isElegant ? 'text-amber-500' : 'text-yellow-400'}`}>
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isElegant ? 'text-amber-600' : 'text-yellow-500'}`}>{isId ? 'Motivasi Harian' : 'Daily Motivation'}</h3>
                    <p className={`text-lg font-medium italic leading-relaxed ${colors.textPrimary}`}>"{dailyInsight.motivation}"</p>
                 </div>

                 {/* Next Meal Suggestion */}
                 <div className={`p-6 rounded-3xl relative overflow-hidden ${colors.cardBg}`}>
                    <div className={`absolute top-0 right-0 p-4 opacity-20 transform -rotate-12 ${isElegant ? 'text-emerald-500' : 'text-green-500'}`}>
                         <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/></svg>
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isElegant ? 'text-emerald-600' : 'text-green-500'}`}>{isId ? 'Saran Makanan Selanjutnya' : 'Next Meal Suggestion'}</h3>
                    <p className={`text-md leading-relaxed ${colors.textPrimary}`}>{dailyInsight.nextMealSuggestion}</p>
                 </div>

                 {/* Detailed Food Highlights */}
                 {dailyInsight.foodInsights && dailyInsight.foodInsights.length > 0 && (
                     <div className="md:col-span-2">
                         <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${colors.textSecondary}`}>{isId ? 'Highlight Makanan Terakhir' : 'Last Meal Highlights'}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dailyInsight.foodInsights.map((insight, idx) => (
                                <div key={idx} className={`p-5 rounded-2xl border ${isFuturistic ? 'bg-slate-900/40 border-slate-700' : isElegant ? 'bg-stone-50 border-stone-200' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-bold ${colors.textPrimary}`}>{insight.foodName}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${isFuturistic ? 'bg-cyan-900 text-cyan-400' : 'bg-white shadow-sm text-gray-600'}`}>Analysis</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className={`font-semibold ${isFuturistic ? 'text-cyan-200' : isElegant ? 'text-emerald-700' : 'text-blue-700'}`}>Nutrisi: </span>
                                            <span className={colors.textSecondary}>{insight.nutritional_highlight}</span>
                                        </div>
                                        <div>
                                            <span className={`font-semibold ${isFuturistic ? 'text-pink-200' : isElegant ? 'text-rose-700' : 'text-red-700'}`}>Dampak: </span>
                                            <span className={colors.textSecondary}>{insight.health_impact}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                 )}
            </div>
        ) : (
            <div className={`p-8 text-center border border-dashed rounded-3xl ${isFuturistic ? 'border-slate-800' : 'border-gray-300'}`}>
                <p className={colors.textSecondary}>{isId ? 'Log makanan Anda untuk mendapatkan wawasan mendalam.' : 'Log your food to unlock detailed insights.'}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;