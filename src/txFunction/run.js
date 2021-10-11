export default () => {
  const html = `
    <html lang="en">
      <head>
        <meta charset="UTF-8">
      
        <script src="https://unpkg.com/stellar-sdk@9.0.0/dist/stellar-sdk.min.js"></script>
        <script src="https://unpkg.com/lodash@4.17.21/lodash.min.js"></script>
        <script src="https://unpkg.com/bignumber.js@9.0.1/bignumber.min.js"></script>
        <script src="https://unpkg.com/requirejs@2.3.6/require.js"></script>

        <script type="module">
          import txFunction from './txFunction.js'
          window.txFunction = txFunction
        </script>
      </head>

      <body>
      </body>
    </html>
  `

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=utf-8',
      'Cache-Control': 'public, max-age=300' // 5 minutes
    }
  })
}