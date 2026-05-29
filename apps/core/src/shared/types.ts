/** Decrypted BrightID backup blob. Shape is intentionally loose — the backup
 * carries arbitrary user data restored from the recovery channel. */
export interface BrightIdBackup {
  [key: string]: unknown;
}
