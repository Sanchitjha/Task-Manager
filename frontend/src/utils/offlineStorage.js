// Offline storage utility for PWA
export class OfflineStorage {
  constructor() {
    this.dbName = 'TaskManagerDB';
    this.version = 1;
    this.stores = {
      videos: 'videos',
      watchProgress: 'watchProgress',
      transactions: 'transactions',
      userProfile: 'userProfile',
      products: 'products'
    };
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Videos store
        if (!db.objectStoreNames.contains(this.stores.videos)) {
          const videosStore = db.createObjectStore(this.stores.videos, { keyPath: '_id' });
          videosStore.createIndex('isActive', 'isActive');
          videosStore.createIndex('createdAt', 'createdAt');
        }

        // Watch progress store
        if (!db.objectStoreNames.contains(this.stores.watchProgress)) {
          const progressStore = db.createObjectStore(this.stores.watchProgress, { keyPath: 'id', autoIncrement: true });
          progressStore.createIndex('videoId', 'videoId');
          progressStore.createIndex('userId', 'userId');
          progressStore.createIndex('synced', 'synced');
        }

        // Transactions store
        if (!db.objectStoreNames.contains(this.stores.transactions)) {
          const transactionsStore = db.createObjectStore(this.stores.transactions, { keyPath: '_id' });
          transactionsStore.createIndex('userId', 'userId');
          transactionsStore.createIndex('type', 'type');
          transactionsStore.createIndex('createdAt', 'createdAt');
        }

        // User profile store
        if (!db.objectStoreNames.contains(this.stores.userProfile)) {
          db.createObjectStore(this.stores.userProfile, { keyPath: '_id' });
        }

        // Products store
        if (!db.objectStoreNames.contains(this.stores.products)) {
          const productsStore = db.createObjectStore(this.stores.products, { keyPath: '_id' });
          productsStore.createIndex('category', 'category');
          productsStore.createIndex('isPublished', 'isPublished');
        }
      };
    });
  }

  // Generic method to store data
  async store(storeName, data) {
    const db = await this.init();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    if (Array.isArray(data)) {
      for (const item of data) {
        store.put(item);
      }
    } else {
      store.put(data);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Generic method to retrieve data
  async get(storeName, key) {
    const db = await this.init();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all items from a store
  async getAll(storeName, indexName = null, value = null) {
    const db = await this.init();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    let request;
    if (indexName && value) {
      const index = store.index(indexName);
      request = index.getAll(value);
    } else {
      request = store.getAll();
    }

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Store video watch progress for offline sync
  async storeWatchProgress(videoId, watchTime, userId, token) {
    const progressData = {
      videoId,
      watchTime,
      userId,
      token,
      timestamp: Date.now(),
      synced: false
    };

    await this.store(this.stores.watchProgress, progressData);
    
    // Also store in localStorage as backup
    const pendingProgress = JSON.parse(localStorage.getItem('pendingVideoProgress') || '[]');
    pendingProgress.push({ ...progressData, id: Date.now() });
    localStorage.setItem('pendingVideoProgress', JSON.stringify(pendingProgress));
  }

  // Get unsynced watch progress
  async getUnsyncedProgress() {
    return await this.getAll(this.stores.watchProgress, 'synced', false);
  }

  // Mark progress as synced
  async markProgressSynced(progressId) {
    const db = await this.init();
    const transaction = db.transaction([this.stores.watchProgress], 'readwrite');
    const store = transaction.objectStore(progressName);
    
    const progress = await this.get(this.stores.watchProgress, progressId);
    if (progress) {
      progress.synced = true;
      store.put(progress);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Cache videos for offline access
  async cacheVideos(videos) {
    await this.store(this.stores.videos, videos);
  }

  // Get cached videos
  async getCachedVideos() {
    return await this.getAll(this.stores.videos);
  }

  // Cache user profile
  async cacheUserProfile(profile) {
    await this.store(this.stores.userProfile, profile);
  }

  // Get cached user profile
  async getCachedUserProfile() {
    const profiles = await this.getAll(this.stores.userProfile);
    return profiles[0] || null;
  }

  // Cache transactions
  async cacheTransactions(transactions) {
    await this.store(this.stores.transactions, transactions);
  }

  // Get cached transactions
  async getCachedTransactions(userId) {
    return await this.getAll(this.stores.transactions, 'userId', userId);
  }

  // Cache products
  async cacheProducts(products) {
    await this.store(this.stores.products, products);
  }

  // Get cached products
  async getCachedProducts() {
    return await this.getAll(this.stores.products);
  }

  // Clear all cached data
  async clearCache() {
    const db = await this.init();
    const stores = Object.values(this.stores);
    
    for (const storeName of stores) {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      store.clear();
    }
  }

  // Export data for debugging
  async exportData() {
    const data = {};
    
    for (const [key, storeName] of Object.entries(this.stores)) {
      data[key] = await this.getAll(storeName);
    }
    
    return data;
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();