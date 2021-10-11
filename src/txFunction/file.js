export default () => {
  const txFunction = `
    const { TransactionBuilder, Server, Networks, BASE_FEE, Operation, Asset } = require('stellar-sdk')

    const server = new Server(HORIZON_URL)
    
    module.exports = (body) => {
      const { source, destination } = body
    
      return server
      .loadAccount(source)
      .then((account) => 
        new TransactionBuilder(account, { 
          fee: BASE_FEE, 
          networkPassphrase: Networks[STELLAR_NETWORK],
        })
        .addOperation(Operation.payment({
          destination,
          asset: Asset.native(),
          amount: '1',
        }))
        .setTimeout(0)
        .build()
        .toXDR()
      )
    }
  `

  const javaScript = `
    const HORIZON_URL = 'https://horizon-testnet.stellar.org'
    const STELLAR_NETWORK = 'TESTNET'
    
    define('stellar-sdk', () => StellarSdk)
    define('bignumber.js', () => BigNumber)
    define('lodash', () => _)
    
    define('txFunction', (require, exports, module) => {
      ${txFunction}
    })
    
    export default (body) => new Promise((resolve) => require(['txFunction'], (txFunction) => resolve(txFunction(body)))) 
  `

  return new Response(javaScript, {
    headers: {
      'Content-Type': 'application/javascript;charset=utf-8',
      'Cache-Control': 'public, max-age=300' // 5 minutes
    }
  })
}