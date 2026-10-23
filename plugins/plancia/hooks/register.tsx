import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Gauge, Limit, TurnStat } from '../types'
import { clip, duration, findRisk, findSecret, isSecretFile, limitName, redact, usd } from './lib'
import {
  addIdea,
  addTodo,
  appendEntry,
  entriesSince,
  loadIdeas,
  loadSnippets,
  logGuard,
  pruneJournal,
  refreshDigest,
  refreshProject,
  reloadTodos,
  resumeText,
  saveSnippet,
  toggleTodo,
} from './state'
import { publishStatus, refreshSessions, refreshTitle, setDetail } from './sessions'
import { PANE, drawBand, drawPane, standupText } from './ui'

const files = atom({ plugin: 'plancia', key: 'files' } as const, [])
const gauge = atom({ plugin: 'plancia', key: 'gauge' } as const, null)
const ideas = atom({ plugin: 'plancia', key: 'ideas' } as const, [])
const isBandHidden = atom({ plugin: 'plancia', key: 'isBandHidden' } as const, false)
const live = atom({ plugin: 'plancia', key: 'live' } as const, { turnTools: 0, sessionTools: 0 })
const project = atom({ plugin: 'plancia', key: 'project' } as const, null)
const samples = atom({ plugin: 'plancia', key: 'samples' } as const, [])
const snippets = atom({ plugin: 'plancia', key: 'snippets' } as const, [])
const tab = atom({ plugin: 'plancia', key: 'tab' } as const, 'cruscotto')
const todos = atom({ plugin: 'plancia', key: 'todos' } as const, [])
const turns = atom({ plugin: 'plancia', key: 'turns' } as const, [])
const hookSeen = atom({ plugin: 'plancia', key: 'hookSeen' } as const, {})
const self = atom({ plugin: 'plancia', key: 'self' } as const, null)

const NOTIFY_AFTER_S = 60
const TODO_TOOL = 'mcp__plancia__todo'

const toGauge = (m: {
  context: { tokens?: number; window: number; percent?: number }
  rateLimits: Limit[]
  cost?: { usd: number }
}): Gauge => ({
  tokens: m.context.tokens,
  window: m.context.window,
  percent: m.context.percent,
  usd: m.cost?.usd,
  limits: m.rateLimits.map(l => ({ kind: l.kind, percentUsed: l.percentUsed, resetsAt: l.resetsAt })),
})

// Tool che fermano la sessione finché non rispondi.
const WAITS_FOR_YOU: Record<string, string> = {
  AskUserQuestion: 'ti ha fatto una domanda',
  ExitPlanMode: 'aspetta che approvi il piano',
}

// Tool che durano a lungo per natura o non chiedono permessi: niente «forse serve te».
const NEVER_WAITS = new Set(['Agent', 'Task', 'Workflow', 'Monitor', 'TaskOutput', 'Read', 'Glob', 'Grep', 'ToolSearch', 'Skill'])

// Dopo questo tempo un tool fermo probabilmente aspetta un permesso.
const MAYBE_AFTER_MS = 20_000

// Nome leggibile di un tool, per lo stato della sessione.
const toolLabel = (tool: string) => {
  const m = tool.match(/^mcp__(.+?)__(.+)$/)
  return m ? `${m[2]} (${m[1]})` : tool
}

// Battito: rinnova il file di questa sessione, legge le altre e avvisa dei cambi che ti riguardano.
async function heartbeat($: EngineInterface) {
  await publishStatus($, {})
  for (const c of await refreshSessions($)) {
    if (c.kind === 'needs-you') {
      $.ui.toast(`📣 ${c.session.project}: ${c.session.detail ?? 'ha bisogno di te'}`, { timeoutMs: 12_000 })
      void $.ui.notify(c.session.detail ?? 'Ha bisogno di te', { title: `Claude · ${c.session.project}` })
    } else if (c.kind === 'maybe-you') {
      $.ui.toast(`⏳ ${c.session.project}: ${c.session.detail ?? 'forse ha bisogno di te'}`, { timeoutMs: 10_000 })
    } else {
      $.ui.toast(`✅ ${c.session.project}: ${c.session.detail ?? 'ha finito'}`, { timeoutMs: 8000 })
    }
  }
}

function openPane($: EngineInterface) {
  return $.ui.open({ id: PANE, title: 'Plancia' })
}

