export type VerificationSaveResult = 'synced' | 'unlinked' | 'sync-failed';

// A failed sync must not disguise a successful project save. A retry omits saveLevel.
export async function saveVerification({
  saveLevel,
  syncLevel,
}: {
  saveLevel?: () => Promise<void>;
  syncLevel: () => Promise<{ updated: boolean; reason?: string }>;
}): Promise<VerificationSaveResult> {
  await saveLevel?.();
  try {
    const result = await syncLevel();
    if (result.updated) return 'synced';
    return result.reason === 'no_linked_app' ? 'unlinked' : 'sync-failed';
  } catch {
    return 'sync-failed';
  }
}
