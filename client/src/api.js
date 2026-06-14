const BASE = '/api';

async function fetchApi(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    if (path === '/auth/login') {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Geçersiz kullanıcı adı veya şifre');
    }
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('Oturum süresi dolmuş');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────
export function login(username, password) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return fetchApi('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return fetchApi('/auth/me');
}

// ─── Users ───────────────────────────────────────────
export function getUsers() {
  return fetchApi('/users');
}

export function createUser(data) {
  return fetchApi('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUser(id, data) {
  return fetchApi(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteUser(id) {
  return fetchApi(`/users/${id}`, { method: 'DELETE' });
}

export function resetPassword(id, data) {
  return fetchApi(`/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Projects ────────────────────────────────────────
export function getProjects() {
  return fetchApi('/projects');
}

export function createProject(data) {
  return fetchApi('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProject(id, data) {
  return fetchApi(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProject(id) {
  return fetchApi(`/projects/${id}`, { method: 'DELETE' });
}

export function updateProjectUsers(id, assignedUsers) {
  return fetchApi(`/projects/${id}/users`, {
    method: 'PUT',
    body: JSON.stringify({ assignedUsers }),
  });
}

export function exportProjects() {
  return fetchApi('/projects/export');
}

// ─── Alerts ──────────────────────────────────────────
export function getAlerts() {
  return fetchApi('/alerts');
}
