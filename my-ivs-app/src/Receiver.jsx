import React, { useEffect, useRef, useState } from 'react';

const Receiver = () => {
  const videoRef = useRef(null);
  const [inputUrl, setInputUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [status, setStatus] = useState('Waiting for a Playback URL...');

  useEffect(() => {
    if (!activeUrl) return;

    let player;

    const initializePlayer = () => {
      try {
        setStatus('Connecting to stream...');
        
        // Grab the player from the AWS CDN we put in index.html
        const IVSPlayer = window.IVSPlayer;
        
        if (!IVSPlayer || !IVSPlayer.isPlayerSupported) {
          setStatus('Your browser does not support the IVS Player.');
          return;
        }

        // Create the player (No messy WASM overrides needed anymore!)
        player = IVSPlayer.create();
        player.attachHTMLVideoElement(videoRef.current);
        
        player.load(activeUrl);
        player.play();

        player.addEventListener(IVSPlayer.PlayerState.PLAYING, () => {
          setStatus('LIVE');
        });

        player.addEventListener(IVSPlayer.PlayerEventType.ERROR, (error) => {
          console.error('IVS Player Error:', error);
          setStatus('Error: Stream offline or invalid URL.');
        });

      } catch (err) {
        console.error('Error initializing player:', err);
        setStatus('Failed to initialize player.');
      }
    };

    initializePlayer();

    return () => {
      if (player) {
        player.delete();
      }
    };
  }, [activeUrl]);

  const handleJoinStream = (e) => {
    e.preventDefault();
    if (inputUrl.trim() !== '') {
      setActiveUrl(inputUrl.trim());
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#333' }}>Live Stream Receiver</h2>
      
      <form onSubmit={handleJoinStream} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Paste AWS IVS Playback URL (.m3u8) here..." 
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit"
          style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Join Stream
        </button>
      </form>

      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <strong>Status: </strong> 
        <span style={{ color: status === 'LIVE' ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
          {status}
        </span>
      </div>

      <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          style={{ width: '100%', display: 'block', aspectRatio: '16/9' }}
        />
      </div>
    </div>
  );
};

export default Receiver;