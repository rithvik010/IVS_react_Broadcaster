import React, { useState, useRef, useEffect } from 'react';

const Broadcaster = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Loading stream configuration...');
  
  // NEW: State to hold our database credentials
  const [streamConfig, setStreamConfig] = useState(null);
  
  const videoRef = useRef(null);
  const clientRef = useRef(null);
  const localStreamRef = useRef(null);

  // NEW: Fetch the credentials from your backend when the app loads
  useEffect(() => {
    // We are asking the backend (which we will build next) for test_user's info
    fetch('http://localhost:3000/api/get-stream-key?user=test_user')
      .then(response => response.json())
      .then(data => {
        if (data && data.stream_key) {
          setStreamConfig(data);
          setStatusMessage('Idle - Ready to Stream');
        } else {
          setStatusMessage('Error: Could not find user in database.');
        }
      })
      .catch(error => {
        console.error("Backend fetch error:", error);
        setStatusMessage('Error: Cannot connect to backend server. Is it running?');
      });

    // Cleanup when component unmounts
    return () => stopStream();
  }, []);

  const startStream = async () => {
    // NEW: Prevent starting if we don't have the DB info yet
    if (!streamConfig) {
      setStatusMessage('Cannot start: Still waiting for database info.');
      return;
    }

    try {
      setStatusMessage('Requesting camera and mic permissions...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      localStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatusMessage('Initializing Broadcast Client...');

      const IVSBroadcastClient = (await import('amazon-ivs-web-broadcast')).default;
      
      // UPDATED: Use the ingest endpoint from the database
      const client = IVSBroadcastClient.create({
        streamConfig: IVSBroadcastClient.BASIC_LANDSCAPE,
        ingestEndpoint: streamConfig.ingest_endpoint, 
      });
      clientRef.current = client;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      await client.addVideoInputDevice(new MediaStream([videoTrack]), 'camera1', { index: 0 });
      await client.addAudioInputDevice(new MediaStream([audioTrack]), 'mic1');

      setStatusMessage('Connecting to AWS IVS...');

      // UPDATED: Use the stream key from the database
      await client.startBroadcast(streamConfig.stream_key);
      
      setIsStreaming(true);
      setStatusMessage('LIVE: Streaming to AWS IVS!');

    } catch (error) {
      console.error('Error starting stream:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const stopStream = async () => {
    setStatusMessage('Stopping stream...');
    
    if (clientRef.current) {
      try {
        await clientRef.current.stopBroadcast();
      } catch (err) {
        console.error("Error stopping broadcast", err);
      }
      clientRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setStatusMessage('Stream stopped. Ready to start again.');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>AWS IVS Web Broadcaster</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Status: </strong> 
        <span style={{ color: isStreaming ? 'red' : 'black', fontWeight: 'bold' }}>
          {statusMessage}
        </span>
      </div>

      {/* NEW: Debugging view so you can see the data pulled from the DB */}
      {streamConfig && (
        <div style={{ fontSize: '12px', color: 'gray', marginBottom: '10px' }}>
          ✓ Database connected. Key loaded: {streamConfig.stream_key.substring(0, 10)}...
        </div>
      )}

      <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          style={{ width: '100%', display: 'block', aspectRatio: '16/9' }} 
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {!isStreaming ? (
          <button 
            onClick={startStream}
            // Disabled the button if we don't have the config yet
            disabled={!streamConfig} 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              backgroundColor: streamConfig ? '#4CAF50' : '#ccc', // Gray out if disabled
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: streamConfig ? 'pointer' : 'not-allowed' 
            }}
          >
            Start Stream
          </button>
        ) : (
          <button 
            onClick={stopStream}
            style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Stop Stream
          </button>
        )}
      </div>
    </div>
  );
};

export default Broadcaster;