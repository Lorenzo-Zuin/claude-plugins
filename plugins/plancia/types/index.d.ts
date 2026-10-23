export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

export type Gauge = {
  tokens?: number
  window: number
  percent?: number
  usd?: number
  limits: Limit[]
}

export type Project = {
  key: string
  name: string
  path: string
  isRepo: boolean
  branch?: string
  isDirty?: boolean
}

export type Live = {
  turnTools: number
  sessionTools: number
  turnStartUsd?: number
  turnUsd?: number
  workingSince?: number
  prompt?: string
}

export type TurnStat = { at: number; seconds: number; tools: number; usd?: number; context?: number }

export type FileTouch = { path: string; edits: number; at: number }

export type Todo = {
  id: string
  text: string
  isDone: boolean
  at: number
  doneAt?: number
  by: 'io' | 'claude'
}

export type Entry = {
  at: number
  seconds: number
  summary: string
  tools: number
  files: number
  usd?: number
  projectKey: string
  project: string
}

export type Idea = { id: string; text: string; at: number; project?: string }

export type Snippet = { name: string; text: string }

export type GuardEvent = {
  at: number
  kind: 'segreto' | 'file' | 'comando'
  detail: string
  outcome: 'bloccato' | 'conferma'
}

export type Sample = { at: number; percent: number; resetsAt?: string }

export type ProjectTime = { key: string; name: string; seconds: number; turns: number }

export type Digest = { today: ProjectTime[]; week: ProjectTime[]; entries: Entry[] }

export type Tab = 'cruscotto' | 'sessioni' | 'attivita' | 'diario' | 'regole'

// Stato di una sessione, scritto da ogni sessione che ha la Plancia in un file condiviso sul PC.
// `maybe-you`: un tool fermo da più di 20 secondi, probabilmente in attesa di un permesso.
export type SessionStatus = 'working' | 'needs-you' | 'maybe-you' | 'done' | 'idle' | 'error' | 'closed'

export type SessionInfo = {
  id: string
  // Id della sessione nell'app desktop (local_...), per aprirla con un link claude://.
  hostId?: string
  status: SessionStatus
  detail?: string
  since: number
  seenAt: number
  startedAt: number
  project: string
  path?: string
  branch?: string
  workSeconds: number
  turns: number
  usd?: number
  context?: number
  fiveHour?: number
  prompt?: string
  lastSummary?: string
}

declare module 'claude-code' {
  interface PluginState {
    plancia: {
      gauge: Gauge | null
      project: Project | null
      live: Live
      turns: TurnStat[]
      files: FileTouch[]
      todos: Todo[]
      ideas: Idea[]
      snippets: Snippet[]
      guardLog: GuardEvent[]
      samples: Sample[]
      digest: Digest | null
      tab: Tab
      isBandHidden: boolean
      sessions: SessionInfo[]
      self: SessionInfo | null
      hookSeen: { prompt?: number; turn?: number; check?: number; shell?: number }
    }
  }
}
