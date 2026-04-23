import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    const s = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    socketRef.current = s;
    setSocket(s);

    s.on('user_online',  ({ userId }) => setOnlineUsers(prev => new Set([...prev, userId])));
    s.on('user_offline', ({ userId }) => setOnlineUsers(prev => { const n = new Set(prev); n.delete(userId); return n; }));

    return () => { s.disconnect(); socketRef.current = null; setSocket(null); };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, socketRef, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
