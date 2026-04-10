/**
 * Secure Storage Utility for Kestopur
 * Provides basic obfuscation for localStorage data using Base64 encoding.
 * Note: This is simple obfuscation, not strong encryption.
 */

class SecureStorage {
  private prefix = '__kp_';

  private encode(data: any): string | null {
    try {
      const jsonString = JSON.stringify(data);
      if (typeof window === 'undefined') return null;
      return btoa(unescape(encodeURIComponent(jsonString)));
    } catch (error) {
      console.error('Error encoding data:', error);
      return null;
    }
  }

  private decode(encodedData: string): any {
    try {
      if (typeof window === 'undefined') return null;
      const jsonString = decodeURIComponent(escape(atob(encodedData)));
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decoding data:', error);
      return null;
    }
  }

  setItem(key: string, value: any): boolean {
    try {
      const encoded = this.encode(value);
      if (encoded && typeof window !== 'undefined') {
        localStorage.setItem(this.prefix + key, encoded);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting item:', error);
      return false;
    }
  }

  getItem(key: string): any {
    try {
      if (typeof window === 'undefined') return null;
      const encoded = localStorage.getItem(this.prefix + key);
      if (!encoded) return null;
      return this.decode(encoded);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  removeItem(key: string): boolean {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.prefix + key);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

export const secureStorage = new SecureStorage();
export default secureStorage;
