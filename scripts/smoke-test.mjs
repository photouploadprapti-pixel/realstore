/**
 * Smoke test for byomid-style controls (uses __rsStep for stable headless runs).
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Holds a key and steps the simulation N times.
 * @param page - Playwright page
 * @param code - KeyboardEvent.code
 * @param steps - Physics steps at 1/60s
 */
const holdAndStep = async (page, code, steps = 45) => {
  return page.evaluate(
    ({ keyCode, n }) => {
      window.__rsKeys.add(keyCode)
      for (let i = 0; i < n; i += 1) window.__rsStep(1 / 60)
      window.__rsKeys.delete(keyCode)
      return {
        x: window.__rsCam.position.x,
        z: window.__rsCam.position.z,
        yaw: window.__rsEuler.y,
      }
    },
    { keyCode: code, n: steps }
  )
}

const main = async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (err) => errors.push(String(err)))

  console.log('1. Loading store…')
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.getByRole('button', { name: /start shopping/i }).click()
  await page.waitForFunction(
    () =>
      Boolean(window.__rsCam && window.__rsStep && window.__rsKeys instanceof Set),
    null,
    { timeout: 20000 }
  )
  const spawn = await page.evaluate(() => ({
    x: window.__rsCam.position.x,
    z: window.__rsCam.position.z,
  }))
  console.log(`   ✓ ready @ (${spawn.x.toFixed(2)}, ${spawn.z.toFixed(2)})`)

  console.log('2. ArrowUp forward…')
  const afterUp = await holdAndStep(page, 'ArrowUp', 50)
  if (!(afterUp.z < spawn.z - 0.8)) {
    throw new Error(`ArrowUp failed: ${JSON.stringify({ spawn, afterUp })}`)
  }
  console.log(`   ✓ z ${spawn.z.toFixed(2)} → ${afterUp.z.toFixed(2)}`)

  console.log('3. KeyA strafe…')
  const beforeA = await page.evaluate(() => window.__rsCam.position.x)
  const afterA = await holdAndStep(page, 'KeyA', 40)
  if (!(afterA.x < beforeA - 0.5)) {
    throw new Error(`KeyA failed: ${beforeA} → ${afterA.x}`)
  }
  console.log(`   ✓ x ${beforeA.toFixed(2)} → ${afterA.x.toFixed(2)}`)

  console.log('4. ArrowLeft turn…')
  const yaw0 = await page.evaluate(() => window.__rsEuler.y)
  const afterTurn = await holdAndStep(page, 'ArrowLeft', 40)
  if (!(afterTurn.yaw > yaw0 + 0.5)) {
    throw new Error(`ArrowLeft turn failed: ${yaw0} → ${afterTurn.yaw}`)
  }
  console.log(`   ✓ yaw ${yaw0.toFixed(2)} → ${afterTurn.yaw.toFixed(2)}`)

  console.log('5. Cart HUD…')
  const cartVisible = await page.evaluate(() =>
    Boolean(document.querySelector('svg path[d*="M40 28"]'))
  )
  if (!cartVisible) throw new Error('Cart HUD missing')
  console.log('   ✓ present')

  console.log('6. After cart UI…')
  await page.getByRole('button', { name: /shopping cart/i }).click()
  await sleep(250)
  await page.getByRole('button', { name: /close cart/i }).click()
  await sleep(350)
  const z0 = await page.evaluate(() => window.__rsCam.position.z)
  const afterUi = await holdAndStep(page, 'KeyW', 40)
  if (!(afterUi.z < z0 - 0.5)) throw new Error(`Stuck after UI: ${z0} → ${afterUi.z}`)
  console.log('   ✓ still movable')

  if (errors.length) throw new Error(errors.join('; '))
  console.log('\nAll smoke checks passed.')
  await browser.close()
}

main().catch((err) => {
  console.error('\nFAIL:', err.message)
  process.exit(1)
})
