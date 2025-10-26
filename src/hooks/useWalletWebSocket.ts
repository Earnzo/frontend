import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface WalletData {
  balance: number;
  pending_balance: number;
}

export const useWalletWebSocket = (token: string) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/wallet/?token=${token}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Send ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      ws.current.pingInterval = pingInterval;
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'wallet_update') {
        setWallet({
          balance: parseFloat(data.balance),
          pending_balance: parseFloat(data.pending_balance)
        });
        
        toast.success(data.message, {
          icon: '💰',
          duration: 5000
        });
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected', event.code);
      setIsConnected(false);
      
      if (ws.current?.pingInterval) {
        clearInterval(ws.current.pingInterval);
      }

      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts.current < 5) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000;
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      if (ws.current.pingInterval) {
        clearInterval(ws.current.pingInterval);
      }
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token]);

  return {
    wallet,
    isConnected,
    connect,
    disconnect
  };
};
