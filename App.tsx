
import React, { useState, useRef } from 'react';
import { SparklesIcon, PhotoIcon, BrainIcon, CopyIcon } from './components/Icons';
import { analyzeImage, performResearch, generateEnhancedPrompt } from './services/geminiService';
import { AppState, ResearchData, EnhancedResult, AppMode, NoCodePlatform, ExperienceLevel, FocusArea } from './types';

const App = () => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.TEXT_TO_PROMPT);
  
  // Architect Mode Settings
  const [platform, setPlatform] = useState<NoCodePlatform>('Bubble.io');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Principal (39 Yıl - Extreme)');
  const [focusArea, setFocusArea] = useState<FocusArea>('Genel Mimari');
  
  const [enhancedResult, setEnhancedResult] = useState<EnhancedResult | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (appMode !== AppMode.NO_CODE_ARCHITECT) {
        setAppMode(AppMode.IMAGE_TO_PROMPT);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleEnhance = async () => {
    if ((appMode === AppMode.TEXT_TO_PROMPT || appMode === AppMode.NO_CODE_ARCHITECT) && !promptInput.trim()) {
       setErrorMsg("Lütfen bir fikir yazın.");
       return;
    }
    if (appMode === AppMode.IMAGE_TO_PROMPT && !selectedFile) {
       setErrorMsg("Lütfen bir resim yükleyin.");
       return;
    }

    try {
      setAppState(AppState.ANALYZING_IMAGE);
      setErrorMsg('');
      setEnhancedResult(null);
      setResearchData(null);

      // 1. Analyze Image
      let imageContext = "";
      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        imageContext = await analyzeImage(base64, selectedFile.type);
      }

      // 2. Research
      setAppState(AppState.RESEARCHING);
      const research = await performResearch(promptInput, imageContext, appMode, platform);
      setResearchData(research);

      // 3. Generate Strict JSON
      setAppState(AppState.THINKING);
      const result = await generateEnhancedPrompt(
        promptInput, 
        research, 
        imageContext, 
        appMode, 
        platform,
        experienceLevel,
        focusArea
      );
      
      setEnhancedResult({
        originalPrompt: promptInput,
        correctedInput: result.correctedInput,
        enhancedPrompt: result.enhancedPrompt,
        rationale: result.rationale
      });

      setAppState(AppState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Bir hata oluştu.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center py-10 px-4 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="mb-10 text-center max-w-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex items-center justify-center space-x-3 mb-2 relative z-10">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <BrainIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            JSON Prompt Architect
          </h1>
        </div>
        <p className="text-slate-400 text-sm font-medium">
          Düzensiz fikirleri <span className="text-indigo-400">Yapılandırılmış JSON Formatına</span> dönüştürür.
        </p>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setAppMode(AppMode.TEXT_TO_PROMPT)}
            className={`flex-1 py-4 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              appMode === AppMode.TEXT_TO_PROMPT 
                ? 'bg-slate-800/50 text-indigo-400 border-b-2 border-indigo-500' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            Fikir → Görsel
          </button>
          <button
            onClick={() => setAppMode(AppMode.IMAGE_TO_PROMPT)}
            className={`flex-1 py-4 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              appMode === AppMode.IMAGE_TO_PROMPT
                ? 'bg-slate-800/50 text-indigo-400 border-b-2 border-indigo-500' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            Görsel → JSON
          </button>
          <button
            onClick={() => setAppMode(AppMode.NO_CODE_ARCHITECT)}
            className={`flex-1 py-4 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              appMode === AppMode.NO_CODE_ARCHITECT
                ? 'bg-slate-800/50 text-emerald-400 border-b-2 border-emerald-500' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            No-Code Mimar 🏗️
          </button>
        </div>

        <div className="p-6 md:p-8">
          
          {/* No-Code Settings Panel */}
          {appMode === AppMode.NO_CODE_ARCHITECT && (
             <div className="mb-6 animate-in fade-in slide-in-from-top-2 space-y-4">
                
                {/* Platform Selector */}
                <div>
                  <label className="block text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
                    Hedef Platform
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Bubble.io', 'FlutterFlow', 'Webflow', 'Custom Code (React/Node)'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p as NoCodePlatform)}
                        className={`text-xs py-2 px-2 rounded-lg border transition-all truncate ${
                          platform === p 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Architect Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Mimar Deneyimi
                    </label>
                    <select 
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="Junior (MVP)">Junior (Hızlı MVP)</option>
                      <option value="Senior (Best Practice)">Senior (Standart)</option>
                      <option value="Principal (39 Yıl - Extreme)">Principal (39 Yıl - Detaycı)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Odak Alanı
                    </label>
                    <select 
                      value={focusArea}
                      onChange={(e) => setFocusArea(e.target.value as FocusArea)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    >
                      <option value="Genel Mimari">Genel Mimari</option>
                      <option value="Veritabanı Odaklı">Veritabanı Şeması</option>
                      <option value="Güvenlik Odaklı">Güvenlik & Kurallar</option>
                      <option value="UX/Akış Odaklı">UX & Kullanıcı Akışı</option>
                    </select>
                  </div>
                </div>
             </div>
          )}

          {/* Text Mode Input */}
          <div className={`transition-all duration-300 ${appMode === AppMode.TEXT_TO_PROMPT || appMode === AppMode.NO_CODE_ARCHITECT ? 'block' : 'hidden'}`}>
             <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex justify-between">
               <span>
                 {appMode === AppMode.NO_CODE_ARCHITECT ? 'Uygulama Fikrini Anlat' : 'Aklındaki Sahneyi Anlat'}
                 <span className="opacity-50 font-normal normal-case ml-2">(Hatalı yazabilirsin, biz düzeltiriz)</span>
               </span>
               {appMode === AppMode.NO_CODE_ARCHITECT && <span className="text-emerald-500 font-bold">Uzman Modu</span>}
             </label>
             <textarea
               className={`w-full h-32 bg-slate-950 border rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-all resize-none text-base ${
                 appMode === AppMode.NO_CODE_ARCHITECT 
                  ? 'border-emerald-900/50 focus:border-emerald-500/50 focus:ring-emerald-500/50' 
                  : 'border-slate-800 focus:border-indigo-500/50 focus:ring-indigo-500/50'
               }`}
               placeholder={appMode === AppMode.NO_CODE_ARCHITECT 
                 ? `Örn: ${platform} ile çalışan bir e-ticaret uygulaması...` 
                 : "Örn: Asansörde ayna karşısında selfie çeken şapkalı bir kız..."}
               value={promptInput}
               onChange={(e) => setPromptInput(e.target.value)}
             />
          </div>

          {/* Image Mode Input */}
          <div className={`transition-all duration-300 ${appMode === AppMode.IMAGE_TO_PROMPT ? 'block' : 'hidden'}`}>
             <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
               Analiz Edilecek Görseli Yükle
             </label>
             <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-700 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group ${previewUrl ? 'border-none p-0 overflow-hidden bg-black' : ''}`}
             >
                {previewUrl ? (
                  <div className="relative w-full h-full group-hover:opacity-75 transition-opacity">
                    <img src={previewUrl} alt="Upload" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">Resmi Değiştir</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <PhotoIcon className="w-10 h-10 text-slate-600 group-hover:text-indigo-400 mb-3 transition-colors" />
                    <span className="text-slate-500 group-hover:text-slate-300">Resim seçmek için tıkla</span>
                  </>
                )}
             </div>
             <input
               type="file"
               ref={fileInputRef}
               onChange={handleFileChange}
               accept="image/*"
               className="hidden"
             />
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center">
               <span className="mr-2">⚠️</span> {errorMsg}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleEnhance}
            disabled={appState !== AppState.IDLE && appState !== AppState.COMPLETED && appState !== AppState.ERROR}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all transform active:scale-[0.99] shadow-lg ${
              appState === AppState.IDLE || appState === AppState.COMPLETED || appState === AppState.ERROR
                ? (appMode === AppMode.NO_CODE_ARCHITECT ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30 text-white' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30 text-white')
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {appState === AppState.IDLE || appState === AppState.COMPLETED || appState === AppState.ERROR ? (
              <span className="flex items-center justify-center space-x-2">
                <SparklesIcon className="w-5 h-5" />
                <span>{appMode === AppMode.NO_CODE_ARCHITECT ? 'Master Prompt Oluştur' : 'JSON Oluştur'}</span>
              </span>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span>
                   {appState === AppState.ANALYZING_IMAGE && 'Görsel Okunuyor...'}
                   {appState === AppState.RESEARCHING && (appMode === AppMode.NO_CODE_ARCHITECT ? `${platform} Dokümanları Taranıyor...` : 'Detaylar Araştırılıyor...')}
                   {appState === AppState.THINKING && (appMode === AppMode.NO_CODE_ARCHITECT ? 'Sistem Mimarisi Çiziliyor...' : 'JSON Yapısı Kuruluyor...')}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {enhancedResult && appState === AppState.COMPLETED && (
        <div className="w-full max-w-4xl mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Left Column: Stats & Corrected Input */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Detected Input Correction */}
            {(enhancedResult.correctedInput || enhancedResult.originalPrompt) && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Algılanan İstek</h3>
                 <p className="text-slate-300 text-sm leading-relaxed italic">
                   "{enhancedResult.correctedInput || enhancedResult.originalPrompt}"
                 </p>
              </div>
            )}

            {/* Rationale */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className={`${appMode === AppMode.NO_CODE_ARCHITECT ? 'text-emerald-400' : 'text-indigo-400'} text-xs font-bold uppercase mb-2`}>
                {appMode === AppMode.NO_CODE_ARCHITECT ? 'Baş Mimarın Notları' : 'AI Mantığı'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {enhancedResult.rationale}
              </p>
            </div>

            {/* Research Sources */}
            {researchData && researchData.sources.length > 0 && (
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-blue-500 text-xs font-bold uppercase mb-2">Kaynaklar</h3>
                <ul className="space-y-2">
                  {researchData.sources.slice(0, 3).map((s, i) => (
                    <li key={i}>
                      <a href={s.uri} target="_blank" className="text-xs text-slate-500 hover:text-blue-400 truncate block transition-colors">
                        ↗ {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: The JSON Output */}
          <div className="lg:col-span-2">
            <div className={`relative bg-[#0F131D] border rounded-xl overflow-hidden shadow-2xl ${
              appMode === AppMode.NO_CODE_ARCHITECT ? 'border-emerald-500/20 shadow-emerald-900/10' : 'border-indigo-500/20 shadow-indigo-900/10'
            }`}>
              
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#161b27] border-b border-indigo-500/10">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-indigo-300 font-mono">
                  <span>{appMode === AppMode.NO_CODE_ARCHITECT ? 'architect_spec.json' : 'generated_prompt.json'}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(enhancedResult.enhancedPrompt)}
                  className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 hover:text-white transition-colors group"
                  title="Kopyala"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Code Body */}
              <div className="p-0 overflow-x-auto custom-scrollbar">
                <pre className="text-xs sm:text-sm font-mono text-blue-100 p-5 leading-relaxed">
                  {/* Basic syntax highlighting simulation */}
                  <code dangerouslySetInnerHTML={{
                    __html: enhancedResult.enhancedPrompt
                      .replace(/"([^"]+)":/g, '<span class="text-indigo-400">"$1"</span>:') // Keys
                      .replace(/: "([^"]+)"/g, ': <span class="text-emerald-300">"$1"</span>') // String Values
                      .replace(/: ([0-9]+)/g, ': <span class="text-orange-400">$1</span>') // Numbers
                      .replace(/: (true|false)/g, ': <span class="text-purple-400">$1</span>') // Booleans
                  }} />
                </pre>
              </div>
              
              {/* Copy Action Footer */}
              <div className="absolute bottom-4 right-4">
                 <button 
                   onClick={() => copyToClipboard(enhancedResult.enhancedPrompt)}
                   className={`${
                     appMode === AppMode.NO_CODE_ARCHITECT ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
                   } text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all flex items-center space-x-2`}
                 >
                   <CopyIcon className="w-3 h-3" />
                   <span>{appMode === AppMode.NO_CODE_ARCHITECT ? 'Master Prompt\'u Kopyala' : 'JSON Kopyala'}</span>
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
