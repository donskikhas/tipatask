
import React, { useState } from 'react';
import { Doc, Folder, TableCollection } from '../types';
import { FileText, Folder as FolderIcon, Plus, LayoutGrid, List as ListIcon, Trash2, ExternalLink, ChevronRight, FolderPlus, X, Save, Box, FileText as FileTextIcon } from 'lucide-react';

interface DocumentsViewProps {
  docs: Doc[];
  folders: Folder[];
  tableId: string;
  showAll?: boolean; // Aggregator mode
  tables?: TableCollection[];
  onOpenDoc: (doc: Doc) => void;
  onAddDoc: (folderId?: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteDoc?: (id: string) => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ 
    docs, 
    folders, 
    tableId,
    showAll = false,
    tables = [], 
    onOpenDoc, 
    onAddDoc, 
    onCreateFolder,
    onDeleteFolder,
    onDeleteDoc
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Filter for current view (or all if showAll)
  const currentFolders = folders.filter(f => showAll ? true : f.tableId === tableId);
  // Show docs that are in current table OR show all docs if showAll.
  // Docs inside folders are shown only when folder is open.
  
  const visibleFolders = !currentFolderId ? currentFolders : [];
  
  // Logic: 
  // If inside a folder -> show docs with that folderId
  // If at root -> show docs with no folderId. 
  // If showAll -> show docs with no folderId from ALL tables.
  const visibleDocs = !currentFolderId 
    ? docs.filter(d => showAll ? (!d.folderId) : (d.tableId === tableId && !d.folderId)) 
    : docs.filter(d => d.folderId === currentFolderId);

  const currentFolder = folders.find(f => f.id === currentFolderId);

  const getTableName = (tId: string) => tables.find(t => t.id === tId)?.name || 'Неизвестно';

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newFolderName.trim()) {
          onCreateFolder(newFolderName);
          setNewFolderName('');
          setIsFolderModalOpen(false);
      }
  };

  const handleDeleteFolderSafe = (folder: Folder) => {
      const hasDocs = docs.some(d => d.folderId === folder.id);
      if (hasDocs) {
          alert('Нельзя удалить папку, пока в ней есть документы. Сначала удалите или переместите их.');
          return;
      }
      if (confirm(`Удалить папку "${folder.name}"?`)) {
          onDeleteFolder(folder.id);
      }
  };

  const renderBreadcrumbs = () => (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 bg-white dark:bg-[#1e1e1e] p-2 rounded-lg border border-gray-100 dark:border-[#333] shadow-sm w-fit">
          <span 
            className={`cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded transition-colors ${!currentFolderId ? 'font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#252525]' : ''}`}
            onClick={() => setCurrentFolderId(null)}
          >
              {showAll ? 'Все документы' : 'Документы'}
          </span>
          {currentFolder && (
              <>
                <ChevronRight size={14} />
                <span className="font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#252525] px-2 py-1 rounded flex items-center gap-2">
                    <FolderIcon size={14} className="text-blue-500"/>
                    {currentFolder.name}
                </span>
              </>
          )}
      </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto w-full pt-8 px-6 flex-shrink-0">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg text-yellow-600 dark:text-yellow-400">
                <FileTextIcon size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Документы {showAll && <span className="text-sm font-normal text-gray-500">(Все страницы)</span>}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Управление документами и папками
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!currentFolderId && (
                <button onClick={() => setIsFolderModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg text-sm font-medium transition-colors">
                  <FolderPlus size={16} /> Папка
                </button>
              )}
              <button onClick={() => onAddDoc(currentFolderId || undefined)} className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 flex items-center gap-2 shadow-sm">
                <Plus size={18} /> Создать
              </button>
            </div>
          </div>
          
          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-full p-1 text-xs">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${viewMode === 'grid' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid size={14} /> Плитка
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${viewMode === 'list' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
              <ListIcon size={14} /> Список
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="max-w-7xl mx-auto w-full px-6 pb-20">
          {renderBreadcrumbs()}
           {viewMode === 'grid' ? (
               <div className="space-y-8">
                   {/* FOLDERS GRID */}
                   {visibleFolders.length > 0 && (
                       <div>
                           <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 ml-1">Папки</h3>
                           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                               {visibleFolders.map(folder => (
                                   <div 
                                        key={folder.id} 
                                        className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group relative flex flex-col items-center text-center gap-3"
                                        onClick={() => setCurrentFolderId(folder.id)}
                                   >
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center">
                                            <FolderIcon size={24} fill="currentColor" className="opacity-20 text-blue-600 dark:text-blue-400"/>
                                            <FolderIcon size={24} className="absolute text-blue-600 dark:text-blue-400"/>
                                        </div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate w-full px-2">{folder.name}</div>
                                        {showAll && (
                                            <div className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#333] px-2 py-0.5 rounded truncate max-w-full">
                                                {getTableName(folder.tableId)}
                                            </div>
                                        )}
                                        
                                        {!showAll && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFolderSafe(folder); }}
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                                                title="Удалить папку"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}

                   {/* DOCS GRID */}
                   <div>
                       {visibleFolders.length > 0 && visibleDocs.length > 0 && <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 mt-6 ml-1">Файлы</h3>}
                       
                       {visibleDocs.length === 0 && visibleFolders.length === 0 ? (
                           <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-[#333] rounded-xl bg-gray-50/50 dark:bg-[#202020] flex flex-col items-center">
                               <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                               <p className="text-gray-500 dark:text-gray-400 font-medium">Здесь пока пусто</p>
                               <p className="text-gray-400 dark:text-gray-500 text-sm">Создайте папку или добавьте документ</p>
                           </div>
                       ) : (
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                               {visibleDocs.map(doc => (
                                    <div key={doc.id} onClick={() => onOpenDoc(doc)} className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2 rounded-lg ${doc.type === 'internal' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                                {doc.type === 'internal' ? <FileText size={20}/> : <ExternalLink size={20}/>}
                                            </div>
                                            {onDeleteDoc && !showAll && (
                                                <button onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
                                                    <Trash2 size={14}/>
                                                </button>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{doc.title}</h3>
                                        {showAll && (
                                            <div className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
                                                <Box size={10} /> {getTableName(doc.tableId)}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {doc.tags.map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-[#303030] text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-600">{tag}</span>)}
                                        </div>
                                    </div>
                               ))}
                           </div>
                       )}
                   </div>
               </div>
           ) : (
               // LIST VIEW (TABLE)
               <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden">
                   <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400">
                           <tr>
                               <th className="px-4 py-3 font-semibold w-12"></th>
                               <th className="px-4 py-3 font-semibold">Название</th>
                               {showAll && <th className="px-4 py-3 font-semibold w-32">Источник</th>}
                               <th className="px-4 py-3 font-semibold w-32">Тип</th>
                               <th className="px-4 py-3 font-semibold w-48">Теги</th>
                               {!showAll && <th className="px-4 py-3 w-10"></th>}
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                           {/* Folders first in List View */}
                           {visibleFolders.map(folder => (
                               <tr key={folder.id} onClick={() => setCurrentFolderId(folder.id)} className="hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer group">
                                   <td className="px-4 py-3 text-center text-blue-500">
                                       <FolderIcon size={18} fill="currentColor" className="opacity-20"/>
                                   </td>
                                   <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{folder.name}</td>
                                   {showAll && (
                                       <td className="px-4 py-3 text-xs text-gray-500">
                                           <span className="bg-gray-100 dark:bg-[#333] px-2 py-0.5 rounded">{getTableName(folder.tableId)}</span>
                                       </td>
                                   )}
                                   <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">Папка</td>
                                   <td className="px-4 py-3"></td>
                                   {!showAll && (
                                       <td className="px-4 py-3 text-right">
                                           <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFolderSafe(folder); }} 
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                       </td>
                                   )}
                               </tr>
                           ))}

                           {visibleDocs.map(doc => {
                               return (
                                   <tr key={doc.id} onClick={() => onOpenDoc(doc)} className="hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer group">
                                       <td className="px-4 py-3 text-center text-gray-400">
                                            {doc.type === 'internal' ? <FileText size={16} /> : <ExternalLink size={16} />}
                                       </td>
                                       <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{doc.title}</td>
                                       {showAll && (
                                           <td className="px-4 py-3 text-xs text-gray-500">
                                               <span className="bg-gray-100 dark:bg-[#333] px-2 py-0.5 rounded">{getTableName(doc.tableId)}</span>
                                           </td>
                                       )}
                                       <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                           {doc.type === 'internal' ? 'Статья' : 'Ссылка'}
                                       </td>
                                       <td className="px-4 py-3">
                                           <div className="flex gap-1 flex-wrap">
                                               {doc.tags.map(t => <span key={t} className="text-[10px] bg-gray-100 dark:bg-[#303030] px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-600">{t}</span>)}
                                           </div>
                                       </td>
                                       {!showAll && (
                                           <td className="px-4 py-3 text-right">
                                                {onDeleteDoc && (
                                                    <button onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                )}
                                           </td>
                                       )}
                                   </tr>
                               );
                           })}
                           {visibleDocs.length === 0 && visibleFolders.length === 0 && <tr><td colSpan={showAll ? 6 : 5} className="text-center py-8 text-gray-400 dark:text-gray-500">Нет документов</td></tr>}
                       </tbody>
                   </table>
               </div>
           )}
        </div>
      </div>

      {/* Create Folder Modal */}
       {isFolderModalOpen && (
           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-in fade-in duration-200">
               <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-[#333] p-6">
                   <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                       <FolderPlus size={20} className="text-blue-500"/>
                       Новая папка
                   </h3>
                   <form onSubmit={handleCreateFolderSubmit}>
                       <input 
                            autoFocus
                            required
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Название папки"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100"
                       />
                       <div className="flex justify-end gap-2">
                           <button type="button" onClick={() => setIsFolderModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-sm font-medium">Отмена</button>
                           <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm">Создать</button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default DocumentsView;
