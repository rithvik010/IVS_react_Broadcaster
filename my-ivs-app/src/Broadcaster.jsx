import React, { useState, useRef, useEffect } from 'react';

const Broadcaster = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Idle');
  
  const videoRef = useRef(null);
  const clientRef = useRef(null);
  const localStreamRef = useRef(null);

  // --- ADD YOUR AWS CREDENTIALS HERE ---
  const INGEST_ENDPOINT = 'rtmps://d0b29e53f267.global-contribute.live-video.net:443/app/'; 
  const STREAM_KEY = 'sk_ap-south-1_3KB45vyPFOex_k8WXbmoMuznMn9kcfBTaM7lM8R0d7v';

  useEffect(() => {
    return () => stopStream();
  }, []);

  const startStream = async () => {
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
      
      const client = IVSBroadcastClient.create({
        streamConfig: IVSBroadcastClient.BASIC_LANDSCAPE,
        ingestEndpoint: INGEST_ENDPOINT,
      });
      clientRef.current = client;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      await client.addVideoInputDevice(new MediaStream([videoTrack]), 'camera1', { index: 0 });
      await client.addAudioInputDevice(new MediaStream([audioTrack]), 'mic1');

      setStatusMessage('Connecting to AWS IVS...');

      await client.startBroadcast(STREAM_KEY);
      
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
    setStatusMessage('Stream stopped.');
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
            style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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