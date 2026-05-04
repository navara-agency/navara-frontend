// Central API client. Reads VITE_API_BASE_URL from env, attaches JWT from localStorage,
// throws ApiError with status + parsed body so callers can branch on 401/etc.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const TOKEN_KEY = 'navara_admin_token'

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function parseBody(res) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try { return await res.json() } catch { return null }
  }
  try { return await res.text() } catch { return null }
}

async function request(method, path, { body, query, auth = 'auto', headers = {}, raw = false } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null && v !== '') url.searchParams.set(k, v)
    }
  }

  const finalHeaders = { Accept: 'application/json', ...headers }
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  if (auth === true || (auth === 'auto' && getToken())) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  })

  if (raw) return res

  const parsed = await parseBody(res)

  if (!res.ok) {
    const message = (parsed && typeof parsed === 'object' && parsed.error) || res.statusText || 'Request failed'
    if (res.status === 401 && getToken()) {
      // Token rejected — clear and notify the app
      clearToken()
      window.dispatchEvent(new CustomEvent('navara:auth:expired'))
    }
    throw new ApiError(message, res.status, parsed)
  }

  return parsed
}

export const api = {
  get:    (path, opts) => request('GET',    path, opts),
  post:   (path, body, opts) => request('POST',   path, { ...opts, body }),
  put:    (path, body, opts) => request('PUT',    path, { ...opts, body }),
  patch:  (path, body, opts) => request('PATCH',  path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  raw:    (method, path, opts) => request(method, path, { ...opts, raw: true }),
}

/**
 * Multipart upload with real-time progress events.
 * `onProgress` receives a number 0–100. Resolves to the parsed JSON body of the response.
 *
 * Uses XMLHttpRequest because fetch() does not yet expose request-body upload progress.
 */
export function uploadWithProgress(path, file, { type = 'image', onProgress, fieldName = 'file' } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`)
    if (type) url.searchParams.set('type', type)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url.toString())
    const token = getToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return
      onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      let parsed = null
      try { parsed = JSON.parse(xhr.responseText) } catch { /* non-JSON body */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(parsed)
        return
      }
      const message = (parsed && parsed.error) || xhr.statusText || 'Upload failed'
      if (xhr.status === 401 && getToken()) {
        clearToken()
        window.dispatchEvent(new CustomEvent('navara:auth:expired'))
      }
      reject(new ApiError(message, xhr.status, parsed))
    }

    xhr.onerror = () => reject(new ApiError('Network error', 0, null))
    xhr.onabort = () => reject(new ApiError('Upload aborted', 0, null))

    const fd = new FormData()
    fd.append(fieldName, file)
    xhr.send(fd)
  })
}
