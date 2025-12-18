
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, Map, BookOpen, Layout, Plus, Trash2, ChevronRight, PenTool, 
  Folder, FileText, Loader2, CheckCircle, X, AlertTriangle, Maximize2, 
  Link as LinkIcon, Heart, Zap, Library, Info, UserCircle, 
  Dna, MessageSquare, Save, Type, Settings, Sparkles, Pencil,
  Minimize2, Monitor, HelpCircle, Target, Compass, Bold, Italic, Underline, 
  List, Heading1, Quote, Lightbulb, RefreshCcw, MoreHorizontal, User,
  UserSearch, Dna as BioIcon, Search, Command, Download, Wand2, GitBranch, ArrowRightLeft,
  GripVertical, Move, Check, AlignJustify, AlignLeft, Flame, Trophy, Coffee, UploadCloud, DownloadCloud
} from 'lucide-react';
import { db, NovelExtended } from './services/mockDb';
import { Novel, Part, Chapter, Character, Location, Relation, Idea, TrashItem } from './types';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";

// --- CITAS MOTIVACIONALES ---
const LITERARY_QUOTES = [
  { text: "No escribas para ser leído, escribe para ser libre.", author: "Anónimo" },
  { text: "El primer borrador es solo tú contándote la historia a ti mismo.", author: "Terry Pratchett" },
  { text: "Escribir es un oficio que se aprende escribiendo.", author: "Simone de Beauvoir" },
  { text: "No esperes a que llegue la inspiración. Hay que ir a buscarla con un mazo.", author: "Jack London" },
  { text: "Tu historia importa. Nadie puede contarla como tú.", author: "Refugio Creativo" },
  { text: "Cada palabra es un paso hacia un mundo nuevo.", author: "NovelCraft" }
];

// --- COMPONENTES UI BASE ---

