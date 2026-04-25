// Worker ultra-ligero para pruebas de estabilidad
self.onmessage = (event) => {
  const { type, payload } = event.data;
  if (type === 'PING') {
    self.postMessage({ type: 'PONG' });
  }
};
