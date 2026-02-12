import React, { useState, useEffect } from 'react';
import { StagingStyle, AppState, RoomType, Preset } from './types';
import { STAGING_STYLES, ROOM_TYPES } from './constants';
import { stageRoomImage, analyzeRoomWithThinking } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import Button from './components/Button';
import ComparisonSlider from './components/ComparisonSlider';
import { 
  CheckCircle2, 
  ChevronLeft, 
  Download, 
  LayoutTemplate, 
  RefreshCcw, 
  Sparkles,
  Home,
  AlertCircle,
  Upload,
  Save,
  Trash2,
  BrainCircuit
} from 'lucide-react';

const App = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.UPLOAD);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StagingStyle | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('Living Room');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Presets & AI State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('stagecraft_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  // Scroll to top on state change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentState]);

  const savePresetToStorage = (newPresets: Preset[]) => {
    localStorage.setItem('stagecraft_presets', JSON.stringify(newPresets));
    setPresets(newPresets);
  };

  const handleSavePreset = () => {
    if (!selectedStyle || !presetNameInput.trim()) return;
    
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetNameInput,
      roomType: selectedRoomType,
      style: selectedStyle,
      timestamp: Date.now()
    };

    const updatedPresets = [...presets, newPreset];
    savePresetToStorage(updatedPresets);
    setPresetNameInput('');
    setShowSavePreset(false);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    savePresetToStorage(updated);
  };

  const handleLoadPreset = (preset: Preset) => {
    setSelectedRoomType(preset.roomType);
    setSelectedStyle(preset.style);
    setErrorMsg(null);
  };

  const handleAIAnalysis = async () => {
    if (!originalImage) return;
    
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      // Use Thinking Mode to analyze
      const { roomType, suggestedStyle } = await analyzeRoomWithThinking(originalImage);
      setSelectedRoomType(roomType);
      setSelectedStyle(suggestedStyle);
    } catch (err) {
      console.error(err);
      setErrorMsg("AI Analysis failed. Please try selecting a style manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageSelected = (base64: string) => {
    setOriginalImage(base64);
    setCurrentState(AppState.SELECT_STYLE);
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!originalImage || !selectedStyle) return;

    setCurrentState(AppState.PROCESSING);
    setErrorMsg(null);

    try {
      const resultImage = await stageRoomImage(originalImage, selectedStyle, selectedRoomType);
      setGeneratedImage(resultImage);
      setCurrentState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to stage the room. The AI model might be busy or the image content was rejected. Please try again.");
      setCurrentState(AppState.SELECT_STYLE);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setSelectedStyle(null);
    setCurrentState(AppState.UPLOAD);
  };

  const handleBack = () => {
    if (currentState === AppState.RESULT) {
      setCurrentState(AppState.SELECT_STYLE);
    } else if (currentState === AppState.SELECT_STYLE) {
      setOriginalImage(null);
      setCurrentState(AppState.UPLOAD);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `staged-room-${selectedStyle?.name}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">StageCraft<span className="text-blue-600">AI</span></h1>
          </div>
          {currentState !== AppState.UPLOAD && (
             <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-slate-800">
               New Project
             </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* State: Upload */}
        {currentState === AppState.UPLOAD && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-10 max-w-lg">
              <h2 className="text-4xl font-bold mb-4 text-slate-900">Virtual Staging for Modern Agents</h2>
              <p className="text-lg text-slate-600">
                Transform empty or outdated properties into stunning, furnished homes in seconds. 
                Upload a photo to get started.
              </p>
            </div>
            <ImageUploader onImageSelected={handleImageSelected} />
            
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-4xl w-full">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                 <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Home className="w-5 h-5" />
                 </div>
                 <h3 className="font-semibold mb-1">Hyper-Realistic</h3>
                 <p className="text-sm text-slate-500">Maintains room structure while adding lifelike furniture.</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                 <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                   <LayoutTemplate className="w-5 h-5" />
                 </div>
                 <h3 className="font-semibold mb-1">Multiple Styles</h3>
                 <p className="text-sm text-slate-500">Choose from Modern, Rustic, Luxury, and more.</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                   <RefreshCcw className="w-5 h-5" />
                 </div>
                 <h3 className="font-semibold mb-1">Instant Results</h3>
                 <p className="text-sm text-slate-500">Get staged photos ready for MLS in under 30 seconds.</p>
              </div>
            </div>
          </div>
        )}

        {/* State: Select Style */}
        {currentState === AppState.SELECT_STYLE && originalImage && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="mb-6 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">Customize Staging</h2>
               </div>
               
               <Button 
                  variant="secondary" 
                  onClick={handleAIAnalysis} 
                  isLoading={isAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                  icon={<BrainCircuit className="w-4 h-4" />}
                >
                  AI Advisor
                </Button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left: Preview & Type */}
               <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Original Photo</h3>
                   <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                     <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Room Type</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {ROOM_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedRoomType(type)}
                          className={`px-3 py-2 text-sm rounded-md transition-all border ${
                            selectedRoomType === type 
                              ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                 </div>

                 {/* Presets Section */}
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Saved Presets</h3>
                    {presets.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No saved presets yet. Configure a style and save it.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {presets.map((preset) => (
                          <div 
                            key={preset.id}
                            onClick={() => handleLoadPreset(preset)}
                            className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{preset.name}</p>
                              <p className="text-xs text-slate-500 truncate">{preset.roomType} • {preset.style.name}</p>
                            </div>
                            <button 
                              onClick={(e) => handleDeletePreset(preset.id, e)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               </div>

               {/* Right: Styles */}
               <div className="lg:col-span-2">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold">Select Interior Style</h3>
                   {selectedStyle && (
                     <div className="relative">
                        {!showSavePreset ? (
                           <button 
                            onClick={() => setShowSavePreset(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                           >
                             <Save className="w-4 h-4 mr-1" /> Save Preset
                           </button>
                        ) : (
                          <div className="absolute right-0 top-0 mt-[-8px] bg-white shadow-xl border border-slate-200 p-3 rounded-lg z-20 flex gap-2 w-72">
                            <input 
                              type="text" 
                              placeholder="Preset Name" 
                              className="flex-1 text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                              value={presetNameInput}
                              onChange={(e) => setPresetNameInput(e.target.value)}
                              autoFocus
                            />
                            <button 
                              onClick={handleSavePreset}
                              disabled={!presetNameInput.trim()}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setShowSavePreset(false)}
                              className="text-slate-500 px-2"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                     </div>
                   )}
                 </div>
                 
                 {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  {/* Custom/AI Style Display if selected */}
                  {selectedStyle?.isCustom && (
                    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <BrainCircuit className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">AI SUGGESTION</span>
                           <h4 className="font-bold text-lg text-indigo-900">{selectedStyle.name}</h4>
                        </div>
                        <p className="text-indigo-800 text-sm mb-3">{selectedStyle.description}</p>
                        <p className="text-indigo-600 text-xs font-mono bg-white/50 p-2 rounded border border-indigo-100">
                           {selectedStyle.promptModifier}
                        </p>
                      </div>
                    </div>
                  )}

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {STAGING_STYLES.map((style) => (
                     <div 
                       key={style.id}
                       onClick={() => setSelectedStyle(style)}
                       className={`
                         group cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all duration-200
                         ${selectedStyle?.id === style.id ? 'border-blue-600 ring-2 ring-blue-100 ring-offset-2' : 'border-transparent hover:border-slate-300'}
                       `}
                     >
                       <div className="aspect-video bg-slate-200 relative">
                         <img src={style.image} alt={style.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                         <div className="absolute bottom-3 left-3 text-white">
                           <h4 className="font-bold text-lg">{style.name}</h4>
                           <p className="text-xs text-white/80 line-clamp-1">{style.description}</p>
                         </div>
                         {selectedStyle?.id === style.id && (
                           <div className="absolute top-3 right-3 bg-blue-600 text-white p-1 rounded-full">
                             <CheckCircle2 className="w-4 h-4" />
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="mt-8 sticky bottom-4 z-10">
                   <Button 
                    fullWidth 
                    size="lg" 
                    className="shadow-lg text-lg h-14"
                    disabled={!selectedStyle}
                    onClick={handleGenerate}
                   >
                     Generate Staged Room
                   </Button>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* State: Processing */}
        {currentState === AppState.PROCESSING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
             <div className="relative">
               <div className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
               </div>
             </div>
             <h3 className="mt-8 text-2xl font-bold text-slate-800">Staging your room...</h3>
             <p className="mt-2 text-slate-500 max-w-md text-center">
               Our AI is analyzing the architecture and applying the <span className="font-semibold text-blue-600">{selectedStyle?.name}</span> style. This usually takes about 10-15 seconds.
             </p>
          </div>
        )}

        {/* State: Result */}
        {currentState === AppState.RESULT && originalImage && generatedImage && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
               <div className="flex items-center gap-2">
                 <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                   <ChevronLeft className="w-5 h-5 text-slate-600" />
                 </button>
                 <h2 className="text-2xl font-bold text-slate-900">Staging Complete</h2>
               </div>
               <div className="flex gap-3">
                 <Button variant="outline" onClick={() => setCurrentState(AppState.SELECT_STYLE)}>
                   Try Different Style
                 </Button>
                 <Button onClick={downloadImage} icon={<Download className="w-4 h-4" />}>
                   Download HD Image
                 </Button>
               </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              <div className="p-1 bg-slate-50 border-b border-slate-200 flex justify-center py-2">
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Slide to Compare
                 </p>
              </div>
              <ComparisonSlider beforeImage={originalImage} afterImage={generatedImage} />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Pro Tip</h3>
                <p className="text-blue-700 text-sm">
                  This image is ready for your MLS listing. Download it and try generating a "Night" or "Dusk" version by describing lighting in your next prompt, or simply try a different style like "{selectedStyle?.id === 'modern' ? 'Bohemian' : 'Modern'}" to give clients options.
                </p>
              </div>
              <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={handleReset}>
                <div className="text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Upload Another Room</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;