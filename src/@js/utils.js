export async function sha256(text) {
  const encoded = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest({name: 'SHA-256'}, encoded)
  return Buffer.from(digest).toString('hex')
}

export async function handleResponse(response) {
  if (response.ok)
    return response.headers.get('content-type')?.indexOf('json') > -1 ? response.json() : response.text()

  throw response.headers.get('content-type')?.indexOf('json') > -1 ? await response.json() : await response.text()
}

export async function parseError(err) {
  try {
    if (typeof err === 'string')
      err = {message: err, status: 400}

    if (err.headers?.has('content-type'))
      err.message = err.headers.get('content-type').indexOf('json') > -1 ? await err.json() : await err.text()

    if (!err.status)
      err.status = err?.message?.status || 400

    return new Response(
      JSON.stringify({
        ...(typeof err.message === 'string' ? {message: err.message} : err.message),
        status: err.status
      }),
      {
        status: err.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    )
  }

  catch(err) {
    return new Response(JSON.stringify(err), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  }
}