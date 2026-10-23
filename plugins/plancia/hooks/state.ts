// Stato della sessione ($.state) e dati che durano tra sessioni ($.store).

import { atom, read, update } from 'claude-code'
import type { EngineInterface } from 'claude-code'

import type { Digest, Entry, GuardEvent, Idea, Project, Snippet, Todo } from '../types'
import { DAY, DEFAULT_SNIPPETS, baseName, dayKey, projectKey, shortDate, sumByProject } from './lib'

export const gauge = atom({ plugin: 'plancia', key: 'gauge' } as const, null)
export const project = atom({ plugin: 'plancia', key: 'project' } as const, null)
export const live = atom({ plugin: 'plancia', key: 'live' } as const, { turnTools: 0, sessionTools: 0 })
export const turns = atom({ plugin: 'plancia', key: 'turns' } as const, [])
export const files = atom({ plugin: 'plancia', key: 'files' } as const, [])
export const todos = atom({ plugin: 'plancia', key: 'todos' } as const, [])
export const ideas = atom({ plugin: 'plancia', key: 'ideas' } as const, [])
export const snippets = atom({ plugin: 'plancia', key: 'snippets' } as const, [])
export const guardLog = atom({ plugin: 'plancia', key: 'guardLog' } as const, [])
export const samples = atom({ plugin: 'plancia', key: 'samples' } as const, [])
export const digest = atom({ plugin: 'plancia', key: 'digest' } as const, null)
export const tab = atom({ plugin: 'plancia', key: 'tab' } as const, 'cruscotto')
export const isBandHidden = atom({ plugin: 'plancia', key: 'isBandHidden' } as const, false)

type $ = EngineInterface

const KEEP_DAYS = 45

// Chiavi in $.store.
const todoKey = (project: string) => `todo:${project}`
const journalKey = (day: string, session: string) => `j:${day}:${session}`
const IDEAS = 'ideas'
const SNIPPETS = 'snippets'

// --- Progetto -----------------------------------------------------------------

// Il progetto è la radice del repository git se c'è, altrimenti la cartella della sessione.
export async function locate($: $): Promise<Project> {
  const cwd = await $.session.cwd()
  let root = cwd
  let isRepo = false
  try {
    const repo = await $.session.repo()
    if (repo) {
      root = repo.root
      isRepo = true
    }
  } catch {
    // Nessun repository: si resta sulla cartella.
  }
  const found: Project = { key: projectKey(root), name: baseName(root), path: root, isRepo }
  if (!isRepo) return found
  try {
    const head = await $.process.run(['git', '-C', root, 'rev-parse', '--abbrev-ref', 'HEAD'], { timeoutMs: 4000 })
    if (head.exitCode !== 0) return found
    const status = await $.process.run(['git', '-C', root, 'status', '--porcelain', '--untracked-files=no'], {
      timeoutMs: 4000,
    })
    return { ...found, branch: head.stdout.trim(), isDirty: status.exitCode === 0 && status.stdout.trim() !== '' }
  } catch {
    return found
  }
}

export async function refreshProject($: $) {
  const found = await locate($)
  const before = await read($, project)
  await update($, project, () => found)
  if (before?.key !== found.key) await loadProjectData($, found)
  return found
}

async function loadProjectData($: $, p: Project) {
  const list = ((await $.store.get(todoKey(p.key))) ?? []) as Todo[]
  await update($, todos, () => list)
}

// --- Todo (per progetto, condivisi tra sessioni) --------------------------------

async function saveTodos($: $, change: (list: Todo[]) => Todo[]) {
  const p = await read($, project)
  if (!p) return []
  // Si rilegge dallo store: un'altra sessione sullo stesso progetto può averli cambiati.
  const stored = ((await $.store.get(todoKey(p.key))) ?? []) as Todo[]
  const next = change(stored)
  await $.store.set(todoKey(p.key), next)
  await update($, todos, () => next)
  return next
}

export async function addTodo($: $, text: string, by: Todo['by']) {
  const id = Math.random().toString(36).slice(2, 6)
  const at = await $.clock.now()
  await saveTodos($, list => [...list, { id, text: text.trim(), isDone: false, at, by }])
  return id
}

export async function toggleTodo($: $, id: string) {
  const now = await $.clock.now()
  let found: Todo | undefined
  await saveTodos($, list =>
    list.map(t => {
      if (t.id !== id) return t
      found = { ...t, isDone: !t.isDone, doneAt: t.isDone ? undefined : now }
      return found
    }),
  )
  return found
}

export function removeTodo($: $, id: string) {
  return saveTodos($, list => list.filter(t => t.id !== id))
}

export function clearDone($: $) {
  return saveTodos($, list => list.filter(t => !t.isDone))
}

