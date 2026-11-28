import { useNotesReducer } from '../hooks/notes/notes-reducer.hook';
import './app.css';
import { Board } from './board';

/** Root of the app: owns the notes store and hands it to the board. */
export const App = () => {
  const { notes, createNote, moveNote, resizeNote, deleteNote, setNoteColor, setNoteText } =
    useNotesReducer();

  return (
    <main className="app">
      <h1 className="app__title">Sticky Notes</h1>
      <Board
        notes={notes}
        onCreateNote={createNote}
        onMoveNote={moveNote}
        onResizeNote={resizeNote}
        onDeleteNote={deleteNote}
        onSetNoteColor={setNoteColor}
        onSetNoteText={setNoteText}
      />
    </main>
  );
};