const MotivationalQuote = () => {
  const quote = useMemo(() => LITERARY_QUOTES[Math.floor(Math.random() * LITERARY_QUOTES.length)], []);
  return (
    <div className="p-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Quote size={24} className="text-amber-500 mb-4 opacity-50" />
      <p className="text-xl font-serif italic text-amber-900 dark:text-amber-200 leading-relaxed">"{quote.text}"</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mt-4">— {quote.author}</p>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-3xl" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-gray-900 rounded-[3rem] w-full ${maxWidth} shadow-2xl border dark:border-gray-800 overflow-hidden flex flex-col max-h-[95vh]`}>
        <div className="flex justify-between items-center p-8 border-b dark:border-gray-800 shrink-0">
          <h3 className="text-2xl font-display italic tracking-tight uppercase flex items-center gap-3">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
};

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, loading = false, type = "button", size = "md", disabled = false }: any) => {
  const variants: any = {
    primary: "bg-amber-600 text-white hover:bg-amber-700 shadow-xl shadow-amber-600/20",
    secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-gray-800 dark:text-gray-200",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    ghost: "text-stone-500 hover:bg-stone-100",
    outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-50",
    rose: "bg-rose-500 text-white hover:bg-rose-600"
  };
  const sizes: any = { sm: "px-4 py-2 text-xs rounded-xl", md: "px-6 py-3 rounded-2xl", lg: "px-10 py-5 text-lg rounded-[2.5rem]" };
  return (
    <button type={type} disabled={loading || disabled} onClick={onClick} className={`flex items-center justify-center gap-2 transition-all active:scale-95 font-bold disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading ? <Loader2 className="animate-spin" size={18} /> : Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const InputField = ({ label, name, defaultValue, placeholder, type = "text", isTextArea = false, autoFocus = false }: any) => (
  <div className="space-y-1.5 flex-1 min-w-[150px]">
    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{label}</label>
    {isTextArea ? (
      <textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={4} className="w-full bg-stone-50 dark:bg-gray-950 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-amber-500 outline-none resize-none" autoFocus={autoFocus} />
    ) : (
      <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-stone-50 dark:bg-gray-950 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-amber-500 outline-none" autoFocus={autoFocus} />
    )}
  </div>
);

const SidebarLink = ({ active, onClick, icon: Icon, label, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all ${active ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20 scale-[1.02]' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-gray-800'}`}>
    <div className="flex items-center gap-4"><Icon size={20} strokeWidth={active ? 3 : 2} /> <span className={`text-sm font-bold ${active ? 'tracking-wide' : ''}`}>{label}</span></div>
    {badge !== undefined && badge > 0 && <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${active ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-700'}`}>{badge}</span>}
  </button>
);

// --- MAIN APP ---

export default function App() {
  const [currentNovelId, setCurrentNovelId] = useState<string | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [parts, setParts] = useState<Part[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldData, setWorldData] = useState<Location[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [novelMeta, setNovelMeta] = useState<Novel | null>(null);
  const [modalConfig, setModalConfig] = useState<any>({ open: false, type: '', data: null });

  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'part' | 'chapter' } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    setNovels(db.getNovels());
    const handleKeyDown = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(prev => !prev); } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!currentNovelId) { setNovels(db.getNovels()); return; }
    const novel = [...db.getNovels(), ...db.getDeletedNovels()].find(n => n.id === currentNovelId);
    if (novel) { setNovelMeta(novel); refreshData(); }
  }, [currentNovelId]);

  const refreshData = () => { 
    if (!currentNovelId) return; 
    setParts(db.getCollection(currentNovelId, 'parts')); 
    setChapters(db.getCollection(currentNovelId, 'chapters')); 
    setCharacters(db.getCollection(currentNovelId, 'characters')); 
    setWorldData(db.getCollection(currentNovelId, 'world')); 
    setRelations(db.getCollection(currentNovelId, 'relations'));
    setIdeas(db.getCollection(currentNovelId, 'ideas')); 
    setTrash(db.getCollection(currentNovelId, 'trash')); 
  };

  const openModal = (type: string, data = null) => { setModalConfig({ open: true, type, data }); setIsQuickMenuOpen(false); };
  const closeModal = () => setModalConfig({ open: false, type: '', data: null });

  const toggleZenMode = () => { setIsZenMode(!isZenMode); if (!isZenMode) document.documentElement.requestFullscreen?.(); else if (document.fullscreenElement) document.exitFullscreen?.(); };
  const handleDeleteItem = (collection: any, id: string) => { if (!currentNovelId) return; db.deleteToTrash(currentNovelId, collection, id); refreshData(); if (collection === 'chapters' && selectedChapterId === id) setSelectedChapterId(null); };

  const handleDragStart = (id: string, type: 'part' | 'chapter') => setDraggedItem({ id, type });
  const handleDragOver = (e: React.DragEvent, targetId: string) => { e.preventDefault(); e.stopPropagation(); setDropTarget(targetId); };
  const handleDragEnd = () => { setDraggedItem(null); setDropTarget(null); };

  const handleDropChapter = (targetPartId: string, afterChapterId?: string) => {
    if (!draggedItem || draggedItem.type !== 'chapter' || !currentNovelId) return;
    let newChapters = [...chapters];
    const draggedIdx = newChapters.findIndex(c => c.id === draggedItem.id);
    if (draggedIdx === -1) return;
    const [movedChapter] = newChapters.splice(draggedIdx, 1);
    movedChapter.partId = targetPartId;
    if (afterChapterId) {
        const targetIdx = newChapters.findIndex(c => c.id === afterChapterId);
        newChapters.splice(targetIdx + 1, 0, movedChapter);
    } else {
        const firstInPartIdx = newChapters.findIndex(c => c.partId === targetPartId);
        if (firstInPartIdx === -1) newChapters.push(movedChapter);
        else newChapters.splice(firstInPartIdx, 0, movedChapter);
    }
    const finalChapters = newChapters.map((c, i) => ({ ...c, order: i }));
    db.updateCollectionOrder(currentNovelId, 'chapters', finalChapters);
    refreshData();
    handleDragEnd();
  };

  const saveNovelTitle = (newTitle: string) => {
    if (!currentNovelId || !newTitle.trim()) { setIsEditingTitle(false); return; }
    db.updateNovel(currentNovelId, { title: newTitle, lastModified: Date.now() });
    setNovelMeta(prev => prev ? { ...prev, title: newTitle } : null);
    setNovels(db.getNovels());
    setIsEditingTitle(false);
  };

  const generateManuscriptPDF = (novelTitle: string, parts: Part[], chapters: Chapter[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = 40;

    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.text(novelTitle.toUpperCase(), pageWidth / 2, 80, { align: 'center' });

    const sortedParts = [...parts].sort((a, b) => a.order - b.order);
    sortedParts.forEach((part) => {
      doc.addPage();
      cursorY = 50;
      doc.setFont("times", "bold");
      doc.setFontSize(20);
      doc.text(part.name.toUpperCase(), margin, cursorY);
      cursorY += 20;

      const partChapters = chapters
        .filter(c => c.partId === part.id)
        .sort((a, b) => a.order - b.order);

      partChapters.forEach((chap) => {
        if (cursorY > 250) { doc.addPage(); cursorY = 30; }
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.text(chap.title, margin, cursorY);
        cursorY += 15;
        doc.setFont("times", "normal");
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(chap.content || "", maxLineWidth);
        splitText.forEach((line: string) => {
          if (cursorY > 275) { doc.addPage(); cursorY = 30; }
          doc.text(line, margin, cursorY);
          cursorY += 7;
        });
        cursorY += 15;
      });
    });
    doc.save(`${novelTitle.replace(/\s+/g, '_')}_Manuscrito.pdf`);
  };

  if (!currentNovelId) return <LibraryView novels={novels} deletedNovels={db.getDeletedNovels()} onSelect={setCurrentNovelId} onCreate={(t: string) => { const n = db.addNovel(t); setNovels(db.getNovels()); setCurrentNovelId(n.id); setActiveTab('dashboard'); }} onDelete={(id: string) => { db.deleteNovel(id); setNovels(db.getNovels()); }} onRestore={(id: string) => { db.restoreNovel(id); setNovels(db.getNovels()); }} onPermanentDelete={(id: string) => { db.permanentDeleteNovel(id); setNovels(db.getNovels()); }} onRefreshLibrary={() => setNovels(db.getNovels())} />;

  const currentChapter = chapters.find(c => c.id === selectedChapterId);

  return (
    <div className="flex h-screen bg-paper dark:bg-gray-950 text-stone-900 dark:text-stone-100 overflow-hidden font-sans">
      <aside className={`${isSidebarOpen && !isZenMode ? 'w-80' : 'w-0'} bg-stone-50/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-stone-200 dark:border-gray-800 transition-all duration-500 flex flex-col z-20 overflow-hidden shrink-0`}>
        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-white/40 dark:bg-gray-900/40 shrink-0">
          <button onClick={() => setCurrentNovelId(null)} className="flex items-center gap-3 group transition-all">
            <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-lg group-hover:rotate-12 transition-transform shadow-amber-600/20"><PenTool size={20} /></div>
            <h1 className="font-display text-2xl tracking-tighter uppercase italic font-black">Studio</h1>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-stone-200 rounded-xl transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
          <div className="relative">
             <Button variant="primary" className="w-full justify-between py-4 shadow-amber-600/30" onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)} icon={Plus}>Nueva Idea<ChevronRight size={18} className={`transition-transform duration-300 ${isQuickMenuOpen ? 'rotate-90' : ''}`} /></Button>
             {isQuickMenuOpen && (
               <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-stone-100 dark:border-gray-700 p-3 z-50 animate-in fade-in slide-in-from-top-4">
                 <button onClick={() => openModal('newPart')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-amber-50 dark:hover:bg-gray-800 rounded-2xl text-sm font-bold transition-all"><Folder size={16} className="text-amber-500" /> Nueva Parte</button>
                 <button onClick={() => openModal('newChapter')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-amber-50 dark:hover:bg-gray-800 rounded-2xl text-sm font-bold transition-all"><FileText size={16} className="text-emerald-500" /> Escena Nueva</button>
                 <button onClick={() => openModal('newCharacter')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-amber-50 dark:hover:bg-gray-800 rounded-2xl text-sm font-bold transition-all"><User size={16} className="text-rose-500" /> Protagonista</button>
                 <button onClick={() => openModal('newIdea')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-amber-50 dark:hover:bg-gray-800 rounded-2xl text-sm font-bold transition-all"><Lightbulb size={16} className="text-amber-500" /> Nueva Chispa</button>
               </div>
             )}
          </div>
          <nav className="space-y-1.5">
            <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={Layout} label="Mi Escritorio" />
            <SidebarLink active={activeTab === 'writing'} onClick={() => setActiveTab('writing')} icon={PenTool} label="Espacio de Trabajo" />
            <SidebarLink active={activeTab === 'ideas'} onClick={() => setActiveTab('ideas')} icon={Lightbulb} label="Chispas" badge={ideas.length} />
            <SidebarLink active={activeTab === 'characters'} onClick={() => setActiveTab('characters')} icon={Users} label="Personajes" />
            <SidebarLink active={activeTab === 'world'} onClick={() => setActiveTab('world')} icon={Map} label="Geografía" />
            <SidebarLink active={activeTab === 'trash'} onClick={() => setActiveTab('trash')} icon={Trash2} label="Cementerio" badge={trash.length} />
          </nav>
          
          <div className="pt-6 border-t border-stone-200 dark:border-gray-800">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] px-2 mb-6 block italic">La Arquitectura</span>
            <div className="space-y-6">
              <div 
                onDragOver={(e) => handleDragOver(e, "no-section")}
                onDrop={() => handleDropChapter("")}
                className={`transition-all rounded-[2rem] p-1.5 min-h-[20px] ${dropTarget === "no-section" ? 'bg-amber-100 dark:bg-amber-900/20 scale-105 ring-2 ring-amber-500' : ''}`}
              >
                {chapters.filter(c => !c.partId || !parts.some(p => p.id === c.partId)).map((chap) => (
                  <div key={chap.id} draggable onDragStart={() => handleDragStart(chap.id, 'chapter')} onDragEnd={handleDragEnd} className={`flex items-center group/chap cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-gray-800 rounded-2xl py-2 px-3 transition-all border border-transparent ${selectedChapterId === chap.id ? 'bg-white shadow-lg border-amber-100' : ''}`}>
                    <GripVertical size={14} className="text-stone-300 opacity-20 group-hover/chap:opacity-100 mr-2" />
                    <button onClick={() => { setSelectedChapterId(chap.id); setActiveTab('writing'); }} className={`flex-1 text-left text-xs font-bold truncate ${selectedChapterId === chap.id ? 'text-amber-700 font-black' : 'text-stone-500'}`}>{chap.title}</button>
                    <button onClick={() => handleDeleteItem('chapters', chap.id)} className="p-1 text-stone-300 hover:text-rose-500 opacity-0 group-hover/chap:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                {parts.sort((a,b) => a.order - b.order).map((part) => (
                  <div key={part.id} onDragOver={(e) => handleDragOver(e, part.id)} onDrop={(e) => { e.preventDefault(); handleDropChapter(part.id); }} className={`transition-all rounded-[2.5rem] p-3 border-2 border-transparent ${dropTarget === part.id ? 'bg-amber-50 border-amber-400 border-dashed scale-105' : ''}`}>
                    <div className="flex items-center justify-between px-3 mb-4 group">
                      <div className="flex items-center gap-3 text-[11px] font-black text-stone-600 uppercase tracking-tighter"><div className="p-2 bg-stone-100 dark:bg-gray-800 rounded-xl"><Folder size={14} className="text-amber-600" /></div>{part.name}</div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('editPart', part)} className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => handleDeleteItem('parts', part.id)} className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <div className="ml-5 border-l-2 border-amber-100 dark:border-amber-900/30 pl-3 space-y-2">
                      {chapters.filter(c => c.partId === part.id).sort((a,b) => a.order - b.order).map((chap) => (
                        <div key={chap.id} draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(chap.id, 'chapter'); }} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, chap.id)} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDropChapter(part.id, chap.id); }} className={`flex items-center group/chap cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-gray-800 rounded-2xl py-2 px-3 transition-all border border-transparent ${selectedChapterId === chap.id ? 'bg-white shadow-xl border-amber-50 ring-2 ring-amber-500/10' : ''} ${dropTarget === chap.id ? 'border-t-4 border-t-amber-500 pt-3' : ''}`}>
                          <GripVertical size={14} className="text-stone-300 opacity-10 group-hover/chap:opacity-100 mr-2" />
                          <button onClick={() => { setSelectedChapterId(chap.id); setActiveTab('writing'); }} className={`flex-1 text-left text-[11px] font-bold truncate ${selectedChapterId === chap.id ? 'text-amber-700 font-black' : 'text-stone-500'}`}>{chap.title}</button>
                          <button onClick={() => handleDeleteItem('chapters', chap.id)} className="p-1 text-stone-300 hover:text-rose-500 opacity-0 group-hover/chap:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-paper dark:bg-gray-950">
        <header className={`${isZenMode ? 'h-0 opacity-0 overflow-hidden' : 'h-20'} border-b border-stone-200 dark:border-gray-800 flex items-center justify-between px-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl z-10 transition-all duration-500 shrink-0`}>
          <div className="flex items-center gap-6 group">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 hover:bg-stone-200 dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"><Maximize2 size={20}/></button>}
            <div className="flex items-center gap-3 group/title relative">
              {isEditingTitle ? (
                <input 
                  autoFocus 
                  defaultValue={novelMeta?.title} 
                  onBlur={(e) => saveNovelTitle(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') saveNovelTitle((e.target as HTMLInputElement).value); }}
                  className="bg-stone-100 dark:bg-gray-800 border-none outline-none px-5 py-2.5 rounded-2xl text-xl font-display italic font-black uppercase tracking-tighter"
                />
              ) : (
                <>
                  <h1 onDoubleClick={() => setIsEditingTitle(true)} className="font-display text-2xl italic uppercase tracking-tighter decoration-amber-500/30 underline decoration-4 underline-offset-4 cursor-text select-none font-black">{novelMeta?.title}</h1>
                  <button onClick={() => setIsEditingTitle(true)} className="p-2 bg-stone-100 dark:bg-gray-800 rounded-xl text-stone-400 hover:text-amber-600 transition-all opacity-0 group-hover/title:opacity-100"><Pencil size={16} /></button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => generateManuscriptPDF(novelMeta?.title || "Obra", parts, chapters)} className="p-3 text-stone-400 hover:text-amber-600 transition-colors" title="Exportar Manuscrito PDF"><Download size={24}/></button>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-900/30">
               <Flame size={18} className="text-amber-600 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">Racha de Escritura</span>
            </div>
            <button onClick={() => setCurrentNovelId(null)} className="p-3 text-stone-400 hover:text-amber-600 transition-colors" title="Biblioteca"><Library size={24}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'writing' && <WritingSpace chapter={currentChapter} novelId={currentNovelId} characters={characters} worldData={worldData} isZenMode={isZenMode} toggleZenMode={toggleZenMode} onRefresh={refreshData} />}
          {activeTab === 'ideas' && <IdeasManager ideas={ideas} onEdit={(idea: any) => openModal('editIdea', idea)} onDelete={(id: string) => handleDeleteItem('ideas', id)} onNew={() => openModal('newIdea')} />}
          {activeTab === 'characters' && <CharacterManager characters={characters} onEdit={(c: any) => openModal(c ? 'editCharacter' : 'newCharacter', c)} onAddRelation={(id: string) => { setActiveTab('relations'); openModal('newRelation', { from: id }); }} onDelete={(id: string) => handleDeleteItem('characters', id)} />}
          {activeTab === 'relations' && <RelationManager characters={characters} relations={relations} currentNovelId={currentNovelId} onAddRelation={(preId: any) => openModal('newRelation', { from: preId })} onDeleteRelation={(id: string) => { db.deleteFromCollection(currentNovelId!, 'relations', id); refreshData(); }} />}
          {activeTab === 'world' && <WorldManager worldData={worldData} onEdit={(l: any) => openModal(l ? 'editLocation' : 'newLocation', l)} onDelete={(id: string) => handleDeleteItem('world', id)} />}
          {activeTab === 'dashboard' && <DashboardStats novelMeta={novelMeta} chapters={chapters} characters={characters} parts={parts} setActiveTab={setActiveTab} setSelectedChapterId={setSelectedChapterId} onExport={() => generateManuscriptPDF(novelMeta?.title || "Obra", parts, chapters)} />}
          {activeTab === 'trash' && <TrashManager novelId={currentNovelId} trash={trash} onRefresh={refreshData} />}
        </div>
      </main>

      {/* MODALS PERSISTENTES */}
      <Modal isOpen={modalConfig.open && (modalConfig.type === 'newPart' || modalConfig.type === 'editPart')} onClose={closeModal} title="Configurar Parte">
        <div className="p-10"><form onSubmit={(e: any) => { e.preventDefault(); if (!currentNovelId) return; const data = { name: (e.target as any).name.value }; if (modalConfig.type === 'newPart') db.addToCollection<Part>(currentNovelId, 'parts', { ...data, order: parts.length, createdAt: Date.now() }); else db.updateInCollection<Part>(currentNovelId, 'parts', modalConfig.data.id, data); refreshData(); closeModal(); }} className="space-y-6"><InputField label="Nombre de la Sección" name="name" defaultValue={modalConfig.data?.name} autoFocus /><Button type="submit" className="w-full py-5">Establecer Estructura</Button></form></div>
      </Modal>

      <Modal isOpen={modalConfig.open && (modalConfig.type === 'newChapter' || modalConfig.type === 'editChapter')} onClose={closeModal} title="Detalles de Escena">
        <div className="p-10"><form onSubmit={(e: any) => { e.preventDefault(); if (!currentNovelId) return; const data = { title: (e.target as any).title.value, partId: (e.target as any).partId.value }; if (modalConfig.type === 'newChapter') { const nc = db.addToCollection<Chapter>(currentNovelId, 'chapters', { ...data, content: "", order: chapters.length, createdAt: Date.now() }); setSelectedChapterId(nc.id); setActiveTab('writing'); } else db.updateInCollection<Chapter>(currentNovelId, 'chapters', modalConfig.data.id, data); refreshData(); closeModal(); }} className="space-y-8"><InputField label="Título de la Escena" name="title" defaultValue={modalConfig.data?.title} autoFocus /><div className="space-y-2"><label className="text-[10px] font-black text-stone-400 uppercase px-1">Sección de la obra</label><select name="partId" defaultValue={modalConfig.data?.partId} className="w-full bg-stone-50 dark:bg-gray-950 p-4 font-bold rounded-2xl border-none outline-none ring-2 ring-stone-100 focus:ring-amber-500 transition-all"><option value="">Borrador Libre</option>{parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><Button type="submit" className="w-full py-5">Confirmar Escena</Button></form></div>
      </Modal>
      
      <Modal isOpen={modalConfig.open && (modalConfig.type === 'editCharacter' || modalConfig.type === 'newCharacter')} onClose={closeModal} title="Ficha de Protagonista" maxWidth="max-w-5xl">
         <CharacterModalContent 
           character={modalConfig.data} 
           allCharacters={characters}
           relations={relations}
           currentNovelId={currentNovelId}
           onRefresh={refreshData}
           onSave={(data: any) => { 
             if (!currentNovelId) return; 
             if (modalConfig.type === 'newCharacter' || !modalConfig.data?.id) db.addToCollection<Character>(currentNovelId, 'characters', data); 
             else db.updateInCollection<Character>(currentNovelId, 'characters', modalConfig.data.id, data); 
             refreshData(); 
             closeModal(); 
           }} 
         />
      </Modal>

      <Modal isOpen={modalConfig.open && (modalConfig.type === 'newIdea' || modalConfig.type === 'editIdea')} onClose={closeModal} title="Capturar Chispa">
        <div className="p-10"><form onSubmit={(e: any) => { e.preventDefault(); if (!currentNovelId) return; const data = { title: (e.target as any).title.value, content: (e.target as any).content.value, color: (e.target as any).color.value }; if (modalConfig.type === 'newIdea') db.addToCollection<Idea>(currentNovelId, 'ideas', { ...data, createdAt: Date.now() }); else db.updateInCollection<Idea>(currentNovelId, 'ideas', modalConfig.data.id, data); refreshData(); closeModal(); setActiveTab('ideas'); }} className="space-y-8"><InputField label="Nombre de la Idea" name="title" defaultValue={modalConfig.data?.title} autoFocus /><InputField label="Contenido Fugaz" name="content" defaultValue={modalConfig.data?.content} isTextArea /><div className="space-y-2"><label className="text-[10px] font-black text-stone-400 uppercase">Esencia Visual</label><div className="flex gap-4">{['bg-amber-600', 'bg-emerald-600', 'bg-rose-600', 'bg-indigo-600', 'bg-stone-800'].map(c => (<label key={c} className="flex-1 cursor-pointer"><input type="radio" name="color" value={c} className="hidden peer" defaultChecked={modalConfig.data?.color ? modalConfig.data.color === c : c === 'bg-amber-600'} /><div className={`h-12 rounded-2xl ${c} border-4 border-transparent peer-checked:border-white shadow-xl transition-all hover:scale-105`}></div></label>))}</div></div><Button type="submit" className="w-full py-5 shadow-xl">Inmortalizar Chispa</Button></form></div>
      </Modal>

      <Modal isOpen={modalConfig.open && (modalConfig.type === 'editLocation' || modalConfig.type === 'newLocation')} onClose={closeModal} title="Explorar Geografía">
        <div className="p-10"><form onSubmit={(e: any) => { e.preventDefault(); if (!currentNovelId) return; const data = { name: (e.target as any).name.value, description: (e.target as any).description.value }; if (modalConfig.type === 'newLocation') db.addToCollection<Location>(currentNovelId, 'world', data); else db.updateInCollection<Location>(currentNovelId, 'world', modalConfig.data.id, data); refreshData(); closeModal(); }} className="space-y-8"><InputField label="Nombre del Lugar" name="name" defaultValue={modalConfig.data?.name} autoFocus /><InputField label="Atmósfera y Entorno" name="description" defaultValue={modalConfig.data?.description} isTextArea /><Button type="submit" className="w-full py-5 shadow-xl">Documentar Localización</Button></form></div>
      </Modal>

      <Modal isOpen={modalConfig.open && modalConfig.type === 'newRelation'} onClose={closeModal} title="Forjar Vínculo">
        <div className="p-10"><form onSubmit={(e: any) => { e.preventDefault(); if (!currentNovelId) return; const data = { from: (e.target as any).from.value, to: (e.target as any).to.value, type: (e.target as any).type.value, intensity: (e.target as any).intensity.value }; db.addToCollection<Relation>(currentNovelId, 'relations', data as any); refreshData(); closeModal(); }} className="space-y-8"><div className="grid grid-cols-2 gap-8"><div><label className="text-[10px] font-black text-stone-400 uppercase mb-2 block">Origen</label><select name="from" defaultValue={modalConfig.data?.from} className="w-full bg-stone-50 p-4 rounded-2xl border-none outline-none font-bold text-sm ring-2 ring-stone-100">{characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="text-[10px] font-black text-stone-400 uppercase mb-2 block">Destino</label><select name="to" className="w-full bg-stone-50 p-4 rounded-2xl border-none outline-none font-bold text-sm ring-2 ring-stone-100">{characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div><InputField label="Naturaleza del Vínculo" name="type" placeholder="Ej. Rivalidad Eterna, Lealtad..." autoFocus /><InputField label="Notas de Intensidad" name="intensity" /><Button type="submit" variant="rose" className="w-full py-5 shadow-xl">Establecer Conexión</Button></form></div>
      </Modal>
    </div>
  );
}

// --- SUB-VISTAS DE CONTENIDO ---

function LibraryView({ novels, deletedNovels, onSelect, onCreate, onDelete, onRestore, onPermanentDelete, onRefreshLibrary }: any) {
  const [isCreating, setIsCreating] = useState(false);
  const [tab, setTab] = useState('active');

  const handleExport = () => {
    const data = db.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NovelCraft_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (db.importAll(content)) {
        alert("¡Biblioteca restaurada con éxito!");
        onRefreshLibrary();
      } else {
        alert("Error: El archivo no es válido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-gray-950 flex flex-col items-center p-12 lg:p-24 overflow-y-auto font-sans">
      <div className="max-w-6xl w-full space-y-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-200 dark:border-gray-800 pb-16">
          <div className="space-y-8">
            <h1 className="text-9xl font-display italic tracking-tighter text-stone-900 dark:text-white uppercase leading-none font-black">Refugio</h1>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setTab('active')} className={`text-[11px] font-black uppercase tracking-[0.4em] px-10 py-4 rounded-full border-2 transition-all ${tab === 'active' ? 'bg-amber-600 text-white border-amber-600 shadow-2xl shadow-amber-600/30' : 'text-stone-400 hover:bg-stone-100 border-transparent'}`}>Mis Obras ({novels.length})</button>
              <button onClick={() => setTab('trash')} className={`text-[11px] font-black uppercase tracking-[0.4em] px-10 py-4 rounded-full border-2 transition-all ${tab === 'trash' ? 'bg-stone-800 text-white border-stone-800 shadow-2xl shadow-stone-800/30' : 'text-stone-400 hover:bg-stone-100 border-transparent'}`}>Cementerio ({deletedNovels.length})</button>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button onClick={handleExport} className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 text-stone-600 dark:text-stone-300 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 transition-all border border-stone-100 dark:border-gray-700 shadow-sm">
                <DownloadCloud size={14} /> Guardar Respaldo
              </button>
              <label className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 text-stone-600 dark:text-stone-300 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-stone-100 dark:border-gray-700 shadow-sm cursor-pointer">
                <UploadCloud size={14} /> Restaurar Todo
                <input type="file" className="hidden" accept=".json" onChange={handleImport} />
              </label>
            </div>
          </div>
          <Button icon={Plus} onClick={() => setIsCreating(true)} className="px-16 py-7 text-2xl shadow-2xl">Nueva Historia</Button>
        </header>

        {tab === 'active' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {novels.map((novel: Novel) => (
              <div key={novel.id} onClick={() => onSelect(novel.id)} className="bg-white dark:bg-gray-900 p-16 rounded-[5rem] shadow-2xl border-b-[24px] border-amber-600 transition-all hover:-translate-y-6 group cursor-pointer h-96 flex flex-col justify-between writing-shadow">
                <div className="flex justify-between items-start">
                   <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/40 rounded-[2rem] flex items-center justify-center text-amber-600 group-hover:rotate-12 transition-transform shadow-lg shadow-amber-600/10"><BookOpen size={40} /></div>
                   <button onClick={(e) => { e.stopPropagation(); onDelete(novel.id); }} className="p-5 bg-stone-50 dark:bg-gray-800 rounded-3xl text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-md"><Trash2 size={24}/></button>
                </div>
                <h3 className="text-5xl font-display italic font-black leading-none uppercase tracking-tighter text-stone-800 dark:text-white line-clamp-2">{novel.title}</h3>
                <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest italic border-t border-stone-100 dark:border-gray-800 pt-6">Última edición: {new Date(novel.lastModified).toLocaleDateString()}</p>
              </div>
            ))}
            {novels.length === 0 && <div className="col-span-full py-60 text-center opacity-5 uppercase font-black text-6xl italic tracking-tighter">Tu biblioteca espera una leyenda...</div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {deletedNovels.map((novel: any) => (
              <div key={novel.id} className="bg-stone-50 dark:bg-gray-900/50 p-16 rounded-[5rem] shadow-xl border-b-[24px] border-stone-400 opacity-60 flex flex-col justify-between h-96">
                <div className="flex justify-between items-start">
                  <div className="text-[11px] font-black text-stone-500 uppercase bg-stone-200 px-6 py-3 rounded-2xl shadow-inner">Olvidado</div>
                  <div className="flex gap-4">
                    <button onClick={() => onRestore(novel.id)} className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-lg"><RefreshCcw size={20}/></button>
                    <button onClick={() => onPermanentDelete(novel.id)} className="p-4 bg-stone-200 text-stone-600 rounded-2xl hover:bg-stone-600 hover:text-white transition-all shadow-lg"><Trash2 size={20}/></button>
                  </div>
                </div>
                <h3 className="text-5xl font-display italic font-black leading-none uppercase tracking-tighter line-through text-stone-400 line-clamp-2">{novel.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Manifestar Proyecto"><div className="p-12"><form onSubmit={(e: any) => { e.preventDefault(); onCreate(e.target.novelTitle.value); setIsCreating(false); }} className="space-y-12"><InputField label="Título del Universo" name="novelTitle" autoFocus placeholder="¿Cómo se llama tu próxima gran aventura?" /><Button type="submit" className="w-full py-8 text-3xl shadow-amber-600/40">Manifestar Historia</Button></form></div></Modal>
    </div>
  );
}

function FormattingToolbar({ onApply, onFind, onCorrect, onToggleJustify, isJustified, loadingAI }: any) {
  return (
    <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl p-3.5 rounded-[2.5rem] border border-stone-200 dark:border-gray-800 shadow-[0_20px_60px_-15px_rgba(217,119,6,0.15)] writing-shadow">
      <button onClick={() => onApply('**')} className="p-3.5 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-2xl transition-all" title="Negrita"><Bold size={20}/></button>
      <button onClick={() => onApply('*')} className="p-3.5 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-2xl transition-all" title="Cursiva"><Italic size={20}/></button>
      <button onClick={() => onApply('__')} className="p-3.5 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-2xl transition-all" title="Subrayado"><Underline size={20}/></button>
      <div className="w-[1.5px] h-8 bg-stone-100 dark:bg-gray-800 mx-3"></div>
      <button onClick={onToggleJustify} className={`p-3.5 rounded-2xl transition-all ${isJustified ? 'bg-amber-600 text-white shadow-lg' : 'hover:bg-amber-50'}`} title="Justificar">
        {isJustified ? <AlignJustify size={20}/> : <AlignLeft size={20}/>}
      </button>
      <div className="w-[1.5px] h-8 bg-stone-100 dark:bg-gray-800 mx-3"></div>
      <button onClick={onFind} className="p-3.5 hover:bg-amber-50 text-amber-600 rounded-2xl transition-all" title="Buscar"><Search size={20}/></button>
      <button onClick={onCorrect} disabled={loadingAI} className={`p-3.5 hover:bg-amber-50 rounded-2xl transition-all flex items-center gap-3 px-6 ${loadingAI ? 'animate-pulse text-amber-500 bg-amber-50' : 'text-amber-500'}`} title="Corrección IA Experta">
         <Sparkles size={20}/> <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Asistente</span>
      </button>
    </div>
  );
}

function WritingSpace({ chapter, novelId, characters, worldData, onRefresh, isZenMode, toggleZenMode }: any) {
  const [showConfig, setShowConfig] = useState(false);
  const [isJustified, setIsJustified] = useState(true);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [lastIndex, setLastIndex] = useState(0);
  const [loadingAI, setLoadingAI] = useState(false);
  const timerRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!chapter) return (
    <div className="h-full flex flex-col items-center justify-center p-24 text-center space-y-12 animate-in fade-in duration-1000">
      <div className="w-40 h-40 bg-stone-100 dark:bg-gray-900 rounded-full flex items-center justify-center float-animation shadow-2xl"><PenTool size={64} className="text-amber-600 opacity-40" /></div>
      <div className="space-y-4">
        <h3 className="text-5xl font-display italic font-black uppercase tracking-tighter text-stone-300">Tu próximo capítulo te espera</h3>
        <p className="font-black uppercase tracking-[0.4em] text-[11px] text-stone-400">Selecciona una escena para comenzar a manifestar tu historia.</p>
      </div>
    </div>
  );

  const wordCount = useMemo(() => chapter.content?.trim().split(/\s+/).filter(x => x.length > 0).length || 0, [chapter.content]);
  const goalProgress = Math.min(100, (wordCount / 500) * 100);

  const handleAICorrection = async () => {
    const text = textareaRef.current?.value;
    if (!text || text.length < 10) return;
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Eres un editor literario de prestigio mundial. Corrige ortografía y mejora el estilo sin cambiar la voz del autor:\n\n${text}`,
      });
      const corrected = resp.text;
      if (corrected && textareaRef.current) { textareaRef.current.value = corrected; updateContent(corrected); }
    } catch (e) { console.error("Editor Error", e); }
    finally { setLoadingAI(false); }
  };

  const applyFormat = (tag: string) => {
    const el = textareaRef.current; if (!el) return;
    const s = el.selectionStart; const e = el.selectionEnd; const t = el.value;
    const sel = t.substring(s, e);
    let nt = tag.endsWith(' ') ? t.substring(0, s) + tag + sel + t.substring(e) : t.substring(0, s) + tag + sel + tag + t.substring(e);
    el.value = nt; updateContent(nt); el.focus();
  };

  const updateContent = (val: string) => {
    const newVal = val.replace(/--/g, '—');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      db.updateInCollection<Chapter>(novelId, 'chapters', chapter.id, { content: newVal });
      db.updateNovel(novelId, { lastModified: Date.now() });
      onRefresh();
    }, 1200);
    if (textareaRef.current && newVal !== val) {
      const s = textareaRef.current.selectionStart;
      textareaRef.current.value = newVal; textareaRef.current.setSelectionRange(s, s);
    }
  };

  const handleFind = () => {
    const el = textareaRef.current; if (!el || !findText) return;
    const t = el.value.toLowerCase(); const q = findText.toLowerCase();
    let idx = t.indexOf(q, lastIndex); if (idx === -1) idx = t.indexOf(q, 0);
    if (idx !== -1) { el.focus(); el.setSelectionRange(idx, idx + q.length); setLastIndex(idx + q.length); }
  };

  const toggleLink = (type: 'char' | 'loc', id: string) => {
    if (!novelId || !chapter) return;
    const field = type === 'char' ? 'linkedCharacters' : 'linkedLocations';
    const currentLinks = (chapter[field] || []) as string[];
    const newLinks = currentLinks.includes(id)
      ? currentLinks.filter((li: string) => li !== id)
      : [...currentLinks, id];
    
    db.updateInCollection<Chapter>(novelId, 'chapters', chapter.id, { [field]: newLinks });
    onRefresh();
  };

  return (
    <div className={`h-full flex transition-all duration-700 ${isZenMode ? 'bg-paper dark:bg-gray-950' : ''}`}>
      <div className={`flex-1 flex flex-col bg-paper dark:bg-gray-950 overflow-hidden relative`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-100 dark:bg-amber-900/20 z-[45]">
           <div className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: `${goalProgress}%` }} />
        </div>

        <div className={`absolute left-1/2 -translate-x-1/2 z-[40] transition-all duration-500 ${isZenMode ? 'top-6 scale-90 opacity-40 hover:opacity-100' : 'top-10'}`}>
           <FormattingToolbar onApply={applyFormat} onFind={() => setIsFindOpen(!isFindOpen)} onCorrect={handleAICorrection} onToggleJustify={() => setIsJustified(!isJustified)} isJustified={isJustified} loadingAI={loadingAI} />
           {isFindOpen && (
             <div className="mt-6 flex items-center gap-3 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border border-stone-100 dark:border-gray-700 rounded-3xl shadow-2xl animate-in slide-in-from-top-4">
               <Search size={18} className="text-amber-500" />
               <input type="text" placeholder="Localizar término..." className="bg-transparent border-none outline-none text-xs font-bold uppercase w-56" value={findText} autoFocus onChange={(e) => { setFindText(e.target.value); setLastIndex(0); }} onKeyDown={(e) => e.key === 'Enter' && handleFind()} />
               <button onClick={handleFind} className="p-2 hover:bg-stone-100 rounded-xl transition-all"><ChevronRight size={18}/></button>
               <button onClick={() => setIsFindOpen(false)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"><X size={18}/></button>
             </div>
           )}
        </div>

        <div className={`flex justify-between items-end py-6 border-b border-stone-200 dark:border-gray-800 transition-all duration-500 ${isZenMode ? 'opacity-0 h-0 pointer-events-none mb-0' : 'px-16 pt-32 pb-12 mb-4'}`}>
          <div className="space-y-3">
             <div className="flex items-center gap-3 mb-1">
                <FileText size={18} className="text-amber-600" />
                <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.4em] italic">Capítulo en Proceso</p>
             </div>
             <h2 className="text-5xl font-display italic font-black uppercase tracking-tighter leading-none">{chapter.title}</h2>
          </div>
          <div className="flex gap-4">
            <div className="hidden lg:flex flex-col items-end mr-6">
               <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Progreso Diario</span>
               <div className="flex items-center gap-3">
                  <span className="text-2xl font-display font-black text-stone-800">{wordCount}</span>
                  <span className="text-xs font-bold text-stone-400">/ 500 palabras</span>
               </div>
            </div>
            <button onClick={toggleZenMode} className="px-8 py-4 rounded-[1.8rem] flex items-center gap-3 text-xs font-black bg-white dark:bg-gray-900 hover:bg-amber-50 transition-all shadow-xl shadow-stone-200/50 border border-transparent hover:border-amber-100"><Monitor size={18}/> Enfoque</button>
            <button onClick={() => setShowConfig(!showConfig)} className={`px-8 py-4 rounded-[1.8rem] flex items-center gap-3 text-xs font-black transition-all border-2 shadow-xl ${showConfig ? 'bg-amber-600 text-white border-amber-600 shadow-amber-600/20' : 'bg-white dark:bg-gray-900 border-transparent text-stone-500'}`}><LinkIcon size={18}/> Contexto</button>
          </div>
        </div>

        {isZenMode && (
          <div className="fixed top-8 right-12 z-[55] flex items-center gap-6 animate-in slide-in-from-right duration-500">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/60 mb-1">Flujo de Palabras</span>
               <span className="text-3xl font-display font-black text-amber-900/30">{wordCount}</span>
             </div>
             <button onClick={toggleZenMode} className="p-6 bg-white/20 hover:bg-white/40 dark:bg-gray-800/40 backdrop-blur-3xl rounded-full text-stone-400 hover:text-amber-600 shadow-2xl transition-all hover:scale-110"><Minimize2 size={32}/></button>
          </div>
        )}

        <textarea 
          ref={textareaRef} 
          key={chapter.id} 
          defaultValue={chapter.content} 
          onChange={(e) => updateContent(e.target.value)} 
          className={`flex-1 w-full leading-[2] font-serif bg-transparent border-none focus:ring-0 resize-none outline-none overflow-y-auto custom-scrollbar transition-all duration-1000 ${isJustified ? 'text-justify' : 'text-left'} ${isZenMode ? 'text-4xl max-w-5xl mx-auto px-0 pt-64 pb-64 text-stone-800 dark:text-stone-200 font-medium selection:bg-amber-200 selection:text-amber-900' : 'text-2xl px-16 lg:px-64 pt-16 pb-64 text-stone-700 dark:text-stone-300'}`} 
          placeholder="Escribe la primera palabra... el resto vendrá solo." 
          autoFocus={isZenMode} 
        />
        
        {!isZenMode && (
          <div className="h-14 border-t border-stone-200 dark:border-gray-800 bg-white/40 backdrop-blur-md flex items-center justify-between px-16 shrink-0 z-[40]">
             <div className="flex items-center gap-8">
               <div className="flex items-center gap-3">
                  <Coffee size={14} className="text-amber-700" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Pausa reparadora cada 1000 palabras</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${loadingAI ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{loadingAI ? 'Analizando estilo...' : 'Sincronizado'}</span>
               </div>
             </div>
             <div className="flex items-center gap-4">
                <Trophy size={16} className={goalProgress >= 100 ? 'text-amber-500 animate-bounce' : 'text-stone-200'} />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{Math.floor(goalProgress)}% completado hoy</span>
             </div>
          </div>
        )}
      </div>

      <aside className={`border-l border-stone-200 dark:border-gray-800 bg-stone-50/20 dark:bg-gray-950/20 transition-all duration-500 overflow-y-auto custom-scrollbar ${isZenMode ? 'w-0 border-none p-0 opacity-0' : showConfig ? 'w-[450px] p-10' : 'w-0 lg:w-[450px] hidden lg:block p-10'}`}>
        <div className="space-y-16">
           <MotivationalQuote />
           
           {showConfig ? (
             <div className="space-y-12 animate-in slide-in-from-right duration-500">
                <header className="space-y-3">
                  <h3 className="text-3xl font-display italic font-black uppercase tracking-tighter">Vinculación</h3>
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Enlaza los pilares de tu universo.</p>
                </header>
                <section>
                  <h4 className="text-[10px] font-black text-amber-600 uppercase mb-6 flex items-center gap-3"><Users size={16}/> Elenco</h4>
                  <div className="grid gap-3">{characters.map((c: any) => (<button key={c.id} onClick={() => toggleLink('char', c.id)} className={`w-full text-left p-6 rounded-[2rem] text-xs font-bold transition-all border-4 ${chapter.linkedCharacters?.includes(c.id) ? 'bg-amber-600 border-amber-600 text-white shadow-xl scale-[1.03]' : 'bg-white dark:bg-gray-900 border-transparent text-stone-500 hover:border-amber-100 shadow-sm'}`}>{c.name}</button>))}</div>
                </section>
                <section>
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-6 flex items-center gap-3"><Map size={16}/> Geografía</h4>
                  <div className="grid gap-3">{worldData.map((l: any) => (<button key={l.id} onClick={() => toggleLink('loc', l.id)} className={`w-full text-left p-6 rounded-[2rem] text-xs font-bold transition-all border-4 ${chapter.linkedLocations?.includes(l.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-[1.03]' : 'bg-white dark:bg-gray-900 border-transparent text-stone-500 hover:border-emerald-100 shadow-sm'}`}>{l.name}</button>))}</div>
                </section>
             </div>
           ) : (
             <section className="space-y-10 animate-in fade-in duration-500">
                <h4 className="text-[10px] font-black text-stone-400 uppercase mb-12 italic tracking-[0.5em] border-b border-stone-200 pb-6">Contexto Inmediato</h4>
                <div className="space-y-8">
                    {characters.filter((c: any) => (chapter.linkedCharacters || []).includes(c.id)).map((c: any) => (
                      <div key={c.id} className="p-8 bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-2xl border-l-[12px] border-amber-500 transition-all hover:scale-[1.02]">
                        <p className="text-[9px] font-black text-amber-600 uppercase italic mb-3 tracking-widest">{c.role || 'Protagonista'}</p>
                        <p className="font-display text-2xl font-black uppercase tracking-tighter text-stone-800 dark:text-white leading-none mb-3">{c.name}</p>
                        <p className="text-[11px] text-stone-400 italic font-medium leading-relaxed line-clamp-3">{c.trasfondo || "Biografía en proceso..."}</p>
                      </div>
                    ))}
                    {worldData.filter((l: any) => (chapter.linkedLocations || []).includes(l.id)).map((l: any) => (
                      <div key={l.id} className="p-8 bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-2xl border-l-[12px] border-emerald-500 transition-all hover:scale-[1.02]">
                        <p className="text-[9px] font-black text-emerald-600 uppercase italic mb-3 tracking-widest">Ubicación</p>
                        <p className="font-display text-2xl font-black uppercase tracking-tighter text-stone-800 dark:text-white leading-none mb-3">{l.name}</p>
                        <p className="text-[11px] text-stone-400 italic font-medium leading-relaxed line-clamp-3">{l.description || "Escenario por detallar."}</p>
                      </div>
                    ))}
                    {(!chapter.linkedCharacters?.length && !chapter.linkedLocations?.length) && (
                      <div className="py-40 text-center opacity-30 flex flex-col items-center gap-6">
                        <div className="p-6 bg-stone-100 dark:bg-gray-800 rounded-full"><Compass size={40} className="text-stone-300" /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Sin anclajes narrativos</p>
                      </div>
                    )}
                </div>
             </section>
           )}
        </div>
      </aside>
    </div>
  );
}

function DashboardStats({ novelMeta, chapters, characters, parts, setActiveTab, setSelectedChapterId, onExport }: any) {
  const words = chapters.reduce((a: any, c: any) => a + (c.content?.trim().split(/\s+/).filter(x => x.length > 0).length || 0), 0);
  const totalChars = characters.length;
  const totalScenes = chapters.length;
  
  return (
    <div className="p-20 max-w-7xl mx-auto space-y-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-64">
      <header className="space-y-12">
        <h2 className="text-9xl font-display font-black tracking-tighter italic uppercase leading-none text-stone-900 dark:text-white decoration-amber-500/10 underline decoration-[25px] underline-offset-[-15px]">{novelMeta?.title}</h2>
        <div className="flex flex-wrap gap-8">
          <Button onClick={() => setActiveTab('writing')} variant="primary" icon={PenTool} className="px-16 py-6 text-xl shadow-2xl">Continuar Relato</Button>
          <Button onClick={onExport} variant="outline" icon={Download} className="px-16 py-6 text-xl shadow-2xl">Exportar Manuscrito</Button>
          <div className="flex items-center gap-5 px-10 py-5 bg-white dark:bg-gray-900 rounded-full shadow-xl border border-stone-100 dark:border-gray-800">
             <Trophy size={24} className="text-amber-500" />
             <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total de la Obra</span>
               <span className="text-xl font-display font-black text-stone-800">{words.toLocaleString()} palabras</span>
             </div>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <StatItem label="Volumen de Prosa" value={words.toLocaleString()} color="text-amber-600" icon={PenTool} />
        <StatItem label="Almas Creadas" value={totalChars} color="text-emerald-500" icon={Users} />
        <StatItem label="Escenas de Vida" value={totalScenes} color="text-rose-500" icon={FileText} />
        <StatItem label="Bloques de Historia" value={parts.length} color="text-stone-800" icon={Folder} />
      </div>

      <div className="bg-white dark:bg-gray-900 p-24 rounded-[6rem] shadow-2xl border border-stone-50 dark:border-gray-800 writing-shadow">
        <div className="flex justify-between items-center mb-16">
          <h3 className="text-6xl font-display italic font-black text-stone-800 dark:text-white uppercase tracking-tighter">Arquitectura Vital</h3>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full"><Compass size={32} className="text-amber-600" /></div>
        </div>
        <div className="space-y-20">
          {parts.map((p: any) => (
            <div key={p.id} className="border-l-[10px] border-amber-50 dark:border-amber-900/10 pl-16 py-4 relative">
              <div className="absolute -left-[18px] top-6 w-6 h-6 rounded-full bg-amber-500 shadow-xl shadow-amber-500/40"></div>
              <h4 className="text-[12px] font-black text-stone-400 uppercase tracking-[0.6em] mb-12 italic">{p.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {chapters.filter((c: any) => c.partId === p.id).map((c: any) => (
                  <div 
                    key={c.id} 
                    className="bg-stone-50 dark:bg-gray-800/40 p-10 rounded-[3.5rem] font-display font-black flex items-center gap-8 hover:translate-x-4 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer border-2 border-transparent hover:border-amber-100 shadow-sm hover:shadow-2xl group" 
                    onClick={() => { setSelectedChapterId(c.id); setActiveTab('writing'); }}
                  >
                    <div className="w-5 h-5 bg-amber-500 rounded-full shadow-lg group-hover:scale-150 transition-all"></div>
                    <span className="text-2xl italic uppercase tracking-tight text-stone-800 dark:text-stone-200 line-clamp-1">{c.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {parts.length === 0 && <div className="py-20 text-center opacity-10 text-4xl font-black italic uppercase tracking-widest">Sin cimientos todavía</div>}
        </div>
      </div>
    </div>
  );
}

const StatItem = ({ label, value, color, icon: Icon }: any) => (
  <div className="space-y-4 p-12 bg-white dark:bg-gray-900 rounded-[4rem] shadow-2xl border-t-[14px] border-stone-50 dark:border-gray-800 text-center transition-all hover:scale-110 writing-shadow">
    <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-2xl ${color} bg-opacity-10 mb-2`}><Icon size={24} className={color}/></div>
    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] italic leading-none">{label}</p>
    <p className={`text-7xl font-display italic font-black tracking-tighter ${color} leading-none`}>{value}</p>
  </div>
);

function IdeasManager({ ideas, onEdit, onDelete, onNew }: any) {
  const [q, setQ] = useState('');
  const filtered = ideas.filter((i: any) => i.title.toLowerCase().includes(q.toLowerCase()) || i.content.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="p-20 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-200 dark:border-gray-800 pb-16">
        <h2 className="text-8xl font-display italic font-black tracking-tighter uppercase leading-none underline decoration-amber-500 decoration-[15px] underline-offset-[10px]">Chispas</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5 bg-stone-100 dark:bg-gray-800 px-6 py-3 rounded-full w-80 shadow-inner">
            <Search size={18} className="text-stone-400" />
            <input type="text" placeholder="Localizar chispa..." className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button icon={Plus} onClick={onNew} className="px-10 py-4 shadow-2xl text-md">Nueva Chispa</Button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filtered.map((idea: any) => (
          <div key={idea.id} onClick={() => onEdit(idea)} className={`${idea.color} p-12 rounded-[4rem] shadow-2xl text-white transform hover:rotate-1 transition-all relative group h-96 flex flex-col cursor-pointer writing-shadow`}>
            <button onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }} className="absolute top-8 right-8 p-4 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-500 transition-all shadow-lg"><Trash2 size={24}/></button>
            <h3 className="text-4xl font-display italic font-black uppercase mb-8 line-clamp-2 leading-none">{idea.title}</h3>
            <p className="flex-1 text-base font-medium leading-relaxed opacity-95 italic overflow-y-auto custom-scrollbar pr-4 text-justify">{idea.content}</p>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-60 text-center opacity-5 text-6xl font-black italic uppercase tracking-widest">Sin chispas creativas</div>}
      </div>
    </div>
  );
}

function CharacterManager({ characters, onEdit, onAddRelation, onDelete }: any) {
  const [q, setQ] = useState('');
  const filtered = characters.filter((c: any) => c.name.toLowerCase().includes(q.toLowerCase()) || (c.role && c.role.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="p-20 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-200 dark:border-gray-800 pb-16">
        <h2 className="text-8xl font-display italic font-black tracking-tighter uppercase leading-none underline decoration-emerald-500 decoration-[15px] underline-offset-[10px]">Almas</h2>
        <Button icon={Plus} onClick={() => onEdit(null)} className="px-12 py-5 shadow-2xl text-lg">Nuevo Protagonista</Button>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {filtered.map((char: any) => (
          <div key={char.id} className="bg-white dark:bg-gray-900 p-12 rounded-[5rem] border-b-[24px] border-emerald-600 shadow-2xl group hover:-translate-y-2 transition-all writing-shadow">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 shadow-lg"><UserCircle size={56} /></div>
                <div>
                  <h3 className="text-5xl font-display italic font-black uppercase tracking-tighter leading-none mb-4">{char.name}</h3>
                  <div className="flex gap-3">
                    <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950/50 px-5 py-1.5 rounded-full italic tracking-widest">{char.role || 'Papel Indefinido'}</span>
                    {char.edad && <span className="text-[10px] font-black text-stone-500 uppercase bg-stone-100 dark:bg-gray-800 px-5 py-1.5 rounded-full tracking-widest">{char.edad} Ciclos</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onAddRelation(char.id)} className="p-4 bg-stone-50 dark:bg-gray-800 rounded-3xl text-rose-400 hover:text-rose-600 transition-all hover:scale-110 shadow-md" title="Forjar Vínculo"><Heart size={24}/></button>
                <button onClick={() => onEdit(char)} className="p-4 bg-stone-50 dark:bg-gray-800 rounded-3xl text-stone-400 hover:text-emerald-600 transition-all hover:rotate-90 shadow-md"><Settings size={24}/></button>
                <button onClick={() => onDelete(char.id)} className="p-4 bg-stone-50 dark:bg-gray-800 rounded-3xl text-stone-200 hover:text-rose-500 transition-all shadow-md"><Trash2 size={24}/></button>
              </div>
            </div>
            <p className="text-sm text-stone-500 italic leading-relaxed line-clamp-5 font-medium px-4 text-justify">{char.trasfondo || "Biografía por manifestar."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorldManager({ worldData, onEdit, onDelete }: any) {
  const [q, setQ] = useState('');
  const filtered = worldData.filter((l: any) => l.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="p-20 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-200 dark:border-gray-800 pb-16">
        <h2 className="text-8xl font-display italic font-black tracking-tighter uppercase leading-none underline decoration-rose-500 decoration-[15px] underline-offset-[10px]">Geografía</h2>
        <Button icon={Plus} onClick={() => onEdit(null)} className="px-12 py-5 shadow-2xl text-lg">Nueva Localización</Button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filtered.map((loc: any) => (
          <div key={loc.id} className="bg-white dark:bg-gray-900 p-16 rounded-[5rem] shadow-2xl border-b-[24px] border-rose-500 hover:-translate-y-2 transition-all writing-shadow">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-[2.5rem] shadow-xl"><Map size={40} /></div>
                <h3 className="text-5xl font-display italic font-black uppercase tracking-tighter leading-none">{loc.name}</h3>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onEdit(loc)} className="p-5 bg-stone-50 dark:bg-gray-800 rounded-3xl text-stone-400 hover:text-rose-600 transition-all shadow-md"><Settings size={28}/></button>
                <button onClick={() => onDelete(loc.id)} className="p-5 bg-stone-50 dark:bg-gray-800 rounded-3xl text-stone-200 hover:text-rose-600 transition-all shadow-md"><Trash2 size={28}/></button>
              </div>
            </div>
            <p className="text-stone-500 text-sm italic leading-relaxed font-medium line-clamp-6 text-justify px-4">{loc.description || "Escenario sin descripción."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrashManager({ novelId, trash, onRefresh }: any) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const opts = [
    { id: 'all', label: 'Todo el Olvido', icon: Library },
    { id: 'parts', label: 'Estructuras', icon: Folder },
    { id: 'chapters', label: 'Escenas', icon: FileText },
    { id: 'characters', label: 'Almas', icon: Users },
    { id: 'ideas', label: 'Chispas', icon: Lightbulb },
    { id: 'world', label: 'Mapas', icon: Map }
  ];
  
  const filtered = trash.filter((i: TrashItem) => 
    (filter === 'all' || i.originalCollection === filter) && 
    (i.data.name || i.data.title || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-20 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500 pb-40">
      <header className="border-b border-stone-200 dark:border-gray-800 pb-16 space-y-12">
        <h2 className="text-8xl font-display italic font-black tracking-tighter uppercase flex items-center gap-10 leading-none"><Trash2 size={80} className="text-stone-300"/> Cementerio</h2>
        <div className="flex items-center gap-6 bg-stone-100 dark:bg-gray-800 px-8 py-4 rounded-full w-full max-w-xl shadow-inner">
          <Search size={24} className="text-stone-400" />
          <input type="text" placeholder="Invocar del olvido..." className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-[0.2em] w-full" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </header>
      
      <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
        {opts.map(opt => (
          <button key={opt.id} onClick={() => setFilter(opt.id)} className={`flex items-center gap-4 px-8 py-4 rounded-full text-[11px] font-black uppercase transition-all whitespace-nowrap tracking-widest border-2 ${filter === opt.id ? 'bg-stone-800 text-white border-stone-800 shadow-2xl' : 'bg-white dark:bg-gray-800 text-stone-400 hover:bg-stone-100 border-transparent'}`}>
            <opt.icon size={18} /> {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map((item: TrashItem) => (
          <div key={item.id} className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] border-2 border-transparent hover:border-amber-500 flex justify-between items-center shadow-2xl group transition-all writing-shadow">
            <div className="flex items-center gap-10">
              <div className="p-6 bg-stone-50 dark:bg-gray-800 rounded-3xl text-stone-300 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all shadow-md"><RefreshCcw size={32}/></div>
              <div>
                <h4 className="text-3xl font-display italic font-black uppercase tracking-tighter leading-none mb-2">{item.data.name || item.data.title || "Elemento"}</h4>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">{item.originalCollection}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <Button onClick={() => { db.restoreFromTrash(novelId, item.id); onRefresh(); }} variant="outline" className="px-12 py-4 shadow-sm" icon={RefreshCcw}>Resucitar</Button>
              <button onClick={() => { if(confirm('¿Borrar definitivamente? Este acto es irreversible.')) { db.permanentDelete(novelId, item.id); onRefresh(); } }} className="p-5 text-stone-200 hover:text-rose-500 transition-all hover:scale-110"><Trash2 size={32}/></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="py-60 text-center opacity-5 text-6xl font-black uppercase italic tracking-widest leading-none">El silencio es absoluto</div>}
      </div>
    </div>
  );
}

const CharacterModalContent = ({ character, onSave, allCharacters, relations, currentNovelId, onRefresh }: any) => {
  const [activeTab, setActiveTab] = useState('identidad');
  const [newRelCharId, setNewRelCharId] = useState('');
  const [newRelType, setNewRelType] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  
  const characterRelations = useMemo(() => {
    if (!character?.id) return [];
    return relations.filter((r: Relation) => r.from === character.id || r.to === character.id);
  }, [relations, character?.id]);

  const tabs = [
    { id: 'identidad', label: 'Identidad', icon: UserSearch, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'fisico', label: 'Físico', icon: BioIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'psique', label: 'Psique', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'social', label: 'Social', icon: Heart, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  const handleAddQuickRelation = () => {
    if (!currentNovelId || !character?.id || !newRelCharId || !newRelType) return;
    db.addToCollection<Relation>(currentNovelId, 'relations', {
      from: character.id,
      to: newRelCharId,
      type: newRelType,
      intensity: 'Estable'
    });
    setNewRelCharId('');
    setNewRelType('');
    onRefresh();
  };

  const handleDeleteQuickRelation = (id: string) => {
    if (!currentNovelId) return;
    db.deleteFromCollection(currentNovelId, 'relations', id);
    onRefresh();
  };

  const handleSubmit = () => { if (formRef.current) { onSave(Object.fromEntries(new FormData(formRef.current).entries())); } };

  return (
    <div className="flex flex-col h-full">
      <div className="flex p-8 gap-4 bg-stone-50/50 dark:bg-gray-950/30 border-b dark:border-gray-800 overflow-x-auto no-scrollbar shrink-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[130px] flex items-center justify-center gap-3 py-5 rounded-[2rem] transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab.id ? `${tab.bg} ${tab.color} border-4 border-current shadow-xl scale-105` : 'text-stone-400 hover:bg-white'}`}>
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <form ref={formRef} className="flex-1 flex flex-col overflow-hidden" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {activeTab === 'identidad' && (
            <div className="space-y-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 animate-in fade-in duration-300">
              <InputField label="Nombre" name="name" defaultValue={character?.name} autoFocus />
              <InputField label="Rol Narrativo" name="role" defaultValue={character?.role} />
              <InputField label="Ciclos" name="edad" defaultValue={character?.edad} />
              <InputField label="Origen" name="origen" defaultValue={character?.origen} />
              <InputField label="Residencia" name="residencia" defaultValue={character?.residencia} />
              <InputField label="Esencia/Raza" name="raza" defaultValue={character?.raza} />
            </div>
          )}
          {activeTab === 'fisico' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                <InputField label="Mirada" name="ojos" defaultValue={character?.ojos} />
                <InputField label="Cabello" name="pelo" defaultValue={character?.pelo} />
                <InputField label="Estatura" name="altura" defaultValue={character?.altura} />
              </div>
              <InputField label="Rasgos Distintivos" name="otrosFisico" defaultValue={character?.otrosFisico} isTextArea />
            </div>
          )}
          {activeTab === 'psique' && (
            <div className="space-y-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 animate-in fade-in duration-300">
              <InputField label="Virtudes" name="cualidades" defaultValue={character?.cualidades} />
              <InputField label="Sombras" name="defectos" defaultValue={character?.defectos} />
              <InputField label="Anhelo" name="motivaciones" defaultValue={character?.motivaciones} />
              <InputField label="Miedo Primordial" name="miedos" defaultValue={character?.miedos} />
            </div>
          )}
          {activeTab === 'social' && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <InputField label="Crónica (Bio)" name="trasfondo" defaultValue={character?.trasfondo} isTextArea />
              
              <div className="space-y-8 bg-indigo-50/30 dark:bg-gray-800/30 p-8 rounded-[3rem] border border-indigo-100 dark:border-gray-700">
                <header className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Heart size={20} /></div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Vínculos de Sangre y Destino</h4>
                    <p className="text-xs font-bold text-stone-400">Gestiona las conexiones vitales del personaje.</p>
                  </div>
                </header>

                {/* Listado de relaciones actuales */}
                <div className="space-y-3">
                  {characterRelations.map((rel: Relation) => {
                    const otherId = rel.from === character?.id ? rel.to : rel.from;
                    const otherChar = allCharacters.find((c: Character) => c.id === otherId);
                    return (
                      <div key={rel.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-indigo-50 dark:bg-gray-800 text-indigo-600 rounded-lg"><UserCircle size={16} /></div>
                          <div>
                            <span className="text-xs font-black uppercase tracking-tight">{otherChar?.name || 'Sombra'}</span>
                            <span className="mx-2 text-stone-300">·</span>
                            <span className="text-[10px] font-bold text-stone-400 uppercase italic">{rel.type}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleDeleteQuickRelation(rel.id)} className="p-2 text-stone-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    );
                  })}
                  {characterRelations.length === 0 && (
                    <div className="py-6 text-center opacity-20 italic text-[10px] font-black uppercase tracking-widest">Sin vínculos forjados</div>
                  )}
                </div>

                {/* Formulario rápido de nueva relación */}
                {character?.id && (
                  <div className="pt-4 border-t border-indigo-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-stone-400">Vincular con</label>
                        <select 
                          value={newRelCharId} 
                          onChange={(e) => setNewRelCharId(e.target.value)}
                          className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl border-none outline-none ring-2 ring-stone-100 dark:ring-gray-800 focus:ring-indigo-500 transition-all text-xs font-bold"
                        >
                          <option value="">Elegir Alma...</option>
                          {allCharacters.filter((c: Character) => c.id !== character.id).map((c: Character) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-stone-400">Naturaleza</label>
                        <input 
                          type="text" 
                          placeholder="Ej. Rivalidad, Amor..."
                          value={newRelType}
                          onChange={(e) => setNewRelType(e.target.value)}
                          className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl border-none outline-none ring-2 ring-stone-100 dark:ring-gray-800 focus:ring-indigo-500 transition-all text-xs font-bold"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="button" 
                          onClick={handleAddQuickRelation}
                          disabled={!newRelCharId || !newRelType}
                          className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {!character?.id && (
                  <p className="text-[9px] font-black uppercase text-rose-500 italic text-center">Inmortaliza la ficha primero para forjar vínculos.</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-10 border-t dark:border-gray-800 flex justify-end shrink-0 bg-stone-50 dark:bg-gray-900/50">
          <Button type="submit" icon={Check} className="px-16 py-5 text-xl shadow-2xl">Inmortalizar Ficha</Button>
        </div>
      </form>
    </div>
  );
};

function RelationManager({ characters, relations, onAddRelation, onDeleteRelation }: any) {
  const [selectedCharId, setSelectedCharId] = useState(characters[0]?.id || null);
  const charRelations = relations.filter((r: Relation) => r.from === selectedCharId || r.to === selectedCharId);
  return (
    <div className="p-20 max-w-7xl mx-auto space-y-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-200 dark:border-gray-800 pb-16">
        <h2 className="text-8xl font-display italic font-black tracking-tighter uppercase leading-none underline decoration-amber-500 decoration-[15px] underline-offset-[10px]">Lazos</h2>
        <Button icon={Plus} variant="primary" onClick={() => onAddRelation(selectedCharId)} className="px-12 py-5 shadow-2xl text-lg">Nuevo Vínculo</Button>
      </header>
      <div className="flex flex-col lg:flex-row gap-20">
        <aside className="w-full lg:w-80 shrink-0 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
          {characters.map((c: Character) => (
            <button key={c.id} onClick={() => setSelectedCharId(c.id)} className={`w-full flex items-center gap-6 p-6 rounded-[2.5rem] transition-all text-left group ${selectedCharId === c.id ? 'bg-amber-600 text-white shadow-2xl translate-x-4' : 'hover:bg-stone-100 dark:hover:bg-gray-800 text-stone-500'}`}>
              <UserCircle size={28} strokeWidth={selectedCharId === c.id ? 3 : 2} />
              <span className="font-display font-black text-xl italic tracking-tighter uppercase truncate leading-none">{c.name}</span>
            </button>
          ))}
        </aside>
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
          {charRelations.map((rel: Relation) => {
            const otherId = rel.from === selectedCharId ? rel.to : rel.from;
            const otherChar = characters.find((c: Character) => c.id === otherId);
            return (
              <div key={rel.id} className="bg-white dark:bg-gray-900 p-12 rounded-[5rem] border-2 border-transparent hover:border-amber-500 shadow-2xl transition-all group relative overflow-hidden writing-shadow">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-2 tracking-widest italic">Vínculo con</p>
                    <h4 className="text-4xl font-display italic font-black uppercase tracking-tighter leading-none text-stone-800 dark:text-white">{otherChar?.name || 'Sombra'}</h4>
                  </div>
                  <button onClick={() => onDeleteRelation(rel.id)} className="p-4 bg-stone-50 dark:bg-gray-800 rounded-3xl opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all shadow-md"><Trash2 size={24}/></button>
                </div>
                <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-950/30 px-8 py-4 rounded-3xl w-fit relative z-10 shadow-sm">
                  <ArrowRightLeft size={20} className="text-amber-600" />
                  <span className="font-black italic text-amber-700 dark:text-amber-300 text-sm uppercase tracking-widest">{rel.type || 'Conexión'}</span>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-5 text-amber-600 group-hover:scale-125 transition-transform duration-1000">
                  <Heart size={180} />
                </div>
              </div>
            );
          })}
          {charRelations.length === 0 && <div className="col-span-full py-60 text-center opacity-5 text-5xl font-black uppercase italic tracking-tighter leading-none">Un camino solitario</div>}
        </main>
      </div>
    </div>
  );
}
