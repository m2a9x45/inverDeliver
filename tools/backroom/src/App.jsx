import React, { useState } from 'react';
import './App.css';

function App() {

  const [text, setText] = useState("");

  async function search(e) {
    if (e.keyCode === 13) {
      console.log(text);

      try {
        const result = await fetch('http://localhost:3001/product/standard');
        const json = await result.json();
        console.log(json);
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <div className="App">
      <div>
        <input value={text} onInput={(e) => setText(e.target.value)} onKeyDown={(e) => search(e)} type="text" placeholder="Search"/>
      </div>
      
    </div>
  );
}

export default App;