export async function reloadTodos($: $) {
  const p = await read($, project)
  if (p) await loadProjectData($, p)
}

// --- Idee parcheggiate (globali) ------------------------------------------------

export async function loadIdeas($: $) {
  const list = ((await $.store.get(IDEAS)) ?? []) as Idea[]
  await update($, ideas, () => list)
}

export async function addIdea($: $, text: string) {
  const p = await read($, project)
  const list = ((await $.store.get(IDEAS)) ?? []) as Idea[]
  const next = [...list, { id: Math.random().toString(36).slice(2, 6), text: text.trim(), at: await $.clock.now(), project: p?.name }].slice(-100)
  await $.store.set(IDEAS, next)
  await update($, ideas, () => next)
}

export async function removeIdea($: $, id: string) {
  const list = ((await $.store.get(IDEAS)) ?? []) as Idea[]
  const next = list.filter(i => i.id !== id)
  await $.store.set(IDEAS, next)
  await update($, ideas, () => next)
}

// --- Prompt riusabili (globali) -------------------------------------------------

export async function loadSnippets($: $) {
  let list = (await $.store.get(SNIPPETS)) as Snippet[] | undefined
  if (!list) {
    list = DEFAULT_SNIPPETS
    await $.store.set(SNIPPETS, list)
  }
  await update($, snippets, () => list)
}

export async function saveSnippet($: $, name: string, text: string) {
  const list = ((await $.store.get(SNIPPETS)) ?? []) as Snippet[]
  const next = [...list.filter(s => s.name !== name), { name, text }].sort((a, b) => a.name.localeCompare(b.name))
  await $.store.set(SNIPPETS, next)
  await update($, snippets, () => next)
}

export async function removeSnippet($: $, name: string) {
  const list = ((await $.store.get(SNIPPETS)) ?? []) as Snippet[]
  const next = list.filter(s => s.name !== name)
  await $.store.set(SNIPPETS, next)
  await update($, snippets, () => next)
}

// --- Diario (una chiave per giorno e sessione: nessuna scrittura concorrente) --

export async function appendEntry($: $, entry: Entry) {
  const key = journalKey(dayKey(entry.at), await $.session.id())
  const list = ((await $.store.get(key)) ?? []) as Entry[]
  await $.store.set(key, [...list, entry].slice(-300))
}

export async function entriesSince($: $, since: number): Promise<Entry[]> {
  const out: Entry[] = []
  for (const key of await $.store.keys()) {
    if (!key.startsWith('j:')) continue
    const day = key.slice(2, 12)
    if (Date.parse(`${day}T23:59:59`) < since) continue
    for (const e of ((await $.store.get(key)) ?? []) as Entry[]) if (e.at >= since) out.push(e)
  }
  return out.sort((a, b) => a.at - b.at)
}

export async function pruneJournal($: $) {
  const limit = dayKey((await $.clock.now()) - KEEP_DAYS * DAY)
  for (const key of await $.store.keys()) {
    if (key.startsWith('j:') && key.slice(2, 12) < limit) await $.store.delete(key)
  }
}

const startOfDay = (ms: number) => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export async function refreshDigest($: $) {
  const now = await $.clock.now()
  const today = startOfDay(now)
  const all = await entriesSince($, today - 6 * DAY)
  const d: Digest = {
    today: sumByProject(all.filter(e => e.at >= today)),
    week: sumByProject(all),
    entries: all.slice(-200),
  }
  await update($, digest, () => d)
  return d
}

export async function logGuard($: $, event: Omit<GuardEvent, 'at'>) {
  const at = await $.clock.now()
  await update($, guardLog, list => [...list, { ...event, at }].slice(-50))
}

// Testo per riprendere il lavoro con Claude: va nel prompt, visibile, e lo invia l'utente.
export async function resumeText($: $) {
  const p = (await read($, project)) ?? (await refreshProject($))
  const open = (await read($, todos)).filter(t => !t.isDone)
  const recent = (await entriesSince($, (await $.clock.now()) - 14 * DAY)).filter(x => x.projectKey === p.key).slice(-6)
  const lines = [`Riprendiamo il lavoro su "${p.name}".`]
  if (open.length) lines.push('', 'Todo aperti:', ...open.slice(0, 12).map(t => `- [${t.id}] ${t.text}`))
  if (recent.length) lines.push('', 'Ultime attività:', ...recent.map(x => `- ${shortDate(x.at)} ${x.summary}`))
  if (!open.length && !recent.length) lines.push('', 'Non ho todo né attività registrate per questo progetto.')
  lines.push('', 'Dimmi dove eravamo e proponi il prossimo passo. Aggiorna i todo con il tool della Plancia quando serve.')
  return lines.join('\n')
}
