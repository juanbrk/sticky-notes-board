import { useNotesReducer } from '../hooks/notes/notes-reducer.hook';
import { usePersistNotes } from '../hooks/notes/persist-notes.hook';
import { createLocalStorageNotesRepository } from '../lib/local-storage-notes.repository';
import './app.css';
import { Board } from './board';

// The one place that knows where notes are kept; swapping storage changes only this line.
const notesRepository = createLocalStorageNotesRepository();

/** Root of the app: owns the notes store, keeps it saved, and hands it to the board. */
export const App = () => {
  const {
    notes,
    createNote,
    moveNote,
    resizeNote,
    deleteNote,
    setNoteColor,
    bringNoteToFront,
    setNoteText,
    loadNotes,
  } = useNotesReducer();
  const { isLoading } = usePersistNotes({ repository: notesRepository, notes, onLoad: loadNotes });

  return (
    <main className="app">
      <h1 className="app__title">Sticky Notes</h1>
      <Board
        notes={notes}
        isLoading={isLoading}
        onCreateNote={createNote}
        onMoveNote={moveNote}
        onResizeNote={resizeNote}
        onDeleteNote={deleteNote}
        onSetNoteColor={setNoteColor}
        onBringNoteToFront={bringNoteToFront}
        onSetNoteText={setNoteText}
      />
    </main>
  );
};
