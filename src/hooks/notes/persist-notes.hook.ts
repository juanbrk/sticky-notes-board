import { useEffect, useRef, useState } from 'react';

import type * as Notes from '../../types/notes.types';
import type * as Storage from '../../types/storage.types';

/**
 * Loads the saved notes once, hands them to `onLoad`, then saves the board
 * every time `notes` changes. Nothing is saved before the load ends, so the
 * empty board shown meanwhile can never overwrite the saved one. If the load
 * fails, nothing is saved for the rest of the session either: a failed read
 * must not wipe what the storage still holds.
 *
 * StrictMode runs the load effect twice on mount; both runs share one load
 * promise, so storage is read once. Saves run one after another, so a slow
 * earlier save can never land after a later one.
 *
 * @param options.repository - Where notes are kept; must keep the same identity across renders
 * @param options.notes - The board's current notes
 * @param options.onLoad - Receives the saved notes once loaded; must be stable
 * @returns Whether the saved notes are still loading
 */
export const usePersistNotes = ({
  repository,
  notes,
  onLoad,
}: Storage.PersistNotesOptions): Storage.NotesPersistence => {
  const [status, setStatus] = useState<Storage.NotesLoadStatus>('loading');
  const loadRef = useRef<Promise<readonly Notes.Note[]> | null>(null);
  // A later effect run must not replay the old snapshot over newer edits.
  const hasHandledLoadRef = useRef(false);
  // The notes the storage already holds: the loaded ones, then the last saved.
  const lastSyncedNotesRef = useRef<readonly Notes.Note[] | null>(null);
  const saveQueueRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let isCancelled = false;
    loadRef.current ??= repository.load();
    loadRef.current
      .then((loadedNotes) => {
        if (isCancelled || hasHandledLoadRef.current) return;
        hasHandledLoadRef.current = true;
        lastSyncedNotesRef.current = loadedNotes;
        onLoad(loadedNotes);
        setStatus('loaded');
      })
      .catch((error: unknown) => {
        if (isCancelled || hasHandledLoadRef.current) return;
        hasHandledLoadRef.current = true;
        console.warn('Could not read the saved notes; changes will not be saved.', error);
        setStatus('failed');
      });
    return () => {
      isCancelled = true;
    };
  }, [repository, onLoad]);

  useEffect(() => {
    const isSaveNeeded = status === 'loaded' && notes !== lastSyncedNotesRef.current;
    if (!isSaveNeeded) return;
    lastSyncedNotesRef.current = notes;
    saveQueueRef.current = (saveQueueRef.current ?? Promise.resolve())
      .then(() => repository.save(notes))
      .catch((error: unknown) => {
        console.error('Could not save the notes; they are kept in memory only.', error);
      });
  }, [status, notes, repository]);

  return { isLoading: status === 'loading' };
};
