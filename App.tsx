import React, { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { IndianLanguage, FamilyMember, LANGUAGE_CODES } from './types';
import TreeVisualizer from './components/TreeVisualizer';
import MemberEditor from './components/MemberEditor';
import { generateFamilyHistory } from './services/geminiService';
import { Download, Share2, Sparkles, ChevronRight, Menu } from 'lucide-react';

const INITIAL_DATA: FamilyMember[] = [
  {
    id: 'root-1',
    parentId: null,
    name: 'Grandfather',
    regionalName: 'दादाजी',
    relationType: 'Root',
    gender: 'male',
    spouseName: 'Grandmother',
    spouseRegionalName: 'दादीजी'
  }
];

export default function App() {
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_DATA);
  const [selectedId, setSelectedId] = useState<string | null>('root-1');
  const [language, setLanguage] = useState<IndianLanguage>(IndianLanguage.Hindi);
  const [showEditor, setShowEditor] = useState(true);
  const [familyStory, setFamilyStory] = useState<string>("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const selectedMember = members.find(m => m.id === selectedId) || null;

  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleAddChild = (parentId: string) => {
    const newId = `member-${Date.now()}`;
    const newMember: FamilyMember = {
      id: newId,
      parentId,
      name: 'New Member',
      regionalName: '',
      relationType: 'Son',
      gender: 'male'
    };
    setMembers(prev => [...prev, newMember]);
    setSelectedId(newId); // Select the new child immediately
    setShowEditor(true);
  };

  const handleDeleteMember = (id: string) => {
    const deleteRecursive = (targetId: string, currentList: FamilyMember[]): FamilyMember[] => {
        // Find children
        const children = currentList.filter(m => m.parentId === targetId);
        let listWithoutTarget = currentList.filter(m => m.id !== targetId);
        
        // Recursively delete children
        children.forEach(child => {
            listWithoutTarget = deleteRecursive(child.id, listWithoutTarget);
        });
        return listWithoutTarget;
    };

    setMembers(prev => deleteRecursive(id, prev));
    setSelectedId(null);
  };

  const handleExportJPEG = async () => {
    const svgElement = document.querySelector('#tree-container svg') as SVGSVGElement;
    if (!svgElement) return;

    // Serialize SVG
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Namespace hack
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Add XML declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // Convert to Base64
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement("canvas");
        // Get strict dimensions from SVG to avoid cropping or blank space
        const bbox = svgElement.getBBox();
        // Add some padding
        const padding = 50;
        canvas.width = bbox.width + padding * 2;
        canvas.height = bbox.height + padding * 2;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw image adjusted for bbox
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const jpegUrl = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement("a");
        link.download = `VamshaVriksha_${Date.now()}.jpg`;
        link.href = jpegUrl;
        link.click();
    };
    img.src = url;
  };

  const handleExportPDF = () => {
     const svgElement = document.querySelector('#tree-container svg') as SVGSVGElement;
     if (!svgElement) return;

     const serializer = new XMLSerializer();
     const source = serializer.serializeToString(svgElement);
     const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
     
     const img = new Image();
     img.onload = () => {
         const canvas = document.createElement("canvas");
         canvas.width = img.width; 
         canvas.height = img.height;
         const ctx = canvas.getContext("2d");
         if(!ctx) return;
         ctx.fillStyle = "white";
         ctx.fillRect(0,0, canvas.width, canvas.height);
         ctx.drawImage(img, 0, 0);

         const imgData = canvas.toDataURL("image/jpeg", 1.0);
         const pdf = new jsPDF({
             orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
             unit: 'px',
             format: [canvas.width, canvas.height]
         });
         pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
         pdf.save(`VamshaVriksha_${Date.now()}.pdf`);
     };
     img.src = url;
  };

  const generateStory = async () => {
    setIsGeneratingStory(true);
    const story = await generateFamilyHistory(members, language);
    setFamilyStory(story);
    setIsGeneratingStory(false);
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden text-gray-900 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-red-100 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-red-200">V</div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Vamsha <span className="text-red-600">Vriksha</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Translate to:</span>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as IndianLanguage)}
              className="border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              {Object.values(IndianLanguage).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-2"></div>

          <button 
            onClick={handleExportJPEG}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
          >
            <Download size={18} />
            JPG
          </button>
          <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-all shadow-md shadow-red-200"
          >
            <Share2 size={18} />
            PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Tree Canvas */}
        <div className="flex-1 relative bg-gray-50/50">
            <TreeVisualizer 
                members={members} 
                selectedId={selectedId}
                onSelectMember={(id) => {
                    setSelectedId(id);
                    setShowEditor(true);
                }}
            />
            
            {/* Story Widget */}
            <div className="absolute top-6 right-6 max-w-sm w-full sm:w-80">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-red-100 overflow-hidden ring-1 ring-black/5">
                    <button 
                        onClick={() => setFamilyStory(prev => prev ? "" : " ")}
                        className="w-full flex items-center justify-between p-4 text-sm font-semibold text-red-900 bg-gradient-to-r from-red-50 to-white hover:from-red-100 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                             <Sparkles size={18} className="text-red-500 fill-red-100"/>
                             <span>AI Family Chronicle</span>
                        </div>
                        <ChevronRight size={18} className={`transform transition-transform text-red-400 ${familyStory ? 'rotate-90' : ''}`} />
                    </button>
                    {familyStory && (
                         <div className="p-5 text-sm text-gray-700 bg-white border-t border-red-50">
                            {familyStory === " " && !isGeneratingStory && (
                                <div className="text-center py-2">
                                    <p className="mb-3 text-gray-500">Generate a poetic summary of your family history.</p>
                                    <button 
                                        onClick={generateStory}
                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        <Sparkles size={14} className="mr-2"/>
                                        Generate Story
                                    </button>
                                </div>
                            )}
                            {isGeneratingStory && (
                                <div className="flex items-center justify-center py-4 text-red-600 gap-2">
                                    <Sparkles size={16} className="animate-spin" />
                                    <span className="font-medium">Weaving your history...</span>
                                </div>
                            )}
                            {!isGeneratingStory && familyStory !== " " && (
                                <div className="relative">
                                    <p className="italic leading-relaxed font-serif text-gray-800 border-l-4 border-red-200 pl-4 py-1">
                                        "{familyStory}"
                                    </p>
                                </div>
                            )}
                         </div>
                    )}
                </div>
            </div>
            
             {/* Toggle Editor Button (Mobile/when closed) */}
            {!showEditor && (
                <button 
                    onClick={() => setShowEditor(true)}
                    className="absolute top-6 left-6 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-all z-10"
                >
                    <Menu size={24} />
                </button>
            )}
        </div>

        {/* Side Panel */}
        {showEditor && (
            <div className="relative z-30 h-full transition-transform duration-300 ease-in-out transform translate-x-0 shadow-2xl shadow-black/10">
                <MemberEditor 
                    member={selectedMember}
                    currentLanguage={language}
                    onUpdate={handleUpdateMember}
                    onDelete={handleDeleteMember}
                    onAddChild={handleAddChild}
                    onClose={() => setShowEditor(false)}
                />
            </div>
        )}
      </main>
    </div>
  );
}