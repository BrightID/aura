import localforage from 'localforage';

export async function checkIndexedDB() {
  try {
    await localforage.setItem('testKey', 'testValue');
    await localforage.removeItem('testKey');
    return true; // IndexedDB is working
  } catch (error) {
    console.error('IndexedDB Access Blocked:', error);

    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'SecurityError' ||
      error.name === 'InvalidStateError'
    ) {
      return false; // IndexedDB is blocked
    }

    return false; // Some other error occurred
  }
}
