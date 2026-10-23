// Sessioni attive sul PC: ogni sessione con la Plancia scrive il proprio stato in un file
// (~/.claude/plancia/sessions/<id>.json) e legge quelli delle altre. Un file per sessione:
// nessuna scrittura concorrente sullo stesso file.

import { atom, read, update } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { SessionInfo } from '../types'
import { clip } from './lib'

const sessions = atom({ plugin: 'plancia', key: 'sessions' } as const, [])
const self = atom({ plugin: 'plancia', key: 'self' } as const, null)
const project = atom({ plugin: 'plancia', key: 'project' } as const, null)
const gauge = atom({ plugin: 'plancia', key: 'gauge' } as const, null)
const turns = atom({ plugin: 'plancia', key: 'turns' } as const, [])

// Oltre questo silenzio una sessione non risponde; oltre il secondo non si mostra più.
export const STALE_MS = 3 * 60_000
const HIDE_MS = 12 * 3_600_000

async function folder($: EngineInterface) {
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '.'
  return `${home.replace(/\\/g, '/')}/.claude/plancia/sessions`
}

// Aggiorna lo stato di questa sessione e lo scrive nel suo file.
export async function publishStatus($: EngineInterface, change: Partial<SessionInfo>) {
  const id = await $.session.id()
  const now = await $.clock.now()
  const p = await read($, project)
  const g = await read($, gauge)
  const list = await read($, turns)
  const prev = await read($, self)
  const status = change.status ?? prev?.status ?? 'idle'
  const hostId = prev?.hostId ?? (await $.env.get('CLAUDE_CODE_HOST_SESSION_ID'))
  const next: SessionInfo = {
    ...prev,
    ...change,
    id,
    hostId,
    status,
    since: status !== prev?.status ? now : (prev?.since ?? now),
    seenAt: now,
    startedAt: change.startedAt ?? prev?.startedAt ?? now,
    project: p?.name ?? prev?.project ?? '?',
    path: p?.path,
    branch: p?.branch,
    workSeconds: list.reduce((s, t) => s + t.seconds, 0),
    turns: list.length,
    usd: g?.usd,
    context: g?.percent,
    fiveHour: g?.limits.find(l => l.kind === 'five_hour')?.percentUsed,
  }
  await update($, self, () => next)
  try {
    await $.fs.write(`${await folder($)}/${id}.json`, JSON.stringify(next))
  } catch {
    // Senza il file le altre sessioni non vedono questa; il pannello di questa resta giusto.
  }
  return next
}

export async function setDetail($: EngineInterface, detail: string) {
  const prev = await read($, self)
  if (prev?.detail === detail && prev.status === 'working') return
  await publishStatus($, { status: 'working', detail: clip(detail, 80) })
}

// Apre una sessione dell'app desktop con il suo link claude://, attraverso il sistema operativo.
export async function openSession($: EngineInterface, hostId: string) {
  if (!/^local_[0-9a-f-]{36}$/.test(hostId)) return false
  const url = `claude://claude.ai/epitaxy/${hostId}`
  const isWindows = (await $.env.get('OS')) === 'Windows_NT'
  const isMac = !isWindows && (await $.env.get('__CFBundleIdentifier')) !== undefined
  const argv = isWindows ? ['cmd', '/c', 'start', '', url] : isMac ? ['open', url] : ['xdg-open', url]
  try {
    const r = await $.process.run(argv, { timeoutMs: 5000 })
    return r.exitCode === 0
  } catch {
    return false
  }
}

export type Change = { session: SessionInfo; kind: 'needs-you' | 'maybe-you' | 'done' }

// Rilegge tutte le sessioni e dice quali sono appena passate a «serve te» o «finito».
export async function refreshSessions($: EngineInterface): Promise<Change[]> {
  const dir = await folder($)
  const now = await $.clock.now()
  const mine = await $.session.id()
  let names: { name: string; mtimeMs: number }[] = []
  try {
    names = await $.fs.list(dir)
  } catch {
    return []
  }
  const found: SessionInfo[] = []
  for (const entry of names) {
    if (!entry.name.endsWith('.json') || now - entry.mtimeMs > HIDE_MS) continue
    try {
      const s = JSON.parse(String(await $.fs.read(`${dir}/${entry.name}`))) as SessionInfo
      if (s.status !== 'closed') found.push(s)
    } catch {
      // File scritto a metà da un'altra sessione: si rilegge al giro dopo.
    }
  }
  const before = new Map((await read($, sessions)).map(s => [s.id, s.status]))
  const changes: Change[] = []
  for (const s of found) {
    const was = before.get(s.id)
    if (s.id === mine || was === undefined || was === s.status) continue
    if (s.status === 'needs-you' || s.status === 'maybe-you' || s.status === 'done') changes.push({ session: s, kind: s.status })
  }
  await update($, sessions, () => found)
  return changes
}
