
import { Novel, Part, Chapter, Character, Location, Relation, Idea, TrashItem } from '../types';

const STORAGE_KEY = 'novelcraft_data';

export interface NovelExtended extends Novel {
  deletedAt?: number;
}

interface DataStore {
  novels: NovelExtended[];
  parts: Record<string, Part[]>;
  chapters: Record<string, Chapter[]>;
  characters: Record<string, Character[]>;
  world: Record<string, Location[]>;
  relations: Record<string, Relation[]>;
  ideas: Record<string, Idea[]>;
  trash: Record<string, TrashItem[]>;
}

const getStore = (): DataStore => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { 
    novels: [], 
    parts: {}, 
    chapters: {}, 
    characters: {}, 
    world: {}, 
    relations: {}, 
    ideas: {},
    trash: {} 
  };
};

const saveStore = (store: DataStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const db = {
  // --- Gestión Global / Backups ---
  exportAll: () => {
    return localStorage.getItem(STORAGE_KEY) || JSON.stringify({ 
      novels: [], parts: {}, chapters: {}, characters: {}, world: {}, relations: {}, ideas: {}, trash: {} 
    });
  },

  importAll: (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      // Validación básica de estructura
      if (parsed && typeof parsed === 'object' && parsed.novels) {
        localStorage.setItem(STORAGE_KEY, jsonData);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error al importar datos:", e);
      return false;
    }
  },

  getNovels: () => getStore().novels.filter(n => !n.deletedAt),
  getDeletedNovels: () => getStore().novels.filter(n => !!n.deletedAt),
  
  addNovel: (title: string) => {
    const store = getStore();
    const newNovel: NovelExtended = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    store.novels.push(newNovel);
    saveStore(store);
    return newNovel;
  },
  
  deleteNovel: (id: string) => {
    const store = getStore();
    store.novels = store.novels.map(n => 
      n.id === id ? { ...n, deletedAt: Date.now() } : n
    );
    saveStore(store);
  },

  restoreNovel: (id: string) => {
    const store = getStore();
    store.novels = store.novels.map(n => 
      n.id === id ? { ...n, deletedAt: undefined } : n
    );
    saveStore(store);
  },

  permanentDeleteNovel: (id: string) => {
    const store = getStore();
    store.novels = store.novels.filter(n => n.id !== id);
    delete store.parts[id];
    delete store.chapters[id];
    delete store.characters[id];
    delete store.world[id];
    delete store.relations[id];
    delete store.ideas[id];
    delete store.trash[id];
    saveStore(store);
  },

  updateNovel: (id: string, updates: Partial<NovelExtended>) => {
    const store = getStore();
    store.novels = store.novels.map(n => n.id === id ? { ...n, ...updates } : n);
    saveStore(store);
  },
  
  getCollection: <T,>(novelId: string, collection: keyof Omit<DataStore, 'novels'>): T[] => {
    const store = getStore();
    return (store[collection][novelId] || []) as unknown as T[];
  },
  
  addToCollection: <T extends { id: string },>(novelId: string, collection: keyof Omit<DataStore, 'novels'>, data: Omit<T, 'id'>) => {
    const store = getStore();
    const newItem = { id: Math.random().toString(36).substr(2, 9), ...data } as T;
    if (!store[collection][novelId]) store[collection][novelId] = [];
    (store[collection][novelId] as any[]).push(newItem);
    saveStore(store);
    return newItem;
  },

  updateInCollection: <T extends { id: string },>(novelId: string, collection: keyof Omit<DataStore, 'novels'>, itemId: string, updates: Partial<T>) => {
    const store = getStore();
    if (store[collection][novelId]) {
      store[collection][novelId] = (store[collection][novelId] as any[]).map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
    }
    saveStore(store);
  },

  updateCollectionOrder: (novelId: string, collection: 'parts' | 'chapters', items: any[]) => {
    const store = getStore();
    store[collection][novelId] = items;
    saveStore(store);
  },

  deleteToTrash: (novelId: string, collection: keyof Omit<DataStore, 'novels' | 'trash'>, itemId: string) => {
    const store = getStore();
    const item = (store[collection][novelId] || []).find((i: any) => i.id === itemId);
    if (item) {
      store[collection][novelId] = (store[collection][novelId] as any[]).filter(i => i.id !== itemId);
      if (!store.trash[novelId]) store.trash[novelId] = [];
      store.trash[novelId].push({
        id: Math.random().toString(36).substr(2, 9),
        originalCollection: collection,
        data: item,
        deletedAt: Date.now()
      });
    }
    saveStore(store);
  },

  restoreFromTrash: (novelId: string, trashItemId: string) => {
    const store = getStore();
    const trashItem = (store.trash[novelId] || []).find(i => i.id === trashItemId);
    if (trashItem) {
      const collection = trashItem.originalCollection as keyof Omit<DataStore, 'novels' | 'trash'>;
      if (!store[collection][novelId]) store[collection][novelId] = [];
      
      // Restauramos la data original que incluye order y partId originales
      (store[collection][novelId] as any[]).push(trashItem.data);
      
      // Re-ordenamos para que el elemento recupere su hueco exacto basado en el campo 'order'
      if (collection === 'parts' || collection === 'chapters') {
        (store[collection][novelId] as any[]).sort((a, b) => (a.order || 0) - (b.order || 0));
      }

      store.trash[novelId] = store.trash[novelId].filter(i => i.id !== trashItemId);
    }
    saveStore(store);
  },

  permanentDelete: (novelId: string, trashItemId: string) => {
    const store = getStore();
    if (store.trash[novelId]) {
      store.trash[novelId] = store.trash[novelId].filter(i => i.id !== trashItemId);
    }
    saveStore(store);
  },

  deleteFromCollection: (novelId: string, collection: keyof Omit<DataStore, 'novels'>, itemId: string) => {
    const store = getStore();
    if (store[collection][novelId]) {
      store[collection][novelId] = (store[collection][novelId] as any[]).filter(item => item.id !== itemId);
    }
    saveStore(store);
  }
};
