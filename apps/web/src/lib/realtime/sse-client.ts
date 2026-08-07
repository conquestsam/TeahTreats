export function connectSse(path: string, onMessage: (event: MessageEvent<string>) => void) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
  const source = new EventSource(`${apiBaseUrl}${path}`, { withCredentials: true });

  source.onmessage = onMessage;

  return () => source.close();
}
