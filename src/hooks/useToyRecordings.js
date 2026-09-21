import { useEffect, useRef, useState } from 'react';
import { preferredMimeType, stopStream } from '../services/recording';

export function useToyRecordings() {
  const [recordingId, setRecordingId] = useState(null);
  const stream = useRef(null);
  const recorder = useRef(null);
  const chunks = useRef([]);
  const timeout = useRef(null);
  const urls = useRef({});
  const activeId = useRef(null);
  const player = useRef(new Audio());

  function cleanup() {
    clearTimeout(timeout.current);
    timeout.current = null;
    if (recorder.current?.state === 'recording') recorder.current.stop();
    player.current.pause();
    stopStream(stream.current);
    stream.current = null;
    setRecordingId(null);
  }

  async function enable() {
    if (stream.current) return true;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return false;
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = preferredMimeType(window.MediaRecorder);
      const nextRecorder = new MediaRecorder(nextStream, mimeType ? { mimeType } : undefined);
      nextRecorder.ondataavailable = (event) => event.data.size && chunks.current.push(event.data);
      nextRecorder.onstop = () => {
        const id = activeId.current;
        if (id !== null) {
          const url = URL.createObjectURL(new Blob(chunks.current, { type: nextRecorder.mimeType }));
          if (urls.current[id]) URL.revokeObjectURL(urls.current[id]);
          urls.current[id] = url;
        }
        chunks.current = [];
        activeId.current = null;
        setRecordingId(null);
      };
      recorder.current = nextRecorder;
      stream.current = nextStream;
      return true;
    } catch {
      return false;
    }
  }

  function record(id) {
    if (!recorder.current) return 'unavailable';
    if (recordingId === id) {
      recorder.current.stop();
      return 'stopped';
    }
    if (recordingId !== null) return 'busy';
    chunks.current = [];
    activeId.current = id;
    setRecordingId(id);
    recorder.current.start();
    timeout.current = setTimeout(() => recorder.current?.state === 'recording' && recorder.current.stop(), 60000);
    return 'started';
  }

  function play(id) {
    if (!urls.current[id]) return false;
    player.current.src = urls.current[id];
    player.current.play().catch(() => {});
    return true;
  }

  useEffect(() => () => {
    cleanup();
    Object.values(urls.current).forEach(URL.revokeObjectURL);
  }, []);

  return { enable, cleanup, play, record, recordingId, setStream: (nextStream) => { stream.current = nextStream; } };
}
