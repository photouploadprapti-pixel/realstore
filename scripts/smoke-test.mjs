/**
 * Smoke test: start page, walk with arrows, UI unstick, 3D cart present.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Simulates holding a movement key for N physics steps.
 * @param page - Playwright page
 * @param code - KeyboardEvent.code value
 * @param steps - Simulation steps at 1/60s
 */
const holdAndStep = async (page, code, steps = 40) => {
  const result = await page.evaluate(
    ({ keyCode, n }) => {
      if (!window.__rsStep || !window.__rsKeys) {
        return { ok: false, reason: 'hooks missing' }
      }
      const before = {
        x: window.__rsCam.position.x,
        z: window.__rsCam.position.z,
        yaw: window.__rsEuler.y,
      }
      window.__rsKeys[keyCode] = true
      for (let i = 0; i < n; i += 1) {
        window.__rsStep(1 / 60)
      }
      window.__rsKeys[keyCode] = false
      return {
        ok: true,
        before,
        after: {
          x: window.__rsCam.position.x,
          z: window.__rsCam.position.z,
          yaw: window.__rsEuler.y,
        },
      }
    },
    { keyCode: code, n: steps }
  )
  if (!result.ok) throw new Error(result.reason)
  return result
}

const main = async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (err) => errors.push(String(err)))

  console.log('1. Loading store…')
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.getByRole('button', { name: /start shopping/i }).click()
  await page.waitForFunction(() => Boolean(window.__rsCam && window.__rsStep), null, {
    timeout: 20000,
  })
  console.log('   ✓ Canvas + controls ready')

  console.log('2. Walking with ArrowUp…')
  const walk = await holdAndStep(page, 'ArrowUp', 45)
  if (!(walk.after.z < walk.before.z - 0.5)) {
    throw new Error(`ArrowUp did not move forward (-Z): ${JSON.stringify(walk)}`)
  }
  console.log(
    `   ✓ Forward z ${walk.before.z.toFixed(2)} → ${walk.after.z.toFixed(2)}`
  )

  console.log('3. Turning with ArrowLeft…')
  const turn = await holdAndStep(page, 'ArrowLeft', 40)
  if (!(turn.after.yaw > turn.before.yaw + 0.3)) {
    throw new Error(`ArrowLeft did not turn: ${JSON.stringify(turn)}`)
  }
  console.log(
    `   ✓ Turn yaw ${turn.before.yaw.toFixed(2)} → ${turn.after.yaw.toFixed(2)}`
  )

  console.log('4. After cart UI, movement still works…')
  await page.getByRole('button', { name: /shopping cart/i }).click()
  await sleep(250)
  await page.getByRole('button', { name: /close cart/i }).click()
  await sleep(400)

  const afterUi = await holdAndStep(page, 'ArrowUp', 45)
  const dist = Math.hypot(
    afterUi.after.x - afterUi.before.x,
    afterUi.after.z - afterUi.before.z
  )
  if (dist < 0.4) {
    throw new Error(`Stuck after UI (moved ${dist}): ${JSON.stringify(afterUi)}`)
  }
  console.log(`   ✓ Moved ${dist.toFixed(2)} units after cart UI`)

  console.log('5. 3D shopping cart attached…')
  const cartKids = await page.evaluate(() => window.__rsCam.children.length)
  if (cartKids < 1) throw new Error('No cart group on camera')
  console.log(`   ✓ Cart on camera (${cartKids} child group(s))`)

  console.log('6. Unique product instance ids…')
  await page.waitForFunction(() => typeof window.__rsCountProducts === 'function', null, {
    timeout: 10000,
  })
  const deep = await page.evaluate(() => window.__rsCountProducts())
  if (deep.products < 20 || deep.unique !== deep.products) {
    throw new Error(`Instance ids bad: ${JSON.stringify(deep)}`)
  }
  console.log(`   ✓ ${deep.unique} unique product instances`)

  if (errors.length) throw new Error(`Page errors: ${errors.join('; ')}`)

  console.log('\nAll smoke checks passed.')
  await browser.close()
}

main().catch((err) => {
  console.error('\nFAIL:', err.message)
  process.exit(1)
})
