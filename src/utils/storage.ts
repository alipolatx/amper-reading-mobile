import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
  USERNAME: '@amper_tracker:username',
  LAST_SYNC: '@amper_tracker:last_sync',
  USER_PREFERENCES: '@amper_tracker:preferences',
} as const;

// User Preferences Interface
export interface UserPreferences {
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}

// Default Preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  autoRefresh: true,
  refreshInterval: 60, // 60 seconds
  theme: 'auto',
  notifications: true,
};

class StorageService {
  // Username operations
  async saveUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
      console.log('✅ Username saved:', username);
    } catch (error) {
      console.error('❌ Error saving username:', error);
      throw error;
    }
  }

  async getUsername(): Promise<string | null> {
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      return username;
    } catch (error) {
      console.error('❌ Error getting username:', error);
      return null;
    }
  }

  async removeUsername(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME);
      console.log('🗑️ Username removed');
    } catch (error) {
      console.error('❌ Error removing username:', error);
      throw error;
    }
  }

  // Last sync operations
  async saveLastSync(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('❌ Error saving last sync:', error);
    }
  }

  async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('❌ Error getting last sync:', error);
      return null;
    }
  }

  // User preferences operations
  async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const currentPrefs = await this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
      console.log('✅ Preferences saved:', updatedPrefs);
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      throw error;
    }
  }

  async getPreferences(): Promise<UserPreferences> {
    try {
      const prefsString = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (prefsString) {
        const prefs = JSON.parse(prefsString);
        return { ...DEFAULT_PREFERENCES, ...prefs };
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('❌ Error getting preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USERNAME,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.USER_PREFERENCES,
      ]);
      console.log('🗑️ All data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    const username = await this.getUsername();
    return username !== null && username.trim().length > 0;
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService; 