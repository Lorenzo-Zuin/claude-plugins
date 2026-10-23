import { expect, mock, test } from 'claude-code/testing'

import { findRisk, findSecret, forecast, isSecretFile } from './lib'

const PANE = {
  plugin: 'plancia',
  component: 'Pane',
  requestId: 'plancia',
  props: {
    title: 'Plancia',
    isFocused: true,
    bodyColumns: 80,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('riconosce i segreti senza falsi positivi comuni', async () => {
  // Valori finti composti a runtime: nel file nessuna stringa ha il formato di una chiave vera.
  const fakeKey = ['sk', 'ant', 'api03', 'x'.repeat(32)].join('-')
  const fakeConn = ['Server=db;User Id=sa;', 'Pass', 'word=', 'y'.repeat(10), ';'].join('')
  const fakePem = ['-----BEGIN OPENSSH', 'PRIVATE KEY-----'].join(' ')
  expect(findSecret(`ecco la chiave ${fakeKey}`)).toBe('chiave API Anthropic')
  expect(findSecret(fakeConn)).toBe('stringa di connessione con password')
  expect(findSecret(fakePem)).toBe('chiave privata')
  expect(findSecret('la password va letta da Key Vault, non scritta qui')).toBeUndefined()
  expect(findSecret('controlla il campo password nel form di login')).toBeUndefined()
})

test('chiede conferma per i comandi rischiosi', async () => {
  expect(findRisk('rm -rf node_modules')).toBe('cancellazione ricorsiva')
  expect(findRisk('Remove-Item .\\dist -Recurse -Force')).toBe('cancellazione ricorsiva')
  expect(findRisk('git push --force origin main')).toBe('push forzato')
  expect(findRisk('az vm delete -g rg -n vm1')).toBe('modifica di risorse Azure')
  expect(findRisk('terraform apply -auto-approve')).toBe('Terraform')
  expect(findRisk('git status && npm test')).toBeUndefined()
  expect(findRisk('az account show')).toBeUndefined()
  expect(isSecretFile('C:\\repo\\.env.local')).toBe(true)
  expect(isSecretFile('src/environment.ts')).toBe(false)
})

test('prevede quando finisce la finestra di 5 ore', async () => {
  const now = 10 * 3_600_000
  const reset = new Date(now + 3 * 3_600_000).toISOString()
  const samples = [{ at: now - 30 * 60_000, percent: 40, resetsAt: reset }]
  const f = forecast(samples, { kind: 'five_hour', percentUsed: 60, resetsAt: reset }, now)
  // 20 punti in mezz'ora: 40 all'ora, il 100% tra un'ora.
  expect(f?.eta).toBe(now + 3_600_000)
  const calm = forecast(samples, { kind: 'five_hour', percentUsed: 41, resetsAt: reset }, now)
  expect(calm?.eta).toBeUndefined()
})

test('il guardrail chiede conferma prima di un comando distruttivo', async ($, on) => {
  mock.clock(on)
  on('tool.check', () => ({ decision: 'allow' }))
  const risky = await $.tool.check({ tool: 'Bash', input: { command: 'git reset --hard HEAD~3' } })
  expect(risky.decision).toBe('ask')
  const safe = await $.tool.check({ tool: 'Bash', input: { command: 'git log --oneline' } })
  expect(safe.decision).toBe('allow')
})

test('il pannello disegna ogni scheda su terminale e desktop', async ($, on) => {
  const clock = mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('prompt.fill', () => ({ isFilled: true }))
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('tool.register', () => ({ value: { tool: 'mcp__plancia__todo' } }))
  on('session.usage', () => ({
    value: { startedAt: 0, context: { tokens: 42_000, window: 200_000, percent: 21 }, rateLimits: [{ kind: 'five_hour', percentUsed: 63 }], cost: { usd: 1.25 } },
  }))
  on('session.cwd', () => ({ value: '/lavoro/demo' }))
  on('session.repo', () => ({ value: null }))
  on('session.id', () => ({ value: 's1' }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  mock.env(on, { USERPROFILE: 'C:/Users/prova' })
  const now = clock.now()
  const other = {
    id: 's2',
    status: 'needs-you',
    detail: 'permesso per Bash',
    since: now,
    seenAt: now,
    startedAt: now,
    project: 'altro-progetto',
    workSeconds: 600,
    turns: 4,
  }
  // Un piccolo disco in memoria: il file della sessione s2 e quello che la Plancia scrive.
  const disk = new Map<string, string>([['C:/Users/prova/.claude/plancia/sessions/s2.json', JSON.stringify(other)]])
  const norm = (path: string) => path.replace(/\\/g, '/')
  on('fs.write', (_, e) => (disk.set(norm(e.path), e.text), { value: undefined }))
  on('fs.list', () => ({ value: [{ name: 's2.json', kind: 'file', size: 10, mtimeMs: now, isLink: false }] }))
  on('fs.read', (_, e) => {
    const text = disk.get(norm(e.path))
    if (text === undefined) throw new Error('file assente')
    return { value: text }
  })

  await $.session.start({ cwd: '/lavoro/demo', surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'todo', args: 'Sistemare la paginazione' } as Parameters<typeof $.command.run>[0])

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: /CONSUMO/ })).toBeDefined()

    await ui.press({ key: 'tab-sessioni' })
    expect(await ui.find({ type: 'Text', text: /altro-progetto/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /serve te · permesso per Bash/ })).toBeDefined()
    if (surface === 'desktop') {
      // Tolta con ✕, non ricompare al giro di lettura dopo, anche se il suo battito continua.
      await ui.press({ key: 'hide-s2' })
      disk.set('C:/Users/prova/.claude/plancia/sessions/s2.json', JSON.stringify({ ...other, seenAt: now + 20_000 }))
      await clock.advance(20_000)
      expect(await ui.find({ type: 'Text', text: /altro-progetto/ })).toBeUndefined()
    }

    await ui.press({ key: 'tab-attivita' })
    expect(await ui.find({ type: 'Text', text: /TODO DEL PROGETTO · 1 aperti/i })).toBeDefined()
    expect(await ui.find({ type: 'Button', text: /Sistemare la paginazione/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /;review/ })).toBeDefined()

    await ui.press({ key: 'tab-diario' })
    expect(await ui.find({ type: 'Text', text: /CRONOLOGIA/ })).toBeDefined()

    await ui.press({ key: 'tab-regole' })
    expect(await ui.find({ type: 'Text', text: /REGOLE DELLA PLANCIA/ })).toBeDefined()

    await ui.press({ key: 'tab-cruscotto' })
    await ui.unmount()
  }
})
