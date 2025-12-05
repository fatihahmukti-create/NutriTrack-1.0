import React, { useEffect, useState } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal, Language, AppTheme } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  theme: AppTheme;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, theme }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  // Theme Helpers
  const isFuturistic = theme === AppTheme.FUTURISTIC;
  const isElegant = theme === AppTheme.ELEGANT;
  const isModern = theme === AppTheme.MODERN;

  // Calculate TDEE using Mifflin-St Jeor Equation
  const calculateTDEE = (data: UserProfile): number => {
    let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
    bmr += data.gender === Gender.MALE ? 5 : -161;

    let multiplier = 1.2;
    switch (data.activity) {
      case ActivityLevel.SEDENTARY: multiplier = 1.2; break;
      case ActivityLevel.LIGHT: multiplier = 1.375; break;
      case ActivityLevel.MODERATE: multiplier = 1.55; break;
      case ActivityLevel.ACTIVE: multiplier = 1.725; break;
      case ActivityLevel.VERY_ACTIVE: multiplier = 1.9; break;
    }

    let tdee = Math.round(bmr * multiplier);

    // Adjust for goal
    if (data.goal === Goal.LOSE) tdee -= 500;
    else if (data.goal === Goal.GAIN) tdee += 300;

    return tdee;
  };

  useEffect(() => {
    const newTdee = calculateTDEE(formData);
    if (newTdee !== formData.tdee) {
        setFormData(prev => ({ ...prev, tdee: newTdee }));
    }
  }, [formData.weight, formData.height, formData.age, formData.gender, formData.activity, formData.goal]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    alert(formData.language === Language.ID ? "Profil tersimpan!" : "Profile saved!");
  };

  const labels = {
    title: formData.language === Language.ID ? "Konfigurasi Pengguna" : "User Configuration",
    name: formData.language === Language.ID ? "Nama" : "Name",
    age: formData.language === Language.ID ? "Umur" : "Age",
    weight: formData.language === Language.ID ? "Berat (kg)" : "Weight (kg)",
    height: formData.language === Language.ID ? "Tinggi (cm)" : "Height (cm)",
    gender: formData.language === Language.ID ? "Jenis Kelamin" : "Gender",
    activity: formData.language === Language.ID ? "Level Aktivitas" : "Activity Level",
    goal: formData.language === Language.ID ? "Tujuan" : "Goal",
    calcTdee: formData.language === Language.ID ? "Batas Energi Harian" : "Daily Energy Limit",
    customTarget: formData.language === Language.ID ? "Target Manual" : "Manual Target",
    save: formData.language === Language.ID ? "Simpan Data" : "Save Settings",
    lang: formData.language === Language.ID ? "Bahasa" : "Language",
    theme: formData.language === Language.ID ? "Tema Tampilan" : "Visual Theme",
  };

  // Dynamic Styles
  const containerClass = isFuturistic 
    ? "bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl" 
    : isElegant 
        ? "bg-white/80 backdrop-blur-md border border-stone-200 shadow-sm" 
        : "bg-white shadow-lg rounded-2xl border border-gray-100";
  
  const inputClass = isFuturistic
    ? "bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500 placeholder-slate-600"
    : isElegant
        ? "bg-stone-50 border-stone-200 text-stone-800 focus:border-emerald-500 placeholder-stone-400"
        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 placeholder-gray-400";
        
  const labelClass = isFuturistic 
    ? "text-cyan-400" 
    : isElegant 
        ? "text-stone-500" 
        : "text-blue-600";

  const btnClass = isFuturistic
    ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
    : isElegant
        ? "bg-stone-800 hover:bg-stone-700 text-stone-50"
        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md";

  return (
    <div className={`p-8 rounded-3xl max-w-2xl mx-auto relative overflow-hidden transition-all ${containerClass}`}>
      {/* Decorative blurred blob for Futuristic */}
      {isFuturistic && <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>}

      <h2 className={`text-2xl font-bold mb-8 tracking-wide uppercase ${isFuturistic ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400' : isElegant ? 'text-stone-800 font-serif' : 'text-gray-900'}`}>
        {labels.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Theme Selector */}
        <div className="md:col-span-2 mb-4">
             <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${labelClass}`}>{labels.theme}</label>
             <div className="grid grid-cols-3 gap-3">
                {Object.values(AppTheme).map((t) => (
                    <button
                        key={t}
                        onClick={() => handleChange('theme', t)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                            formData.theme === t 
                                ? isFuturistic ? 'bg-cyan-500 text-slate-900 border-cyan-400' : isElegant ? 'bg-stone-800 text-white border-stone-800' : 'bg-blue-600 text-white border-blue-600'
                                : isFuturistic ? 'bg-slate-900/50 text-slate-500 border-slate-700' : isElegant ? 'bg-white text-stone-500 border-stone-200' : 'bg-gray-100 text-gray-500 border-transparent'
                        }`}
                    >
                        {t}
                    </button>
                ))}
             </div>
        </div>

        <div>
          <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.name}</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full p-3 border rounded-xl outline-none transition-all ${inputClass}`}
          />
        </div>
        <div>
           <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.lang}</label>
           <div className={`flex p-1 rounded-xl border ${isFuturistic ? 'bg-slate-900/50 border-slate-700' : 'bg-transparent border-gray-200'}`}>
             <button 
                onClick={() => handleChange('language', Language.ID)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.language === Language.ID ? (isFuturistic ? 'bg-cyan-500 text-slate-900' : 'bg-gray-800 text-white') : 'text-gray-500'}`}
             >ID</button>
             <button 
                onClick={() => handleChange('language', Language.EN)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.language === Language.EN ? (isFuturistic ? 'bg-cyan-500 text-slate-900' : 'bg-gray-800 text-white') : 'text-gray-500'}`}
             >EN</button>
           </div>
        </div>

        <div>
          <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.age}</label>
          <input 
            type="number" 
            value={formData.age}
            onChange={(e) => handleChange('age', Number(e.target.value))}
            className={`w-full p-3 border rounded-xl outline-none transition-all ${inputClass}`}
          />
        </div>

        <div>
          <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.gender}</label>
          <div className="relative">
            <select 
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className={`w-full p-3 border rounded-xl outline-none appearance-none transition-all ${inputClass}`}
            >
                {Object.values(Gender).map(g => <option key={g} value={g} className={isFuturistic ? "bg-slate-900" : "bg-white"}>{g}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.weight}</label>
          <input 
            type="number" 
            value={formData.weight}
            onChange={(e) => handleChange('weight', Number(e.target.value))}
            className={`w-full p-3 border rounded-xl outline-none transition-all ${inputClass}`}
          />
        </div>

        <div>
          <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.height}</label>
          <input 
            type="number" 
            value={formData.height}
            onChange={(e) => handleChange('height', Number(e.target.value))}
            className={`w-full p-3 border rounded-xl outline-none transition-all ${inputClass}`}
          />
        </div>
        
        <div className="md:col-span-2">
            <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.activity}</label>
            <div className="relative">
                <select 
                    value={formData.activity}
                    onChange={(e) => handleChange('activity', e.target.value)}
                    className={`w-full p-3 border rounded-xl outline-none appearance-none transition-all ${inputClass}`}
                >
                    {Object.values(ActivityLevel).map(a => <option key={a} value={a} className={isFuturistic ? "bg-slate-900" : "bg-white"}>{a}</option>)}
                </select>
            </div>
        </div>
        
        <div className="md:col-span-2">
            <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.goal}</label>
             <div className="relative">
                <select 
                    value={formData.goal}
                    onChange={(e) => handleChange('goal', e.target.value)}
                    className={`w-full p-3 border rounded-xl outline-none appearance-none transition-all ${inputClass}`}
                >
                    {Object.values(Goal).map(g => <option key={g} value={g} className={isFuturistic ? "bg-slate-900" : "bg-white"}>{g}</option>)}
                </select>
             </div>
        </div>
      </div>

      <div className={`mt-8 pt-6 border-t relative z-10 ${isFuturistic ? 'border-white/10' : 'border-gray-200'}`}>
        <div className={`flex justify-between items-center mb-6 p-4 rounded-xl border ${isFuturistic ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <span className={isFuturistic ? 'text-slate-400' : 'text-gray-600'}>{labels.calcTdee}</span>
            <span className={`text-3xl font-bold ${isFuturistic ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : isElegant ? 'text-stone-800' : 'text-blue-600'}`}>{formData.tdee} <span className="text-sm font-normal text-gray-500">kcal</span></span>
        </div>
        
        <div className="mb-8">
             <label className={`block text-xs font-bold mb-2 uppercase ${labelClass}`}>{labels.customTarget}</label>
             <input 
                type="number" 
                placeholder={formData.tdee.toString()}
                value={formData.customCalorieTarget || ''}
                onChange={(e) => handleChange('customCalorieTarget', e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full p-3 border rounded-xl outline-none transition-all ${inputClass}`}
            />
        </div>

        <button 
            onClick={handleSave}
            className={`w-full font-bold py-4 rounded-xl transition-all transform hover:-translate-y-1 ${btnClass}`}
        >
            {labels.save}
        </button>
      </div>
    </div>
  );
};

export default Profile;