// Riassunto di una riga del turno, con Haiku. Se non risponde, l'inizio del prompt.
async function summarize($: EngineInterface, prompt: string, answer: string, changed: string[]) {
  const fallback = clip(prompt || answer, 100) || 'Turno senza testo'
  const r = await $.model.complete({
    model: 'haiku',
    maxTokens: 80,
    timeoutMs: 20_000,
    system:
      'Tieni un diario di lavoro. Rispondi con UNA sola riga in italiano, al massimo 100 caratteri, ' +
      'che dica cosa è stato fatto, deciso o scoperto. Niente preamboli, virgolette o punto finale.',
    prompt:
      `Richiesta dell'utente:\n${clip(prompt, 800)}\n\n` +
      `Risposta finale dell'assistente:\n${clip(answer, 1800)}\n\n` +
      (changed.length ? `File modificati: ${changed.slice(0, 12).join(', ')}` : 'Nessun file modificato.'),
  })
  if (!r.isAnswered) return fallback
  const line = r.text.split('\n').find(s => s.trim())?.trim()
  return line ? clip(redact(line), 120) : fallback
}

export const register: Register = on => {
  // Hot reload: le variabili del modulo ripartono, lo stato in $.state resta.
  let changedThisTurn = new Set<string>()
  // Tool del thread principale in corso, per capire quando la sessione torna a lavorare.
  let running = 0
  const warned = new Set<string>()

  on('session.start', async ($, e, next) => {
    const commands = [
      { name: 'plancia', description: 'Apre la Plancia (schede: cruscotto, attivita, diario, regole)', argumentHint: '[scheda]' },
      { name: 'todo', description: 'Aggiunge un todo al progetto, o li elenca', argumentHint: '[testo]' },
      { name: 'idea', description: "Parcheggia un'idea per dopo", argumentHint: '<testo>' },
      { name: 'oggi', description: 'Riepilogo di oggi per progetto (standup, rendicontazione)' },
      { name: 'settimana', description: 'Tempo e attività degli ultimi 7 giorni per progetto' },
      { name: 'snippet', description: 'Salva un prompt riusabile (;nome nel prompt), o li elenca', argumentHint: '[nome testo]' },
      { name: 'riprendi', description: 'Mette nel prompt todo aperti e ultime attività del progetto, per riprendere con Claude' },
      { name: 'banda', description: 'Mostra o nasconde la banda della Plancia sopra il prompt' },
    ]
    for (const c of commands) await $.command.register(c)

    await $.tool.register({
      name: 'todo',
      isDeferred: false,
      description:
        "Todo personali dell'utente per il progetto corrente, mostrati nella sua Plancia e conservati tra sessioni. " +
        "action 'list' li elenca; 'add' con text ne aggiunge uno quando emerge lavoro da fare in seguito " +
        "(non per i passi che stai per fare subito); 'done' con id segna completato uno che hai finito.",
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['list', 'add', 'done'] },
          text: { type: 'string', description: "Per 'add': il todo, breve e concreto." },
          id: { type: 'string', description: "Per 'done': l'id del todo." },
        },
        required: ['action'],
      },
    })

    await update($, gauge, () => null)
    const usage = await $.session.usage()
    await update($, gauge, () => toGauge(usage))
    await refreshProject($)
    await loadIdeas($)
    await loadSnippets($)
    await pruneJournal($)
    await refreshDigest($)

    // Ramo e modifiche cambiano anche fuori dai turni: un controllo ogni due minuti.
    $.clock.every(120_000, () => void refreshProject($))

    // Sessioni: questa si annuncia, poi ogni 20 secondi rinnova il proprio file e legge le altre.
    const prev = await read($, self)
    await publishStatus($, { status: prev?.status ?? 'idle', startedAt: usage.startedAt })
    await refreshSessions($)
    void refreshTitle($)
    $.clock.every(20_000, () => void heartbeat($))
    void openPane($)

    return next(e)
  })

  // --- Comandi ------------------------------------------------------------------

  on('command.run', { command: 'plancia' }, async ($, e) => {
    const wanted = e.args.trim().toLowerCase()
    const t = (['cruscotto', 'sessioni', 'attivita', 'diario', 'regole'] as const).find(x => x.startsWith(wanted.replace('à', 'a')) && wanted)
    if (t) await update($, tab, () => t)
    const opened = await openPane($)
    return { text: opened.isPlaced ? 'Plancia aperta.' : 'La Plancia si apre appena c’è spazio.' }
  })

  on('command.run', { command: 'todo' }, async ($, e) => {
    const text = e.args.trim()
    if (text) {
      await addTodo($, text, 'io')
      return { text: `Todo aggiunto: ${text}` }
    }
    const open = (await read($, todos)).filter(t => !t.isDone)
    return { text: open.length ? open.map(t => `○ [${t.id}] ${t.text}`).join('\n') : 'Nessun todo aperto.' }
  })

  on('command.run', { command: 'idea' }, async ($, e) => {
    const text = e.args.trim()
    if (!text) return { text: (await read($, ideas)).map(i => `💡 ${i.text}`).join('\n') || 'Nessuna idea parcheggiata.' }
    await addIdea($, text)
    return { text: `Idea parcheggiata: ${text}` }
  })

  on('command.run', { command: 'oggi' }, async $ => {
    const now = await $.clock.now()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return { text: `Attività di oggi\n\n${standupText(await entriesSince($, start.getTime()))}` }
  })

  on('command.run', { command: 'settimana' }, async $ => {
    const d = await refreshDigest($)
    if (d.week.length === 0) return { text: 'Nessuna attività negli ultimi 7 giorni.' }
    const total = d.week.reduce((s, x) => s + x.seconds, 0)
    const rows = d.week.map(x => `- ${x.name}: ${duration(x.seconds)} in ${x.turns} turni`)
    return { text: `Ultimi 7 giorni: ${duration(total)} di turni\n${rows.join('\n')}` }
  })

  on('command.run', { command: 'snippet' }, async ($, e) => {
    const m = e.args.trim().match(/^;?([\w-]+)\s+([\s\S]+)$/)
    if (!m) {
      const list = await read($, snippets)
      return { text: `${list.map(s => `;${s.name} — ${clip(s.text, 70)}`).join('\n')}\n\nPer salvarne uno: /snippet nome testo` }
    }
    const [, name = '', text = ''] = m
    await saveSnippet($, name.toLowerCase(), text.trim())
    return { text: `Prompt salvato: ;${name.toLowerCase()}` }
  })

  on('command.run', { command: 'riprendi' }, async $ => {
    await $.prompt.fill({ text: await resumeText($), mode: 'replace' })
    return { text: 'Contesto nel prompt: rileggilo e premi Invio.' }
  })

  on('command.run', { command: 'banda' }, async $ => {
    const hidden = await update($, isBandHidden, v => !v)
    return { text: hidden ? 'Banda nascosta. /banda per riaverla.' : 'Banda visibile.' }
  })

  // --- Guardrail ----------------------------------------------------------------

  // Segreti nel prompt: il prompt non parte. Se il controllo stesso fallisce, si blocca per prudenza.
  on('prompt.submit', async ($, e, next) => {
    const seenAt = await $.clock.now()
    await update($, hookSeen, s => ({ ...s, prompt: seenAt }))
    const kind = findSecret(e.text)
    if (kind) {
      await logGuard($, { kind: 'segreto', detail: kind, outcome: 'bloccato' })
      $.ui.toast(`🔒 Prompt non inviato: contiene ${kind}. Toglila e riprova.`, { timeoutMs: 10_000 })
      return { drop: `Plancia: il prompt contiene ${kind} e non è stato inviato.` }
    }
    if (!e.isMeta && !e.command) {
      changedThisTurn = new Set()
      const usage = await $.session.usage()
      const now = await $.clock.now()
      await update($, live, l => ({
        ...l,
        turnTools: 0,
        turnStartUsd: usage.cost?.usd,
        turnUsd: undefined,
        workingSince: now,
        prompt: clip(redact(e.text), 800),
      }))
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { drop: 'Plancia: controllo dei segreti non riuscito.' }))

  on('prompt.mention', async ($, e, next) => {
    if (isSecretFile(e.path)) {
      await logGuard($, { kind: 'file', detail: e.mention, outcome: 'bloccato' })
      return { deny: `Plancia: ${e.mention} può contenere credenziali e non viene letto.` }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'Plancia: controllo del file non riuscito.' }))

  // Comandi rischiosi e file di credenziali: sempre una conferma, qualunque sia la modalità dei permessi.
  on('tool.check', async ($, e, next) => {
    const seenAt = await $.clock.now()
    await update($, hookSeen, s => ({ ...s, check: seenAt }))
    const input = (e.input ?? {}) as { command?: unknown; file_path?: unknown; notebook_path?: unknown }
    const tool = String(e.tool)
    if ((tool === 'Bash' || tool === 'PowerShell') && typeof input.command === 'string') {
      const risk = findRisk(input.command)
      if (risk) {
        await logGuard($, { kind: 'comando', detail: `${risk}: ${clip(input.command, 80)}`, outcome: 'conferma' })
        return { decision: 'ask', reason: `Plancia: ${risk}. Serve la tua conferma.` }
      }
    }
    const path = typeof input.file_path === 'string' ? input.file_path : typeof input.notebook_path === 'string' ? input.notebook_path : undefined
    if (path && isSecretFile(path)) {
      await logGuard($, { kind: 'file', detail: `${tool} ${path}`, outcome: 'conferma' })
      return { decision: 'ask', reason: `Plancia: ${path} può contenere credenziali.` }
    }
    return next(e)
  }).catch(() => ({ decision: 'ask', reason: 'Plancia: controllo non riuscito, serve conferma.' }))

  // --- Tool che Claude può chiamare ------------------------------------------------

  on('tool.call', { tool: /^mcp__plancia__todo$/ }, async ($, e) => {
    const input = e as unknown as { action?: string; text?: string; id?: string }
    if (input.action === 'add' && input.text?.trim()) {
      const id = await addTodo($, input.text, 'claude')
      return { result: `Aggiunto [${id}] ${input.text.trim()}` }
    }
    if (input.action === 'done' && input.id) {
      const current = (await read($, todos)).find(t => t.id === input.id)
      if (!current) return { result: `Nessun todo con id ${input.id}.` }
      if (!current.isDone) await toggleTodo($, input.id)
      return { result: `Completato [${input.id}] ${current.text}` }
    }
    await reloadTodos($)
    const list = await read($, todos)
    const open = list.filter(t => !t.isDone)
    return { result: open.length ? open.map(t => `[${t.id}] ${t.text}`).join('\n') : 'Nessun todo aperto.' }
  })

  // --- Misure ---------------------------------------------------------------------

  on('tool.call', async ($, e, next) => {
    await update($, live, l => ({ ...l, turnTools: l.turnTools + 1, sessionTools: l.sessionTools + 1 }))
    if (e.tool === 'Bash' || String(e.tool) === 'PowerShell') {
      const at = await $.clock.now()
      await update($, hookSeen, s => ({ ...s, shell: at }))
    }
    const tool = String(e.tool)
    const waits = WAITS_FOR_YOU[tool]
    let timer: { cancel: () => void } | undefined
    if (e.agentId === undefined) {
      if (waits) await publishStatus($, { status: 'needs-you', detail: waits })
      else await setDetail($, toolLabel(tool))
      // Se il tool resta fermo, forse aspetta un permesso. Dove il motore segnala il permesso
      // (classic.PermissionRequest) lo stato diventa certo e questo timer non conta più.
      if (!waits && !NEVER_WAITS.has(tool)) {
        timer = $.clock.after(MAYBE_AFTER_MS, () => {
          void (async () => {
            if ((await read($, self))?.status === 'working') {
              await publishStatus($, { status: 'maybe-you', detail: `forse aspetta il permesso per ${toolLabel(tool)}` })
            }
          })()
        })
      }
      running += 1
    }
    let ran
    try {
      ran = await next(e)
    } finally {
      timer?.cancel()
      if (e.agentId === undefined) {
        running = Math.max(0, running - 1)
        const status = (await read($, self))?.status
        if (waits || ((status === 'maybe-you' || status === 'needs-you') && running === 0)) {
          await publishStatus($, { status: 'working', detail: 'riprende il lavoro' })
        }
      }
    }
    const input = e as unknown as { file_path?: unknown; notebook_path?: unknown }
    const path = typeof input.file_path === 'string' ? input.file_path : typeof input.notebook_path === 'string' ? input.notebook_path : undefined
    const isWrite = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)
    if (path && isWrite && ran.deny === undefined && !ran.isError) {
      changedThisTurn.add(path)
      const at = await $.clock.now()
      await update($, files, list => {
        const found = list.find(f => f.path === path)
        return found
          ? list.map(f => (f.path === path ? { ...f, edits: f.edits + 1, at } : f))
          : [...list, { path, edits: 1, at }].slice(-200)
      })
    }
    return ran
  }).catch(($, e, next) => next(e))

  // Inizio del turno principale: azzera i contatori del turno. Su turn.start e non su prompt.submit,
  // perché una policy aziendale può intercettare gli eventi del prompt prima della Plancia.
  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) {
      changedThisTurn = new Set()
      const usage = await $.session.usage()
      const now = await $.clock.now()
      await update($, live, l => ({
        ...l,
        turnTools: 0,
        turnStartUsd: usage.cost?.usd,
        turnUsd: undefined,
        workingSince: now,
        prompt: clip(redact(e.text), 800),
      }))
      await update($, hookSeen, s => ({ ...s, turn: now }))
      await publishStatus($, { status: 'working', detail: 'sta pensando', prompt: clip(redact(e.text), 120) })
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // Una richiesta di permesso o un avviso del motore: la sessione aspetta te.
  on('classic.PermissionRequest', async ($, e, next) => {
    await publishStatus($, { status: 'needs-you', detail: `permesso per ${toolLabel(e.tool_name)}` })
    return next(e)
  }).catch(($, e, next) => next(e))

  on('classic.Notification', async ($, e, next) => {
    if (/permission|elicitation/i.test(e.notification_type)) {
      await publishStatus($, { status: 'needs-you', detail: clip(e.message, 80) })
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('session.end', async ($, e, next) => {
    await publishStatus($, { status: 'closed' })
    return next(e)
  }).catch(($, e, next) => next(e))

  on('session.measure', async ($, e, next) => {
    const g = toGauge(e)
    await update($, gauge, () => g)
    const now = await $.clock.now()
    const five = g.limits.find(l => l.kind === 'five_hour')
    if (five) {
      await update($, samples, list => [...list.filter(s => s.at >= now - 2 * 3_600_000), { at: now, percent: five.percentUsed, resetsAt: five.resetsAt }])
    }

    if ((g.percent ?? 0) >= 80 && !warned.has('ctx')) {
      warned.add('ctx')
      $.ui.toast(`🧠 Contesto all'${g.percent}%: valuta /compact o una sessione nuova`, { timeoutMs: 9000 })
    }
    if ((g.percent ?? 0) < 60) warned.delete('ctx')
    for (const l of g.limits) {
      if (l.percentUsed >= 90 && !warned.has(l.kind)) {
        warned.add(l.kind)
        $.ui.toast(`⏱ Limite ${limitName(l.kind)} al ${l.percentUsed}%`, { timeoutMs: 9000 })
      }
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined) return ran

    const usage = await $.session.usage()
    const l = await update($, live, cur => ({
      ...cur,
      workingSince: undefined,
      turnUsd: usage.cost?.usd !== undefined && cur.turnStartUsd !== undefined ? usage.cost.usd - cur.turnStartUsd : cur.turnUsd,
    }))
    const seconds = Math.round(e.durationMs / 1000)
    const stat: TurnStat = { at: await $.clock.now(), seconds, tools: l.turnTools, usd: l.turnUsd, context: usage.context.percent }
    await update($, turns, list => [...list, stat].slice(-100))
    const p = await refreshProject($)
    const changed = [...changedThisTurn]
    await publishStatus($, {
      status: e.reason === 'error' ? 'error' : e.reason === 'aborted' ? 'idle' : 'done',
      detail: e.reason === 'error' ? 'errore' : e.reason === 'aborted' ? 'interrotto' : `finito in ${duration(seconds)}`,
    })

    if (seconds >= NOTIFY_AFTER_S && e.reason === 'answer') {
      void $.ui.notify(`Turno finito in ${duration(seconds)} · ${usd(l.turnUsd)}`, { title: `Claude · ${p.name}` })
    }

    // Il riassunto parte dopo: il turno non aspetta Haiku.
    if (e.reason === 'answer' || e.reason === 'aborted') {
      const prompt = l.prompt ?? ''
      const answer = e.answer
      $.clock.after(50, () => {
        void (async () => {
          const isWorthy = l.turnTools > 0 || changed.length > 0 || answer.length > 300
          const summary = isWorthy ? await summarize($, prompt, redact(answer), changed) : clip(prompt || answer, 100)
          await appendEntry($, {
            at: stat.at,
            seconds,
            summary: e.reason === 'aborted' ? `(interrotto) ${summary}` : summary,
            tools: l.turnTools,
            files: changed.length,
            usd: l.turnUsd,
            projectKey: p.key,
            project: p.name,
          })
          await publishStatus($, { lastSummary: summary })
          // L'app dà o cambia il titolo dopo i primi turni.
          await refreshTitle($)
          await refreshDigest($)
        })()
      })
    }
    return ran
  }).catch(async ($, e, next) => {
    await $.store.set('debug:turn.complete', { at: await $.clock.now(), reason: e.reason, agentId: e.agentId ?? null })
    return next(e)
  })

  // --- Prompt -------------------------------------------------------------

  // ;nome nel prompt propone i prompt salvati.
  on('prompt.autocomplete', async ($, e, next) => {
    const ran = await next(e)
    if (!e.token.startsWith(';')) return ran
    const q = e.token.slice(1).toLowerCase()
    const found = (await read($, snippets)).filter(s => s.name.startsWith(q))
    return {
      suggestions: [
        ...ran.suggestions,
        ...found.map(s => ({ text: s.text, label: `;${s.name}`, description: clip(s.text, 60) })),
      ],
    }
  })

  // --- Disegno ---------------------------------------------------------------------

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isBandHidden)) || !(await read($, project))) return next(e)
    return drawBand($, e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, ($, e) => drawPane($, e))
}
