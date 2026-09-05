import { useSearchParams } from '@solidjs/router';
import { createMemo, createSignal } from 'solid-js';
import { useBackup } from '@/hooks/use-backup';
import { useMyEvaluationData } from '@/hooks/use-my-evaluations';
import { EvaluationCategory } from '@aura/domain/types/evaluations';
import type {
  BrightIdBackupConnection,
  ConnectionLevel,
} from '@aura/domain/types/aura';

export type SubjectSort = 'recency' | 'name';
export type SubjectRatedState = 'all' | 'rated' | 'unrated';

const LEVELS: ConnectionLevel[] = [
  'reported',
  'suspicious',
  'just met',
  'already known',
  'recovery',
  'aura only',
];

/**
 * Subjects to evaluate: the user's backup connections with a default ordering
 * (newest first, un-rated "already known" / "recovery" promoted to the top),
 * plus local search / filter / sort controls.
 *
 * Filter/sort state is local to the route via signals — it doesn't need to
 * outlive the page, so no store. When a non-default sort is active the
 * promotion is dropped (the explicit sort wins).
 */
export function useSubjectsList() {
  const backup = useBackup();
  const { myRatings, connections: nodeConnections } = useMyEvaluationData(
    () => EvaluationCategory.SUBJECT,
  );

  // Connections to evaluate come from the decrypted recovery backup when we
  // have one. Passkey sessions have no backup (no password to decrypt with),
  // so fall back to the node's own connection list — it carries id/level/
  // timestamp; names just resolve to short ids without backup data.
  const baseConnections = createMemo<BrightIdBackupConnection[] | null>(() => {
    const fromBackup = backup.data?.connections;
    if (fromBackup?.length) return fromBackup;
    return nodeConnections() ?? null;
  });

  // Search lives in `?search=` so global search / empty-state links can deep
  // link into the filtered list (old `/home?search=` behavior).
  const [params, setParams] = useSearchParams();
  const search = createMemo(() =>
    typeof params.search === 'string' ? params.search : '',
  );
  const setSearch = (value: string) =>
    setParams({ search: value || undefined }, { replace: true });

  const [sort, setSort] = createSignal<SubjectSort>('recency');
  const [levels, setLevels] = createSignal<ConnectionLevel[]>([]);
  const [ratedState, setRatedState] = createSignal<SubjectRatedState>('all');

  function toggleLevel(level: ConnectionLevel) {
    setLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  }

  function reset() {
    setSearch('');
    setSort('recency');
    setLevels([]);
    setRatedState('all');
  }

  const subjects = createMemo<BrightIdBackupConnection[] | null>(() => {
    const conns = baseConnections();
    const ratings = myRatings();
    if (!conns || ratings === null) return null;

    const isRated = (id: string) => ratings.some((r) => r.toBrightId === id);

    const unique = [...new Map(conns.map((c) => [c.id, c])).values()];

    const query = search().trim().toLowerCase();
    const activeLevels = levels();
    const rated = ratedState();

    const filtered = unique.filter((c) => {
      if (query) {
        const name = (c.name ?? '').toLowerCase();
        if (!name.includes(query) && !c.id.toLowerCase().includes(query))
          return false;
      }
      if (activeLevels.length && !activeLevels.includes(c.level)) return false;
      if (rated === 'rated' && !isRated(c.id)) return false;
      if (rated === 'unrated' && isRated(c.id)) return false;
      return true;
    });

    if (sort() === 'name') {
      return filtered.sort((a, b) =>
        (a.name ?? a.id).localeCompare(b.name ?? b.id),
      );
    }

    // Default recency sort: newest first, with un-rated "already known" /
    // "recovery" connections promoted to the top.
    const sorted = filtered.sort(
      (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0),
    );
    const [promoted, rest] = sorted.reduce<
      [BrightIdBackupConnection[], BrightIdBackupConnection[]]
    >(
      (acc, c) => {
        const promote =
          !isRated(c.id) &&
          (c.level === 'already known' || c.level === 'recovery');
        acc[promote ? 0 : 1].push(c);
        return acc;
      },
      [[], []],
    );
    return [...promoted, ...rest];
  });

  return {
    subjects,
    loading: () => backup.isLoading || myRatings() === null,
    levelOptions: LEVELS,
    search,
    setSearch,
    sort,
    setSort,
    levels,
    toggleLevel,
    ratedState,
    setRatedState,
    reset,
  };
}
