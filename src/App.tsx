import { Component } from 'solid-js';
import DigitalMirror from './components/DigitalMirror';

const App: Component = () => {
  return (
    <main class="w-screen h-screen bg-cyber-dark overflow-hidden">
      <DigitalMirror />
    </main>
  );
};

export default App;
