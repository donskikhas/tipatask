
import { useState } from 'react';
import { Doc, Folder, Meeting, ContentPost } from '../../../types';
import { api } from '../../../backend/api';

export const useContentLogic = (showNotification: (msg: string) => void, activeTableId: string) => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
  
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | undefined>(undefined);
  const [activeDocId, setActiveDocId] = useState<string>('');

  // Meetings
  const saveMeeting = (m: Meeting) => { const u = [...meetings, m]; setMeetings(u); api.meetings.updateAll(u); showNotification('Встреча добавлена'); };
  const updateMeetingSummary = (id: string, summary: string) => { const u = meetings.map(m => m.id === id ? { ...m, summary } : m); setMeetings(u); api.meetings.updateAll(u); };

  // Content Plan
  const savePost = (p: ContentPost) => {
      const updated = contentPosts.find(x => x.id === p.id) ? contentPosts.map(x => x.id === p.id ? p : x) : [...contentPosts, p];
      setContentPosts(updated); api.contentPosts.updateAll(updated); showNotification('Пост сохранен');
  };
  const deletePost = (id: string) => { const u = contentPosts.filter(p => p.id !== id); setContentPosts(u); api.contentPosts.updateAll(u); showNotification('Пост удален'); };

  // Docs
  const saveDoc = (docData: any, tableId?: string) => {
      const targetTableId = tableId || activeTableId;
      if (!targetTableId) {
          console.error('Не удалось создать документ: tableId не установлен', { tableId, activeTableId });
          showNotification('Ошибка: не выбрана страница');
          setIsDocModalOpen(false);
          return;
      }
      if (!docData || !docData.title || !docData.title.trim()) {
          showNotification('Введите название документа');
          return;
      }
      const newDoc: Doc = { 
          id: `d-${Date.now()}`, 
          tableId: targetTableId, 
          folderId: targetFolderId,
          title: docData.title.trim(), 
          url: docData.url, 
          content: '', 
          tags: docData.tags || [], 
          type: docData.type || 'link'
      };
      const newDocs = [...docs, newDoc]; 
      setDocs(newDocs); 
      api.docs.updateAll(newDocs); 
      setIsDocModalOpen(false);
      setTargetFolderId(undefined); // Сброс после создания
      showNotification('Документ добавлен');
      return newDoc;
  };
  const saveDocContent = (id: string, content: string, title: string) => { const u = docs.map(d => d.id === id ? { ...d, content, title } : d); setDocs(u); api.docs.updateAll(u); showNotification('Сохранено'); };
  const deleteDoc = (id: string) => { const u = docs.filter(d => d.id !== id); setDocs(u); api.docs.updateAll(u); showNotification('Документ удален'); };

  // Folders
  const createFolder = (name: string, tableId?: string) => {
      const targetTableId = tableId || activeTableId;
      if (!targetTableId) {
          console.error('Не удалось создать папку: tableId не установлен', { tableId, activeTableId });
          showNotification('Ошибка: не выбрана страница');
          return;
      }
      if (!name || !name.trim()) {
          showNotification('Введите название папки');
          return;
      }
      const newFolder: Folder = { id: `f-${Date.now()}`, tableId: targetTableId, name: name.trim() };
      const u = [...folders, newFolder]; 
      setFolders(u); 
      api.folders.updateAll(u); 
      showNotification('Папка создана');
  };
  const deleteFolder = (id: string) => { 
      const u = folders.filter(f => f.id !== id); 
      setFolders(u); 
      api.folders.updateAll(u); 
      showNotification('Папка удалена'); 
  };

  const handleDocClick = (doc: Doc) => {
      if (doc.type === 'link' && doc.url) window.open(doc.url, '_blank');
      else { setActiveDocId(doc.id); return 'doc-editor'; }
      return null;
  };

  return {
    state: { docs, folders, meetings, contentPosts, isDocModalOpen, activeDocId },
    setters: { setDocs, setFolders, setMeetings, setContentPosts, setActiveDocId },
    actions: { 
        saveMeeting, updateMeetingSummary, savePost, deletePost,
        saveDoc, saveDocContent, deleteDoc, createFolder, deleteFolder, handleDocClick,
        openDocModal: (folderId?: string) => { setTargetFolderId(folderId); setIsDocModalOpen(true); },
        closeDocModal: () => setIsDocModalOpen(false)
    }
  };
};
