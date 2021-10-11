const { VM } = require('vm2')
const { chromium } = require('playwright')

const vm = new VM({
  eval: false,
  wasm: false,
  sandbox: {
    chromium
  }
})

const txFunction = vm.run(`
  async (body) => {
    let browser
    let xdr

    try {
      browser = await chromium.launch({
        headless: true,
        chromiumSandbox: true
      })
      const context = await browser.newContext()
      const page = await context.newPage()

      page.on('pageerror', (exception) => {throw exception})
      
      await page.goto('https://headless-turret.sdf-ecosystem.workers.dev')
      
      xdr = await page.evaluate((body) =>
        txFunction(body)
        .catch((err) => ({
          isError: true,
          ...(err?.response?.data || err?.response || err)
        }))
      , body)
    }
    
    catch(err) {
      throw err
    }

    finally {
      await browser.close()
    }

    return xdr
  }
`, 'vm.js')

;(async () => {
  try {
    console.time('benchmark')

    const xdr = await txFunction({
      source: 'GDXN236YQGIBRA3DXEIT3X2PQUXXTDFOSWPYS7QY4M7XOKMPTOZZIMBM',
      destination: 'GCZGK5MTROIM62EIBWAXIVJYSCJDPG7B2HDOB3LG3QBWKSUCADW2ZGLR'
    }).then((res) => {
      if (res?.isError) {
        delete res.isError
        throw res
      }
        
      return res
    })

    console.log('OK', xdr)
  }

  catch(err) {
    console.error('ERROR', err)
  }

  finally {
    console.timeEnd('benchmark')
  }
})()