import type { ClientConfig } from './client-config'
import { ApiError } from './api-error'
import { decodeMsgPack, encodeMsgPack } from './codecs'
import type { QueryParams, BodyValue } from './base-http-request'

const encodeURIPath = (path: string): string => encodeURI(path).replace(/%5B/g, '[').replace(/%5D/g, ']')

export async function request<T>(
  config: ClientConfig,
  options: {
    method: string
    url: string
    path?: Record<string, string | number | bigint>
    query?: QueryParams
    headers?: Record<string, string>
    body?: BodyValue
    mediaType?: string
    responseHeader?: string
  },
): Promise<T> {
  let rawPath = options.url
  if (options.path) {
    for (const [key, value] of Object.entries(options.path)) {
      const raw = typeof value === 'bigint' ? value.toString() : String(value)
      const replace = config.encodePath ? config.encodePath(raw) : encodeURIPath(raw)
      rawPath = rawPath.replace(`{${key}}`, replace)
    }
  }

  const url = new URL(rawPath, config.baseUrl)

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, item.toString())
        }
      } else {
        url.searchParams.append(key, value.toString())
      }
    }
  }

  const headers: Record<string, string> = {
    ...(typeof config.headers === 'function' ? await config.headers() : (config.headers ?? {})),
    ...(options.headers ?? {}),
  }

  const apiToken = config.apiToken
  if (apiToken) {
    headers['X-Algo-API-Token'] = apiToken
  }

  const token = typeof config.token === 'function' ? await config.token() : config.token
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!token && config.username && config.password) {
    headers['Authorization'] = `Basic ${btoa(`${config.username}:${config.password}`)}`
  }

  let body: BodyValue | undefined = undefined
  if (options.body != null) {
    if (options.body instanceof Uint8Array || typeof options.body === 'string') {
      body = options.body
    } else if (options.mediaType?.includes('msgpack')) {
      body = encodeMsgPack(options.body)
    } else if (options.mediaType?.includes('json')) {
      body = JSON.stringify(options.body)
    } else {
      body = options.body
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method,
    headers,
    body,
    credentials: config.credentials,
  })

  if (!response.ok) {
    let errorBody: unknown
    try {
      const ct = response.headers.get('content-type') ?? ''
      if (ct.includes('application/msgpack')) {
        errorBody = decodeMsgPack(new Uint8Array(await response.arrayBuffer()))
      } else if (ct.includes('application/json')) {
        errorBody = JSON.parse(await response.text())
      } else {
        errorBody = await response.text()
      }
    } catch {
      errorBody = undefined
    }
    throw new ApiError(url.toString(), response.status, errorBody)
  }

  if (options.responseHeader) {
    const value = response.headers.get(options.responseHeader)
    return value as unknown as T
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/msgpack')) {
    return new Uint8Array(await response.arrayBuffer()) as unknown as T
  }

  if (contentType.includes('application/octet-stream') || contentType.includes('application/x-binary')) {
    return new Uint8Array(await response.arrayBuffer()) as unknown as T
  }

  if (contentType.includes('application/json')) {
    return (await response.text()) as unknown as T
  }

  if (!contentType) {
    return new Uint8Array(await response.arrayBuffer()) as unknown as T
  }

  return (await response.text()) as unknown as T
}
