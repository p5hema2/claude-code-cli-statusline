/**
 * API Client Module
 *
 * Functions for communicating with the configuration server.
 */

export async function apiGet(endpoint) {
  const response = await fetch(`/api${endpoint}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data;
}

export async function apiPut(endpoint, body) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data;
}

export async function apiPost(endpoint, body) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data;
}
