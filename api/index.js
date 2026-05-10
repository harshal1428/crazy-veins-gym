import server from './server.js';

function getRequestUrl(req) {
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader || 'https')
    .split(',')[0]
    .trim();
  const hostHeader = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost';
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const path = req.url ?? '/';
  return `${proto}://${host}${path}`;
}

function toRequest(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method ?? 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : req;

  return new Request(getRequestUrl(req), {
    method,
    headers,
    body,
    duplex: body ? 'half' : undefined,
  });
}

export default async function handler(req, res) {
  const request = toRequest(req);
  const response = await server.fetch(request, {}, {});

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie' && typeof response.headers.getSetCookie === 'function') {
      res.setHeader('set-cookie', response.headers.getSetCookie());
      return;
    }
    res.setHeader(key, value);
  });

  if (request.method === 'HEAD') {
    res.end();
    return;
  }

  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

export const config = {
  runtime: 'nodejs',
};
