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

// Oltre il primo silenzio una sessione è inattiva (l'app l'ha chiusa o sospesa);
// oltre il secondo non si mostra più. I file più vecchi del terzo non si leggono neanche.
export const STALE_MS = 3 * 60_000
const HIDE_MS = 30 * 60_000
const IGNORE_MS = 12 * 3_600_000

// Una sessione aperta ma ferma (in attesa, finita, in errore) da più di così non si mostra.
const IDLE_HIDE_MS = 2 * 3_600_000
const RESTING = ['idle', 'done', 'error']

// Trascrizioni più grandi di così non si leggono per cercare il titolo.
const MAX_TRANSCRIPT = 40 * 1024 * 1024

async function claudeDir($: EngineInterface) {
  const configured = await $.env.get('CLAUDE_CONFIG_DIR')
  if (configured) return configured.replace(/\\/g, '/')
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '.'
  return `${home.replace(/\\/g, '/')}/.claude`
}

async function folder($: EngineInterface) {
  return `${await claudeDir($)}/plancia/sessions`
}

// Sessioni tolte a mano, comuni a tutte le sessioni: id → istante dell'ultimo cambio di stato visto.
// Una sessione tolta ricompare quando cambia stato, non a ogni battito.
async function dismissedFile($: EngineInterface) {
  return `${await claudeDir($)}/plancia/dismissed.json`
}

async function readDismissed($: EngineInterface): Promise<Record<string, number>> {
  try {
    return JSON.parse(String(await $.fs.read(await dismissedFile($)))) as Record<string, number>
  } catch {
    return {}
  }
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

// Dove sta la trascrizione di questa sessione: la cartella del progetto con i caratteri non alfanumerici
// sostituiti da «-»; se non c'è (la sessione ha cambiato cartella), si cerca tra i progetti.
const transcripts = new Map<string, string>()

async function transcriptOf($: EngineInterface, id: string) {
  const known = transcripts.get(id)
  if (known) return known
  const projects = `${await claudeDir($)}/projects`
  const guess = `${projects}/${(await $.session.cwd()).replace(/[^A-Za-z0-9]/g, '-')}/${id}.jsonl`
  if (await $.fs.exists(guess)) {
    transcripts.set(id, guess)
    return guess
  }
  for (const dir of await $.fs.list(projects)) {
    const path = `${projects}/${dir.name}/${id}.jsonl`
    if (dir.kind === 'dir' && (await $.fs.exists(path))) {
      transcripts.set(id, path)
      return path
    }
  }
  return undefined
}

// Legge l'ultimo titolo che l'app ha scritto nella trascrizione e lo pubblica.
export async function refreshTitle($: EngineInterface) {
  try {
    const id = await $.session.id()
    const path = await transcriptOf($, id)
    if (!path || (await $.fs.stat(path)).size > MAX_TRANSCRIPT) return
    const text = String(await $.fs.read(path))
    const found = [...text.matchAll(/"type":"custom-title","customTitle":"((?:[^"\\]|\\.)*)"/g)].pop()?.[1]
    if (!found) return
    const title = JSON.parse(`"${found}"`) as string
    if (title !== (await read($, self))?.title) await publishStatus($, { title })
  } catch {
    // Senza titolo la card mostra la cartella del progetto.
  }
}

// Toglie dall'elenco le sessioni indicate finché non danno un nuovo battito.
export async function dismissSessions($: EngineInterface, list: SessionInfo[]) {
  const now = await $.clock.now()
  const stored = await readDismissed($)
  for (const s of list) stored[s.id] = s.since
  // Si tengono solo le voci recenti: un id vecchio non torna più.
  for (const [id, at] of Object.entries(stored)) if (now - at > IGNORE_MS * 2) delete stored[id]
  await $.fs.write(await dismissedFile($), JSON.stringify(stored))
  await update($, sessions, cur => cur.filter(s => !list.some(x => x.id === s.id)))
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
  const dismissed = await readDismissed($)
  const found: SessionInfo[] = []
  for (const entry of names) {
    if (!entry.name.endsWith('.json') || now - entry.mtimeMs > IGNORE_MS) continue
    try {
      const s = JSON.parse(String(await $.fs.read(`${dir}/${entry.name}`))) as SessionInfo
      const hiddenSince = dismissed[s.id]
      const isDismissed = hiddenSince !== undefined && s.since <= hiddenSince
      const isResting = RESTING.includes(s.status) && now - s.since > IDLE_HIDE_MS
      if (s.id === mine || (s.status !== 'closed' && !isDismissed && !isResting && now - s.seenAt <= HIDE_MS)) found.push(s)
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
