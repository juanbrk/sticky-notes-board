import { useNotesReducer } from '../hooks/notes/notes-reducer.hook';
import './app.css';
import { Board } from './board';

export const App = () => {
  const { notes, createNote } = useNotesReducer();

  return (
    <main className="app">
      <h1 className="app__title">Sticky Notes</h1>
      <Board notes={notes} onCreateNote={createNote} />
    </main>
  );
};
