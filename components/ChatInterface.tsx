import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, AppTheme } from '../types';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSendMessage: (text: string, image?: string) => Promise<void>;
  isLoading: boolean;
  language: Language;
  theme: AppTheme;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, onSendMessage, isLoading, language, theme }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isId = language === Language.ID;
  const isFuturistic = theme === AppTheme.FUTURISTIC;
  const isElegant = theme === AppTheme.ELEGANT;
  const isModern = theme === AppTheme.MODERN;

  // Dynamic Styles
  const containerClass = isFuturistic
    ? "bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl"
    : isElegant
        ? "bg-white/90 backdrop-blur-md border border-stone-200 shadow-xl"
        : "bg-white border border-gray-200 shadow-xl";

  const userBubbleClass = isFuturistic
    ? "bg-gradient-to-br from-cyan-600 to-blue-600 border-cyan-400/50 text-white"
    : isElegant
        ? "bg-stone-800 text-stone-50 border-transparent"
        : "bg-blue-600 text-white";

  const modelBubbleClass = isFuturistic
    ? "bg-slate-800/80 border-slate-700 text-slate-200"
    : isElegant
        ? "bg-stone-100 border-stone-200 text-stone-800"
        : "bg-gray-100 border-gray-200 text-gray-800";

  const inputAreaClass = isFuturistic
    ? "bg-slate-950/80 backdrop-blur-xl border-white/5"
    : isElegant
        ? "bg-stone-50 border-stone-200"
        : "bg-gray-50 border-gray-200";

  const inputFieldClass = isFuturistic
    ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-600 focus:ring-cyan-500"
    : isElegant
        ? "bg-white border-stone-200 text-stone-800 placeholder-stone-400 focus:ring-emerald-500"
        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500";

  const sendBtnClass = isFuturistic
    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
    : isElegant
        ? "bg-stone-800 text-white hover:bg-stone-700"
        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md";


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading, selectedImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    
    // Create temp variables to pass
    const textToSend = inputText;
    const imgToSend = selectedImage ? selectedImage.split(',')[1] : undefined;
    
    // Clear UI immediately
    setInputText('');
    setSelectedImage(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    await onSendMessage(textToSend, imgToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-200px)] md:h-[650px] rounded-3xl overflow-hidden relative border ${containerClass}`}>
      
      {/* HUD Lines Decoration for Futuristic */}
      {isFuturistic && (
        <>
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-cyan-500/30 rounded-tl-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-cyan-500/30 rounded-br-3xl pointer-events-none"></div>
        </>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide z-10" ref={scrollRef}>
        {history.length === 0 && (
          <div className="text-center mt-20 animate-fade-in">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isFuturistic ? 'bg-cyan-900/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : isElegant ? 'bg-stone-100 border border-stone-200' : 'bg-blue-100'}`}>
                <span className="text-3xl animate-pulse">🤖</span>
            </div>
            <p className={`text-lg font-medium ${isFuturistic ? 'text-slate-300' : isElegant ? 'text-stone-600' : 'text-gray-700'}`}>{isId ? 'Sistem Nutrisi Online' : 'AI Nutrition System Online'}</p>
            <p className={`text-xs font-mono mt-2 tracking-widest uppercase ${isFuturistic ? 'text-cyan-500' : isElegant ? 'text-stone-400' : 'text-blue-500'}`}>{isId ? 'Menunggu Input...' : 'Awaiting Input...'}</p>
          </div>
        )}
        
        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-4 text-sm backdrop-blur-md border shadow-sm ${
                msg.role === 'user' 
                  ? `${userBubbleClass} rounded-br-sm` 
                  : `${modelBubbleClass} rounded-bl-sm`
              }`}
            >
              {msg.image && (
                <div className="relative mb-3 rounded-lg overflow-hidden border border-white/10">
                   <img src={msg.image} alt="Upload" className="w-full h-auto max-h-48 object-cover" />
                   {isFuturistic && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>}
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl rounded-bl-sm p-4 flex space-x-2 items-center border ${modelBubbleClass}`}>
              <span className={`text-xs font-mono mr-2 ${isFuturistic ? 'text-cyan-400' : 'text-gray-500'}`}>PROCESSING</span>
              <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isFuturistic ? 'bg-cyan-400' : 'bg-gray-400'}`}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-ping delay-75 ${isFuturistic ? 'bg-cyan-400' : 'bg-gray-400'}`}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-ping delay-150 ${isFuturistic ? 'bg-cyan-400' : 'bg-gray-400'}`}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t z-20 ${inputAreaClass}`}>
        {selectedImage && (
            <div className="relative inline-block mb-3 group">
                <img src={selectedImage} alt="Preview" className={`h-16 w-16 object-cover rounded-lg border shadow-md ${isFuturistic ? 'border-cyan-500/50' : 'border-gray-200'}`} />
                <button 
                    onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        )}
        <div className="flex items-end space-x-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl transition-all border ${isFuturistic ? 'text-cyan-400 hover:text-white hover:bg-cyan-500/20 bg-slate-900 border-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-white border-gray-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </button>
          
          <div className={`flex-1 rounded-xl flex items-center p-1 focus-within:ring-1 transition-all shadow-inner border ${inputFieldClass}`}>
            <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isId ? "Ketik makanan atau aktivitas..." : "Enter food or activity..."}
                className={`w-full bg-transparent border-none focus:ring-0 resize-none h-12 py-3 px-3 scrollbar-hide font-medium ${isFuturistic ? 'text-slate-100 placeholder-slate-600' : isElegant ? 'text-stone-800 placeholder-stone-400' : 'text-gray-900 placeholder-gray-400'}`}
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                (!inputText.trim() && !selectedImage) || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : `${sendBtnClass} transform hover:-translate-y-1`
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;