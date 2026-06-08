const WEBSOCKET_URL = `ws://${window.location.hostname}`;

export function connectToParkingWebSocket({ onOpen, onMessage, onError, onClose }) {
  const socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    onOpen?.();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      onMessage?.(message);
    } catch (error) {
      console.error("Neispravna WebSocket poruka:", event.data);
    }
  };

  socket.onerror = () => {
    onError?.();
  };

  socket.onclose = () => {
    onClose?.();
  };

  return socket;
}