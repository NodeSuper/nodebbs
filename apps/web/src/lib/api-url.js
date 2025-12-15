function isServer() {
  return typeof window === 'undefined';
}

function normalizeHost(host) {
  return host.replace(/\/+$/, '');
}

export function getApiHost() {
  if (isServer()) {
    const host = process.env.API_URL;
    if (!host) {
      throw new Error('API_URL is not defined (server-side)');
    }
    return normalizeHost(host);
  }

  const host = process.env.NEXT_PUBLIC_API_URL;
  if (!host) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined (client-side)');
  }

  return normalizeHost(host);
}

export function getApiPath() {
  return '/api';
}

export function getApiBaseUrl() {
  return `${getApiHost()}${getApiPath()}`;
}