import { fromPairs as loFromPairs } from 'lodash'

import Router from './@js/router'
import { parseError } from './@js/utils'

import txFunctionFile from './txFunction/file'
import txFunctionRun from './txFunction/run'

async function handleRequest(request, env, ctx) {
  try {
    const headers = loFromPairs([...new Map(request.headers)])
    const url = new URL(request.url)

    const method = request.method

    // Shortcut request if it's an OPTIONS request
    if (method === 'OPTIONS') return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Origin, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
        'Cache-Control': 'public, max-age=2419200', // 28 days
      }
    })

    const cache = caches.default

    // Return the cached request if there is one
    if (method === 'GET') {
      const match = await cache.match(url.href)

      if (match)
        return match
    }

    const router = new Router()
    const search = loFromPairs([...new Map(url.searchParams)])
    const body = headers['content-type']?.indexOf('json') > -1 ? await request.json() : {}
    const parsedRequest = {
      request,
      cache,
      url,
      method,
      headers,
      search,
      body,
      env,
      ctx,
    }

    router.get('/txFunction.js', txFunctionFile)
    router.get('/', txFunctionRun)

    const response = await router.route(parsedRequest)

    if (
      method === 'GET'
      && response.status >= 200
      && response.status <= 299
    ) ctx.waitUntil(cache.put(url.href, response.clone()))

    return response
  }

  catch(err) {
    return parseError(err)
  }
}

exports.handlers = {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx)
  },
}