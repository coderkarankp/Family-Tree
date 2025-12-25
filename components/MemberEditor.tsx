import React, { useState, useEffect } from 'react';
import { FamilyMember, IndianLanguage } from '../types';
import { translateName } from '../services/geminiService';
import { Plus, Trash2, Languages, Save, X } from 'lucide-react';

interface MemberEditorProps {
  member: FamilyMember | null;
  onUpdate: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  currentLanguage: IndianLanguage;
  onClose: () => void;
}

const MemberEditor: React.FC<MemberEditorProps> = ({ 
  member, 
  onUpdate, 
  onDelete, 
  onAddChild,
  currentLanguage,
  onClose
}) => {
  const [formData, setFormData] = useState<FamilyMember | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    setFormData(member);
  }, [member]);

  if (!formData || !member) return (
    <div className="h-full flex items-center justify-center text-gray-400 p-8 text-center bg-white border-l border-gray-200 w-96">
      <div>
        <p className="mb-2 font-medium text-gray-500">No member selected.</p>
        <p className="text-sm text-gray-400">Select a node to edit or add children.</p>
      </div>
    </div>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleTranslate = async () => {
    if (!formData) return;
    setIsTranslating(true);
    
    const translatedName = await translateName(formData.name, currentLanguage);
    let translatedSpouse = formData.spouseRegionalName;
    
    if (formData.spouseName) {
        translatedSpouse = await translateName(formData.spouseName, currentLanguage);
    }

    setFormData(prev => prev ? { 
        ...prev, 
        regionalName: translatedName,
        spouseRegionalName: translatedSpouse 
    } : null);
    setIsTranslating(false);
  };

  const handleSave = () => {
    if (formData) {
      onUpdate(formData);
    }
  };

  return (
    <div className="w-96 bg-white h-full flex flex-col border-l border-gray-200 z-10 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 className="font-bold text-xl text-gray-900">Edit Member</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
            <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Main Info */}
        <div className="space-y-5">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
              placeholder="Enter name"
            />
          </div>

          <div className="group">
             <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                    Regional Name <span className="text-red-500 font-normal">({currentLanguage})</span>
                </label>
                <button 
                    onClick={handleTranslate}
                    disabled={isTranslating || !formData.name}
                    className="text-xs flex items-center font-medium text-red-600 hover:text-red-800 disabled:opacity-50 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                    <Languages size={14} className="mr-1.5" />
                    {isTranslating ? 'Translating...' : 'Auto Translate'}
                </button>
             </div>
            <input
              type="text"
              name="regionalName"
              value={formData.regionalName || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none font-['Noto_Sans_Devanagari']"
              placeholder={`Name in ${currentLanguage}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Relation</label>
                <select
                  name="relationType"
                  value={formData.relationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="Root">Root</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Sibling">Sibling</option>
                </select>
             </div>
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Spouse Info */}
        <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Spouse Details</h3>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Spouse Name</label>
            <input
              type="text"
              name="spouseName"
              value={formData.spouseName || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Spouse Regional Name</label>
            <input
              type="text"
              name="spouseRegionalName"
              value={formData.spouseRegionalName || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Death Date</label>
            <input
              type="date"
              name="deathDate"
              value={formData.deathDate || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
        <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
        >
            <Save size={18} className="mr-2" />
            Save Changes
        </button>

        <div className="flex gap-3">
            <button 
                onClick={() => onAddChild(member.id)}
                className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
                <Plus size={18} className="mr-2" />
                Add Child
            </button>
            
            {member.parentId !== null && (
                 <button 
                    onClick={() => onDelete(member.id)}
                    className="flex-1 flex items-center justify-center py-2.5 px-4 border border-red-200 rounded-lg shadow-sm text-sm font-semibold text-red-600 bg-white hover:bg-red-50 transition-all"
                >
                    <Trash2 size={18} className="mr-2" />
                    Delete
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default MemberEditor;