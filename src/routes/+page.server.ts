export const load = (async ({ fetch }) => {
  const response = await fetch('/api/servers');
  const servers = await response.json();
  return servers;
});

