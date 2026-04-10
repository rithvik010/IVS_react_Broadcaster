import React, { useState } from 'react';
import Broadcaster from './Broadcaster';
import Receiver from './Receiver';

function App() {
  const [mode, setMode] = useState('broadcaster'); 

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <h1>My Stream App</h1>
      
      {/* Navigation Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button
          onClick={() => setMode('broadcaster')}
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px',
            backgroundColor: mode === 'broadcaster' ? '#007bff' : '#e0e0e0', 
            color: mode === 'broadcaster' ? 'white' : 'black', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          📹 Go Live (Broadcaster)
        </button>
        <button
          onClick={() => setMode('receiver')}
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px',
            backgroundColor: mode === 'receiver' ? '#28a745' : '#e0e0e0', 
            color: mode === 'receiver' ? 'white' : 'black', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          📺 Watch Stream (Receiver)
        </button>
      </div>

      <hr style={{ border: '1px solid #ccc', marginBottom: '30px' }} />

      {/* Render the selected component */}
      {mode === 'broadcaster' ? <Broadcaster /> : <Receiver />}
    </div>
  );
}

export default App;