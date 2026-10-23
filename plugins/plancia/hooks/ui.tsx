// Disegno: banda sopra il prompt e pannello a schede.
// Sul desktop card colorate, anelli e grafici SVG; nel terminale gli stessi dati con colori e barre di caratteri.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, RenderChildren, RenderInput } from 'claude-code'

import type { Entry, FileTouch, Gauge, Limit, Project, Sample, SessionInfo, SessionStatus, Tab, Todo, TurnStat } from '../types'
import {
  ago,
  clip,
  clock,
  duration,
  forecast,
  k,
  level,
  limitName,
  resetIn,
  shortDate,
  usd,
} from './lib'
import type { Level } from './lib'
import {
  addIdea,
  addTodo,
  clearDone,
  refreshDigest,
  refreshProject,
  removeIdea,
  removeSnippet,
  removeTodo,
  resumeText,
  toggleTodo,
} from './state'
import { STALE_MS } from './sessions'

const digest = atom({ plugin: 'plancia', key: 'digest' } as const, null)
const files = atom({ plugin: 'plancia', key: 'files' } as const, [])
const gauge = atom({ plugin: 'plancia', key: 'gauge' } as const, null)
const guardLog = atom({ plugin: 'plancia', key: 'guardLog' } as const, [])
const ideas = atom({ plugin: 'plancia', key: 'ideas' } as const, [])
const live = atom({ plugin: 'plancia', key: 'live' } as const, { turnTools: 0, sessionTools: 0 })
const project = atom({ plugin: 'plancia', key: 'project' } as const, null)
const samples = atom({ plugin: 'plancia', key: 'samples' } as const, [])
const snippets = atom({ plugin: 'plancia', key: 'snippets' } as const, [])
const tab = atom({ plugin: 'plancia', key: 'tab' } as const, 'cruscotto')
const todos = atom({ plugin: 'plancia', key: 'todos' } as const, [])
const turns = atom({ plugin: 'plancia', key: 'turns' } as const, [])
const hookSeen = atom({ plugin: 'plancia', key: 'hookSeen' } as const, {})
const sessions = atom({ plugin: 'plancia', key: 'sessions' } as const, [])
const self = atom({ plugin: 'plancia', key: 'self' } as const, null)

export const PANE = 'plancia'

// Palette: colori saturi per testo e tratti, le stesse tinte molto trasparenti per gli sfondi,
// così le card si leggono sia col tema chiaro sia con quello scuro.
export const C = {
  accent: '#7C6CF2',
  teal: '#14B8A6',
  sky: '#0EA5E9',
  amber: '#F59E0B',
  rose: '#F43F5E',
  green: '#22C55E',
  pink: '#EC4899',
  muted: '#8B93A1',
}

const tint = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const LEVEL_COLOR: Record<Level, string> = { ok: C.green, warn: C.amber, high: '#F97316', critical: C.rose }
const levelColor = (p: number | undefined) => LEVEL_COLOR[level(p)]

const bar = (percent: number | undefined, width: number) => {
  const filled = Math.max(0, Math.min(width, Math.round(((percent ?? 0) / 100) * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

const SPARK = '▁▂▃▄▅▆▇█'
const spark = (values: number[]) => {
  const max = Math.max(1, ...values)
  return values.map(v => SPARK[Math.min(7, Math.round((v / max) * 7))]).join('')
}

const ORDER = ['five_hour', 'seven_day', 'seven_day_opus', 'spend_limit']
const sortLimits = (limits: Limit[]) =>
  [...limits].sort((a, b) => (ORDER.indexOf(a.kind) + 99) % 99 - ((ORDER.indexOf(b.kind) + 99) % 99))

// --- Sessioni -------------------------------------------------------------------

type Look = { color: string; icon: string; label: string; rank: number }

const LOOK: Record<SessionStatus | 'stale', Look> = {
  'needs-you': { color: C.rose, icon: '⚠', label: 'serve te', rank: 0 },
  'maybe-you': { color: '#F97316', icon: '⏳', label: 'forse serve te', rank: 1 },
  error: { color: C.amber, icon: '✕', label: 'errore', rank: 1 },
  done: { color: C.green, icon: '✓', label: 'finito', rank: 2 },
  working: { color: C.teal, icon: '●', label: 'al lavoro', rank: 3 },
  idle: { color: C.muted, icon: '○', label: 'in attesa', rank: 4 },
  stale: { color: C.muted, icon: '◌', label: 'non risponde', rank: 5 },
  closed: { color: C.muted, icon: '·', label: 'chiusa', rank: 6 },
}

const lookOf = (s: SessionInfo, now: number) => (now - s.seenAt > STALE_MS ? LOOK.stale : LOOK[s.status])

// Tempo di lavoro: somma dei turni chiusi più quello in corso.
const workOf = (s: SessionInfo, now: number) => s.workSeconds + (s.status === 'working' ? Math.max(0, (now - s.since) / 1000) : 0)

// --- SVG (desktop, vscode, mobile) --------------------------------------------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Tre anelli concentrici: contesto, finestra 5 ore, finestra 7 giorni.
const ringsSvg = (rings: { percent: number; color: string }[], center: string, sub: string) => {
  const size = 132
  const c = size / 2
  const parts = rings.map((r, i) => {
    const radius = 56 - i * 15
    const circ = 2 * Math.PI * radius
    const len = (Math.min(100, Math.max(0, r.percent)) / 100) * circ
    return (
      `<circle cx="${c}" cy="${c}" r="${radius}" fill="none" stroke="${tint(r.color, 0.16)}" stroke-width="11"/>` +
      `<circle cx="${c}" cy="${c}" r="${radius}" fill="none" stroke="${r.color}" stroke-width="11" stroke-linecap="round" ` +
      `stroke-dasharray="${len.toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 ${c} ${c})"/>`
    )
  })
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    parts.join('') +
    `<text x="${c}" y="${c + 2}" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="17" font-weight="700" fill="${rings[0]?.color ?? C.accent}">${esc(center)}</text>` +
    `<text x="${c}" y="${c + 15}" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="8.5" fill="${C.muted}">${esc(sub)}</text>` +
    `</svg>`
  )
}

// Barre dei turni: altezza = durata, colore = costo relativo.
const turnsSvg = (list: TurnStat[]) => {
  const w = 480
  const h = 90
  const n = Math.max(list.length, 1)
  const gap = 3
  const bw = Math.max(3, (w - gap * (n - 1)) / n)
  const maxS = Math.max(10, ...list.map(t => t.seconds))
  const maxU = Math.max(0.0001, ...list.map(t => t.usd ?? 0))
  const bars = list.map((t, i) => {
    const bh = Math.max(3, (t.seconds / maxS) * (h - 14))
    const x = i * (bw + gap)
    const color = (t.usd ?? 0) / maxU > 0.66 ? C.pink : (t.usd ?? 0) / maxU > 0.33 ? C.accent : C.sky
    return `<rect x="${x.toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2.5" fill="${color}"><title>${esc(`${duration(t.seconds)} · ${t.tools} tool · ${usd(t.usd)}`)}</title></rect>`
  })
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none">` +
    `<line x1="0" y1="${h - 0.5}" x2="${w}" y2="${h - 0.5}" stroke="${tint(C.muted, 0.35)}"/>` +
    bars.join('') +
    `</svg>`
  )
}

// Barre orizzontali del tempo per progetto.
const hoursSvg = (rows: { name: string; seconds: number }[], color: string) => {
  const w = 480
  const row = 22
  const h = Math.max(row, rows.length * row)
  const max = Math.max(1, ...rows.map(r => r.seconds))
  const label = 150
  const body = rows.map((r, i) => {
    const y = i * row
    const bw = Math.max(4, ((w - label - 60) * r.seconds) / max)
    return (
      `<text x="0" y="${y + 15}" font-family="system-ui,Segoe UI,sans-serif" font-size="12" fill="${C.muted}">${esc(clip(r.name, 22))}</text>` +
      `<rect x="${label}" y="${y + 4}" width="${bw.toFixed(1)}" height="14" rx="7" fill="${color}" opacity="0.85"/>` +
      `<text x="${label + bw + 6}" y="${y + 15}" font-family="system-ui,Segoe UI,sans-serif" font-size="12" font-weight="600" fill="${color}">${esc(duration(r.seconds))}</text>`
    )
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body.join('')}</svg>`
}

// --- Dati derivati --------------------------------------------------------------

type View = {
  g: Gauge | null
  p: Project | null
  five?: Limit
  week?: Limit
  eta?: number
  now: number
}

async function viewOf($: EngineInterface): Promise<View> {
  const g = await read($, gauge)
  const p = await read($, project)
  const s: Sample[] = await read($, samples)
  const now = await $.clock.now()
  const five = g?.limits.find(l => l.kind === 'five_hour')
  const week = g?.limits.find(l => l.kind === 'seven_day')
  return { g, p, five, week, eta: forecast(s, five, now)?.eta, now }
}

// --- Banda sopra il prompt -------------------------------------------------------

export async function drawBand($: EngineInterface, e: RenderInput<'AbovePrompt'>) {
  const { Box, Text, Button } = $.ui.resolve(e)
  const v = await viewOf($)
  const list: Todo[] = await read($, todos)
  const blocked = (await read($, guardLog)).length
  const l = await read($, live)
  const open = list.filter(t => !t.isDone).length
  const cols = e.props.bodyColumns
  const mine = (await read($, self))?.id
  const others: SessionInfo[] = (await read($, sessions)).filter(s => s.id !== mine && v.now - s.seenAt <= STALE_MS)
  const needYou = others.filter(s => s.status === 'needs-you' || s.status === 'maybe-you').length
  const finished = others.filter(s => s.status === 'done').length
  const isCss = e.surface !== 'terminal'
  const ctx = v.g?.percent

  const openTab = (t: Tab) => async () => {
    await update($, tab, () => t)
    await $.ui.open({ id: PANE, title: 'Plancia' })
  }

  // Una "pillola": sfondo tinto sul desktop, solo colore nel terminale.
  const pill = (key: string, color: string, children: RenderChildren) =>
    isCss ? (
      <Box key={key} flexShrink={0} paddingX={1} backgroundColor={tint(color, 0.13)} borderStyle="round" borderColor={tint(color, 0.4)}>
        {children}
      </Box>
    ) : (
      <Box key={key} flexShrink={0} marginRight={2}>
        {children}
      </Box>
    )

  const chips: RenderChildren[] = []
  if (v.p) {
    chips.push(
      pill(
        'proj',
        C.accent,
        <Text color={C.accent} bold wrap="truncate-middle">
          🧭 {v.p.name}
          {v.p.branch ? <Text color={C.pink}> ⎇ {v.p.branch}{v.p.isDirty ? ' ●' : ''}</Text> : ''}
        </Text>,
      ),
    )
  }
  chips.push(
    pill(
      'ctx',
      levelColor(ctx),
      <Text color={levelColor(ctx)}>
        {bar(ctx, cols >= 110 ? 10 : 6)} <Text bold>{ctx ?? 0}%</Text>
        {cols >= 130 ? <Text dimColor> contesto</Text> : ''}
      </Text>,
    ),
  )
  if (v.five) {
    chips.push(
      pill(
        'five',
        levelColor(v.five.percentUsed),
        <Text color={levelColor(v.five.percentUsed)}>
          ⏱ 5h <Text bold>{v.five.percentUsed}%</Text>
          {v.eta ? <Text color={C.rose}> · finisce alle {clock(v.eta)}</Text> : v.five.resetsAt && cols >= 110 ? <Text dimColor> · reset {resetIn(v.five.resetsAt, v.now)}</Text> : ''}
        </Text>,
      ),
    )
  }
  const me = await read($, self)
  const turnList: TurnStat[] = await read($, turns)
  const worked = turnList.reduce((s, t) => s + t.seconds, 0) + (l.workingSince ? Math.max(0, (v.now - l.workingSince) / 1000) : 0)
  chips.push(
    pill(
      'time',
      C.pink,
      <Text color={C.pink}>
        ⏱ <Text bold>{duration(worked)}</Text>
        {me && cols >= 120 ? <Text dimColor> di lavoro · aperta da {duration((v.now - me.startedAt) / 1000)}</Text> : <Text dimColor> lavoro</Text>}
      </Text>,
    ),
  )
  if (cols >= 100) {
    chips.push(
      pill(
        'cost',
        C.sky,
        <Text color={C.sky}>
          💰 <Text bold>{usd(l.turnUsd)}</Text>
          <Text dimColor> / {usd(v.g?.usd)}</Text>
        </Text>,
      ),
    )
  }

  return (
    <Box flexDirection="row" justifyContent="space-between" gap={1}>
      <Box flexDirection="row" gap={1} flexShrink={1} overflow="hidden">
        {chips}
      </Box>
      <Box flexDirection="row" gap={1} flexShrink={0}>
        {needYou > 0 && (
          <Button key="band-needs" plain onPress={openTab('sessioni')}>
            <Text color={C.rose} bold>
              📣 {needYou}
            </Text>
          </Button>
        )}
        {finished > 0 && (
          <Button key="band-done" plain onPress={openTab('sessioni')}>
            <Text color={C.green}>✓ {finished}</Text>
          </Button>
        )}
        <Button key="band-todo" plain onPress={openTab('attivita')}>
          <Text color={open > 0 ? C.teal : C.muted}>✅ {open}</Text>
        </Button>
        {blocked > 0 && (
          <Button key="band-guard" plain onPress={openTab('regole')}>
            <Text color={C.rose}>🛡 {blocked}</Text>
          </Button>
        )}
        <Button key="band-open" label="Plancia" variant="primary" onPress={openTab('cruscotto')} />
      </Box>
    </Box>
  )
}

// --- Pannello -------------------------------------------------------------------

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'cruscotto', label: 'Cruscotto', icon: '📊' },
  { id: 'sessioni', label: 'Sessioni', icon: '🛰' },
  { id: 'attivita', label: 'Attività', icon: '✅' },
  { id: 'diario', label: 'Diario', icon: '📓' },
  { id: 'regole', label: 'Regole', icon: '🛡' },
]

export async function drawPane($: EngineInterface, e: RenderInput<'Pane'>) {
  const ui = $.ui.resolve(e)
  const { Box, Text, Button } = ui
  const Svg = 'Svg' in ui ? ui.Svg : undefined
  const Input = 'Input' in ui ? ui.Input : undefined
  const isCss = e.surface !== 'terminal'
  const cols = e.props.bodyColumns
  const current: Tab = await read($, tab)
  const v = await viewOf($)
  const todoList: Todo[] = await read($, todos)
  const allSessions: SessionInfo[] = await read($, sessions)
  const selfId = (await read($, self))?.id

  // Spaziature: generose dove i colori sono CSS, compatte nel terminale.
  const S = {
    page: isCss ? ('md' as const) : 1,
    card: isCss ? ('sm' as const) : 0,
    list: isCss ? ('xs' as const) : 0,
  }

  // Card: bordo e sfondo della tinta data, titolo piccolo e spaziato sopra al contenuto.
  const Card = (key: string, color: string, title: string, children: RenderChildren, grow = 1) => (
    <Box
      key={key}
      flexDirection="column"
      flexGrow={grow}
      flexShrink={1}
      minWidth={isCss ? 24 : undefined}
      borderStyle="round"
      borderColor={isCss ? tint(color, 0.4) : color}
      backgroundColor={isCss ? tint(color, 0.06) : undefined}
      paddingX={isCss ? 2 : 1}
      paddingY={isCss ? 1 : 0}
      gap={S.card}
    >
      <Text color={color} size="caption" weight="bold" bold>
        {title.toUpperCase()}
      </Text>
      {children}
    </Box>
  )

  // Riga di un elenco: una piastrella appena tinta, contenuto a sinistra e azioni a destra.
  const Row = (key: string, color: string, main: RenderChildren, actions?: RenderChildren) => (
    <Box
      key={key}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      gap={1}
      paddingX={isCss ? 1 : 0}
      paddingY={isCss ? 'xs' : 0}
      backgroundColor={isCss ? tint(color, 0.07) : undefined}
    >
      <Box flexDirection="column" flexShrink={1} flexGrow={1}>
        {main}
      </Box>
      {actions && (
        <Box flexDirection="row" gap={1} flexShrink={0}>
          {actions}
        </Box>
      )}
    </Box>
  )

  const Big = (text: string, color: string) => (
    <Text color={color} bold size="title" weight="bold">
      {text}
    </Text>
  )

  const Muted = (text: string, key?: string) => (
    <Text key={key} color={isCss ? C.muted : undefined} dimColor={!isCss} size="footnote" wrap="wrap">
      {text}
    </Text>
  )

  // Valore con etichetta, per le card piccole: «ultimo turno  $0.12».
  const Pair = (label: string, value: string, key: string) => (
    <Text key={key} size="footnote">
      <Text color={isCss ? C.muted : undefined} dimColor={!isCss}>
        {label}{' '}
      </Text>
      <Text weight="semibold" bold>
        {value}
      </Text>
    </Text>
  )

  // Intestazione
  const header = (
    <Box flexDirection="column" gap={S.card}>
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box flexDirection="column" flexShrink={1}>
          <Text bold size="heading" weight="bold" color={C.accent} wrap="truncate-middle">
            🧭 {v.p?.name ?? 'Plancia'}
          </Text>
          {v.p?.branch ? (
            <Text color={C.pink} size="footnote" wrap="truncate-middle">
              ⎇ {v.p.branch}
              {v.p.isDirty ? ' · modifiche non salvate' : ' · pulito'}
            </Text>
          ) : (
            v.p?.isRepo === false && Muted('cartella senza git')
          )}
        </Box>
        <Button key="refresh" label="↻ Aggiorna" plain onPress={() => void Promise.all([refreshProject($), refreshDigest($)])} />
      </Box>
      <Box flexDirection="row" gap={1} flexWrap="wrap">
        {TABS.map(t => {
          const count =
            t.id === 'attivita'
              ? todoList.filter(x => !x.isDone).length
              : t.id === 'sessioni'
                ? allSessions.filter(x => x.id !== selfId && ['needs-you', 'maybe-you', 'done'].includes(x.status) && v.now - x.seenAt <= STALE_MS).length
                : 0
          return (
            <Button
              key={`tab-${t.id}`}
              label={`${t.icon} ${t.label}${count ? ` · ${count}` : ''}`}
              variant={t.id === current ? 'primary' : 'secondary'}
              onPress={() => void update($, tab, () => t.id)}
            />
          )
        })}
      </Box>
    </Box>
  )

  // --- Cruscotto ---
  const dashboard = async () => {
    const g = v.g
    const l = await read($, live)
    const list: TurnStat[] = await read($, turns)
    const touched: FileTouch[] = await read($, files)
    const ctx = g?.percent ?? 0
    const five = v.five?.percentUsed ?? 0
    const week = v.week?.percentUsed ?? 0
    const avg = g?.usd !== undefined && list.length > 0 ? g.usd / list.length : undefined
    const last = list[list.length - 1]
    const root = v.p?.path.replace(/\\/g, '/').toLowerCase() ?? ''
    // Nome del file in evidenza e cartella attenuata, relativa al progetto se ci sta dentro.
    const split = (p: string) => {
      const n = p.replace(/\\/g, '/')
      const inside = root !== '' && n.toLowerCase().startsWith(`${root}/`)
      const rel = inside ? n.slice(root.length + 1) : n
      const parts = rel.split('/')
      const name = parts.pop() ?? rel
      const dir = parts.length ? (inside ? parts.join('/') : `…/${parts.slice(-2).join('/')}`) : ''
      return { name, dir }
    }

    const metric = (key: string, color: string, label: string, value: string, note: string) => (
      <Box key={key} flexDirection="column">
        <Text>
          <Text color={color} bold weight="semibold">
            ● {label}{' '}
          </Text>
          <Text bold weight="bold">
            {value}
          </Text>
        </Text>
        {note ? Muted(note) : null}
      </Box>
    )

    const legend = (
      <Box flexDirection="column" gap={S.card} flexShrink={1} flexGrow={1}>
        {metric('m-ctx', levelColor(ctx), 'Contesto', `${ctx}%`, `${k(g?.tokens)} di ${k(g?.window)} token`)}
        {!Svg && <Text color={levelColor(ctx)}>{bar(ctx, 24)}</Text>}
        {v.five
          ? metric('m-five', C.teal, '5 ore', `${five}%`, `reset tra ${resetIn(v.five.resetsAt, v.now)}`)
          : Muted('5 ore: nessuna lettura ancora')}
        {!Svg && v.five && <Text color={C.teal}>{bar(five, 24)}</Text>}
        {v.week && metric('m-week', C.sky, '7 giorni', `${week}%`, `reset tra ${resetIn(v.week.resetsAt, v.now)}`)}
        {!Svg && v.week && <Text color={C.sky}>{bar(week, 24)}</Text>}
        {g?.limits
          .filter(x => !['five_hour', 'seven_day'].includes(x.kind))
          .map(x => metric(`m-${x.kind}`, levelColor(x.percentUsed), limitName(x.kind), `${x.percentUsed}%`, x.resetsAt ? `reset tra ${resetIn(x.resetsAt, v.now)}` : ''))}
      </Box>
    )

    const verdict = v.eta ? (
      <Text color={C.rose} bold weight="semibold" wrap="wrap">
        ⚠ A questo ritmo la finestra di 5 ore finisce alle {clock(v.eta)}
      </Text>
    ) : (
      v.five && (
        <Text color={C.green} weight="semibold" wrap="wrap">
          ✓ Al ritmo attuale arrivi al reset
        </Text>
      )
    )

    return (
      <Box flexDirection="column" gap={S.page}>
        {Card(
          'usage',
          levelColor(Math.max(ctx, five)),
          'Consumo',
          <Box flexDirection="column" gap={S.card}>
            <Box flexDirection="row" gap={isCss ? 'lg' : 2} alignItems="center" flexWrap="wrap">
              {Svg && (
                <Svg
                  source={ringsSvg(
                    [
                      { percent: ctx, color: levelColor(ctx) },
                      { percent: five, color: C.teal },
                      { percent: week, color: C.sky },
                    ],
                    `${ctx}%`,
                    'contesto',
                  )}
                  alt={`Contesto ${ctx}%, 5 ore ${five}%, 7 giorni ${week}%`}
                  width={140}
                  height={140}
                />
              )}
              {legend}
            </Box>
            {verdict}
          </Box>,
        )}
        <Box flexDirection={cols >= 70 ? 'row' : 'column'} gap={S.page}>
          {Card(
            'cost',
            C.sky,
            'Costo sessione',
            <Box flexDirection="column" gap={S.list}>
              {Big(usd(g?.usd), C.sky)}
              {Pair('ultimo turno', usd(l.turnUsd), 'c1')}
              {Pair('media per turno', usd(avg), 'c2')}
            </Box>,
          )}
          {Card(
            'tools',
            C.accent,
            'Chiamate ai tool',
            <Box flexDirection="column" gap={S.list}>
              {Big(String(l.sessionTools), C.accent)}
              {Pair('ultimo turno', String(l.turnTools), 't1')}
            </Box>,
          )}
          {Card(
            'turns',
            C.pink,
            'Turni',
            <Box flexDirection="column" gap={S.list}>
              {Big(String(list.length), C.pink)}
              {last ? Pair('ultimo', duration(last.seconds), 'u1') : Muted('ancora nessuno')}
            </Box>,
          )}
        </Box>
        {list.length > 0 &&
          Card(
            'chart',
            C.accent,
            'Durata dei turni',
            Svg ? (
              <Svg source={turnsSvg(list.slice(-30))} alt={`Durata degli ultimi ${Math.min(30, list.length)} turni`} />
            ) : (
              <Text color={C.accent}>{spark(list.slice(-Math.max(8, cols - 6)).map(t => t.seconds))}</Text>
            ),
          )}
        {Card(
          'files',
          C.amber,
          `File toccati · ${touched.length}`,
          touched.length === 0 ? (
            Muted('Nessuna modifica in questa sessione.')
          ) : (
            <Box flexDirection="column" gap={S.list}>
              {[...touched]
                .sort((a, b) => b.at - a.at)
                .slice(0, 10)
                .map(f => {
                  const { name, dir } = split(f.path)
                  return Row(
                    `f-${f.path}`,
                    C.amber,
                    <Box flexDirection="column">
                      <Text weight="semibold" bold wrap="truncate-middle">
                        {name}
                      </Text>
                      {dir ? (
                        <Text color={isCss ? C.muted : undefined} dimColor={!isCss} size="caption" wrap="truncate-start">
                          {dir}
                        </Text>
                      ) : null}
                    </Box>,
                    <Text color={C.amber} weight="semibold">
                      ✎ {f.edits}
                    </Text>,
                  )
                })}
              {touched.length > 10 && Muted(`e altri ${touched.length - 10}`)}
            </Box>
          ),
        )}
      </Box>
    )
  }

  // --- Sessioni ---
  const sessionsTab = async () => {
    const now = v.now
    const list = [...allSessions].sort((a, b) => lookOf(a, now).rank - lookOf(b, now).rank || b.seenAt - a.seenAt)
    const count = (st: SessionStatus) => list.filter(s => s.status === st && now - s.seenAt <= STALE_MS).length
    const totalWork = list.reduce((sum, s) => sum + workOf(s, now), 0)
    const totalUsd = list.reduce((sum, s) => sum + (s.usd ?? 0), 0)

    const summary = (key: string, color: string, n: number, label: string) => (
      <Box key={key} flexDirection="column" flexGrow={1} paddingX={isCss ? 1 : 0} paddingY={isCss ? 'xs' : 0} backgroundColor={isCss ? tint(color, 0.1) : undefined}>
        <Text color={color} bold size="heading" weight="bold">
          {String(n)}
        </Text>
        {Muted(label)}
      </Box>
    )

    const card = (s: SessionInfo) => {
      const look = lookOf(s, now)
      const isMe = s.id === selfId
      const facts = [
        `⏱ ${duration(workOf(s, now))} di lavoro`,
        `${s.turns} turni`,
        s.usd !== undefined ? usd(s.usd) : undefined,
        s.context !== undefined ? `contesto ${s.context}%` : undefined,
        `aperta da ${duration((now - s.startedAt) / 1000)}`,
      ].filter(Boolean)
      return (
        <Box
          key={`s-${s.id}`}
          flexDirection="column"
          gap={S.list}
          borderStyle="round"
          borderColor={isCss ? tint(look.color, look.rank <= 2 ? 0.7 : 0.35) : look.color}
          backgroundColor={isCss ? tint(look.color, look.rank <= 2 ? 0.1 : 0.04) : undefined}
          paddingX={isCss ? 2 : 1}
          paddingY={isCss ? 1 : 0}
        >
          <Box flexDirection="row" justifyContent="space-between" gap={1}>
            <Text bold weight="bold" wrap="truncate-middle">
              <Text color={look.color}>{look.icon} </Text>
              {s.project}
              {s.branch ? <Text color={C.pink}> ⎇ {s.branch}</Text> : ''}
            </Text>
            {isMe && (
              <Text color={C.accent} size="caption" weight="semibold">
                QUESTA SESSIONE
              </Text>
            )}
          </Box>
          <Text color={look.color} weight="semibold" wrap="wrap">
            {look.label}
            {s.detail ? ` · ${s.detail}` : ''}
            <Text color={isCss ? C.muted : undefined} dimColor={!isCss}>
              {' '}· {ago(s.since, now)}
            </Text>
          </Text>
          {(s.lastSummary ?? s.prompt) && Muted(`${s.lastSummary ? '📓 ' : '💬 '}${clip(s.lastSummary ?? s.prompt ?? '', 160)}`)}
          {Muted(facts.join(' · '))}
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap={S.page}>
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          {summary('n-need', C.rose, count('needs-you') + count('maybe-you'), 'serve te')}
          {summary('n-done', C.green, count('done'), 'finite')}
          {summary('n-work', C.teal, count('working'), 'al lavoro')}
          {summary('n-idle', C.muted, count('idle'), 'in attesa')}
        </Box>
        <Box flexDirection="row" gap={2} flexWrap="wrap">
          {Pair('lavoro totale', duration(totalWork), 'tw')}
          {Pair('costo totale', usd(totalUsd), 'tu')}
          {Pair('sessioni', String(list.length), 'tn')}
        </Box>
        {list.length === 0 && Muted('Nessuna sessione ancora: compaiono entro 20 secondi.')}
        <Box flexDirection="column" gap={S.card}>
          {list.map(card)}
        </Box>
        {Muted('Compaiono le sessioni di questo PC che hanno la Plancia attiva. Si aggiorna ogni 20 secondi.')}
      </Box>
    )
  }

  // --- Attività ---
  const activities = async () => {
    const ideaList = await read($, ideas)
    const snips = await read($, snippets)
    const openTodos = todoList.filter(t => !t.isDone)
    const done = todoList.filter(t => t.isDone)

    return (
      <Box flexDirection="column" gap={S.page}>
        <Box flexDirection="column" gap={S.list}>
          <Box flexDirection="row">
            <Button
              key="resume"
              label="↪ Riprendi con Claude"
              variant="primary"
              onPress={() => void resumeText($).then(text => $.prompt.fill({ text, mode: 'replace' }))}
            />
          </Box>
          {Muted('Mette nel prompt todo e ultime attività: li rileggi e premi Invio.')}
        </Box>
        {Card(
          'todo',
          C.teal,
          `Todo del progetto · ${openTodos.length} aperti`,
          <Box flexDirection="column" gap={S.card}>
            {Input && (
              <Input key="todo-new" placeholder="Nuovo todo, poi Invio" submitLabel="Aggiungi" onSubmit={text => void (text.trim() && addTodo($, text, 'io'))} />
            )}
            {openTodos.length === 0 && Muted('Niente in sospeso. Anche Claude può aggiungere todo qui.')}
            <Box flexDirection="column" gap={S.list}>
              {openTodos.map(t =>
                Row(
                  `t-${t.id}`,
                  C.teal,
                  <Box flexDirection="column">
                    <Button key={`todo-${t.id}`} plain onPress={() => void toggleTodo($, t.id)}>
                      <Text color={C.teal} bold>
                        ○{' '}
                      </Text>
                      {t.text}
                    </Button>
                    {Muted(`${t.by === 'claude' ? '🤖 aggiunto da Claude · ' : ''}${ago(t.at, v.now)}`)}
                  </Box>,
                  <Button key={`del-${t.id}`} label="✕" plain dimColor onPress={() => void removeTodo($, t.id)} />,
                ),
              )}
            </Box>
            {done.length > 0 && (
              <Box flexDirection="column" gap={S.list}>
                {done.slice(-5).map(t => (
                  <Button key={`undo-${t.id}`} plain dimColor onPress={() => void toggleTodo($, t.id)}>
                    <Text color={C.green}>✓ </Text>
                    <Text strikethrough dimColor>
                      {t.text}
                    </Text>
                  </Button>
                ))}
                <Button key="clear-done" label={`Pulisci ${done.length} completati`} plain dimColor onPress={() => void clearDone($)} />
              </Box>
            )}
          </Box>,
        )}
        {Card(
          'ideas',
          C.amber,
          `Idee parcheggiate · ${ideaList.length}`,
          <Box flexDirection="column" gap={S.card}>
            {Input && (
              <Input key="idea-new" placeholder="Un'idea per dopo, poi Invio" submitLabel="Parcheggia" onSubmit={text => void (text.trim() && addIdea($, text))} />
            )}
            {ideaList.length === 0 && Muted('Valgono per tutti i progetti. Dal prompt: /idea testo')}
            <Box flexDirection="column" gap={S.list}>
              {[...ideaList]
                .reverse()
                .slice(0, 12)
                .map(i =>
                  Row(
                    `i-${i.id}`,
                    C.amber,
                    <Box flexDirection="column">
                      <Text wrap="wrap">💡 {i.text}</Text>
                      {Muted(`${i.project ? `${i.project} · ` : ''}${ago(i.at, v.now)}`)}
                    </Box>,
                    <Box flexDirection="row" gap={1}>
                      <Button key={`promote-${i.id}`} label="→ todo" plain onPress={() => void addTodo($, i.text, 'io').then(() => removeIdea($, i.id))} />
                      <Button key={`idel-${i.id}`} label="✕" plain dimColor onPress={() => void removeIdea($, i.id)} />
                    </Box>,
                  ),
                )}
            </Box>
          </Box>,
        )}
        {Card(
          'snippets',
          C.accent,
          `Prompt riusabili · ${snips.length}`,
          <Box flexDirection="column" gap={S.card}>
            {Muted('Premi il nome per metterlo nel prompt, o scrivi ;nome nel prompt. Nuovo: /snippet nome testo')}
            <Box flexDirection="column" gap={S.list}>
              {snips.map(s =>
                Row(
                  `s-${s.name}`,
                  C.accent,
                  <Box flexDirection="column">
                    <Button key={`use-${s.name}`} plain onPress={() => void $.prompt.fill({ text: s.text, mode: 'insert' })}>
                      <Text color={C.accent} bold>
                        ;{s.name}
                      </Text>
                    </Button>
                    {Muted(clip(s.text, Math.max(40, cols * 2 - 20)))}
                  </Box>,
                  <Button key={`sdel-${s.name}`} label="✕" plain dimColor onPress={() => void removeSnippet($, s.name)} />,
                ),
              )}
            </Box>
          </Box>,
        )}
      </Box>
    )
  }

  // --- Diario ---
  const journal = async () => {
    const d = (await read($, digest)) ?? { today: [], week: [], entries: [] }
    const mine: Entry[] = d.entries.filter(x => x.projectKey === v.p?.key)
    const todayTotal = d.today.reduce((s, x) => s + x.seconds, 0)
    const weekTotal = d.week.reduce((s, x) => s + x.seconds, 0)
    const byDay = new Map<string, Entry[]>()
    for (const x of [...mine].reverse().slice(0, 25)) {
      const day = shortDate(x.at)
      byDay.set(day, [...(byDay.get(day) ?? []), x])
    }

    const timeRows = (rows: { name: string; seconds: number; turns: number }[], color: string) =>
      Svg && rows.length > 0 ? (
        <Svg source={hoursSvg(rows.slice(0, 8), color)} alt={rows.map(r => `${r.name} ${duration(r.seconds)}`).join(', ')} />
      ) : (
        <Box flexDirection="column">
          {rows.slice(0, 8).map(r => (
            <Text key={r.name}>
              <Text color={color}>{bar((r.seconds / Math.max(1, rows[0]?.seconds ?? 1)) * 100, 14)}</Text> {duration(r.seconds)}{' '}
              <Text dimColor>{r.name}</Text>
            </Text>
          ))}
        </Box>
      )

    const copyToday = async () => {
      const today = d.entries.filter(x => dayStart(x.at) === dayStart(v.now))
      await $.ui.copy({ text: standupText(today), surface: e.surface })
      $.ui.toast('Riepilogo di oggi copiato')
    }

    return (
      <Box flexDirection="column" gap={S.page}>
        <Box flexDirection={cols >= 70 ? 'row' : 'column'} gap={S.page}>
          {Card(
            'today',
            C.teal,
            'Oggi',
            <Box flexDirection="column" gap={S.list}>
              {Big(duration(todayTotal), C.teal)}
              {Pair('turni', String(d.today.reduce((s, x) => s + x.turns, 0)), 'o1')}
              {Pair('progetti', String(d.today.length), 'o2')}
            </Box>,
          )}
          {Card(
            'week',
            C.accent,
            'Ultimi 7 giorni',
            <Box flexDirection="column" gap={S.list}>
              {Big(duration(weekTotal), C.accent)}
              {Pair('turni', String(d.week.reduce((s, x) => s + x.turns, 0)), 'w1')}
              {Pair('progetti', String(d.week.length), 'w2')}
            </Box>,
          )}
        </Box>
        {d.today.length > 0 && Card('today-proj', C.teal, 'Oggi per progetto', timeRows(d.today, C.teal))}
        {d.week.length > 0 && Card('week-proj', C.accent, 'Settimana per progetto', timeRows(d.week, C.accent))}
        {Card(
          'timeline',
          C.pink,
          `Cronologia · ${v.p?.name ?? 'progetto'}`,
          <Box flexDirection="column" gap={S.card}>
            {byDay.size === 0 && Muted('Il diario si scrive da solo: una riga per turno, riassunta da Haiku.')}
            {[...byDay.entries()].map(([day, list]) => (
              <Box key={`d-${day}`} flexDirection="column" gap={S.list}>
                <Text color={C.pink} bold weight="bold" size="footnote">
                  {day}
                </Text>
                {list.map(x =>
                  Row(
                    `e-${x.at}`,
                    C.pink,
                    <Box flexDirection="column">
                      <Text wrap="wrap">{x.summary}</Text>
                      {Muted(`${clock(x.at)} · ${duration(x.seconds)}${x.files ? ` · ${x.files} file` : ''}${x.usd !== undefined ? ` · ${usd(x.usd)}` : ''}`)}
                    </Box>,
                  ),
                )}
              </Box>
            ))}
          </Box>,
        )}
        <Box flexDirection="row" gap={1}>
          <Button key="copy-today" label="Copia il riepilogo di oggi" variant="primary" onPress={() => void copyToday()} />
          <Button key="refresh-digest" label="Aggiorna" onPress={() => void refreshDigest($)} />
        </Box>
      </Box>
    )
  }

  // --- Regole ---
  const rules = async () => {
    const log = await read($, guardLog)
    const seen = await read($, hookSeen)
    // Un controllo è attivo solo se il suo evento arriva alla Plancia: una policy aziendale può intercettarlo prima.
    const isPromptActive = seen.turn === undefined || (seen.prompt !== undefined && seen.prompt >= seen.turn - 60_000)
    const isCheckActive = seen.shell === undefined || (seen.check !== undefined && seen.check >= seen.shell - 60_000)
    const POLICY = 'Non attiva qui: questi eventi li gestisce prima la policy di sicurezza aziendale, che ha la precedenza.'
    const rule = (key: string, color: string, icon: string, title: string, text: string, isActive = true) => (
      <Box key={key} flexDirection="column">
        <Text color={isActive ? color : C.muted} bold weight="semibold" strikethrough={!isActive}>
          {icon} {title}
        </Text>
        {Muted(text)}
        {!isActive && (
          <Text color={C.amber} size="footnote" wrap="wrap">
            {POLICY}
          </Text>
        )}
      </Box>
    )
    return (
      <Box flexDirection="column" gap={S.page}>
        {Card(
          'rules',
          C.green,
          'Regole della Plancia',
          <Box flexDirection="column" gap={isCss ? 'md' : 1}>
            {rule('r1', C.rose, '🔒', 'Segreti nel prompt: bloccati', 'Chiavi private, token e chiavi API, stringhe di connessione con password, JWT.', isPromptActive)}
            {rule('r2', C.rose, '📄', '@file sensibili: non letti', '.env, .pem, .key, .pfx, id_rsa, secrets.json, .npmrc e simili.', isPromptActive)}
            {rule('r3', C.amber, '✋', 'Comandi rischiosi: chiedono conferma', 'rm -rf, push forzato, reset --hard, DROP/TRUNCATE, az, AD, terraform, kubectl, firewall, publish.', isCheckActive)}
            {rule('r4', C.amber, '🔑', 'File di credenziali: chiedono conferma', 'Lettura o modifica da parte di Claude degli stessi file sensibili.', isCheckActive)}
            {rule('r5', C.sky, '🔔', 'Notifica a fine turno', 'Quando un turno dura più di un minuto.')}
            {Muted('Lo stato si aggiorna dopo il primo prompt e il primo comando della sessione.')}
          </Box>,
        )}
        {Card(
          'log',
          log.length ? C.rose : C.muted,
          `Interventi in questa sessione · ${log.length}`,
          <Box flexDirection="column" gap={S.list}>
            {log.length === 0 && Muted('Nessun intervento.')}
            {[...log].reverse().map((x, i) =>
              Row(
                `g-${i}`,
                x.outcome === 'bloccato' ? C.rose : C.amber,
                <Box flexDirection="column">
                  <Text wrap="wrap">
                    <Text color={x.outcome === 'bloccato' ? C.rose : C.amber} bold>
                      {x.outcome}
                    </Text>{' '}
                    {x.kind}
                  </Text>
                  {Muted(`${clock(x.at)} · ${x.detail}`)}
                </Box>,
              ),
            )}
          </Box>,
        )}
      </Box>
    )
  }

  const body =
    current === 'sessioni' ? await sessionsTab() : current === 'attivita' ? await activities() : current === 'diario' ? await journal() : current === 'regole' ? await rules() : await dashboard()

  return (
    <Box flexDirection="column" gap={isCss ? 'lg' : 1} paddingX={isCss ? 1 : 0} paddingY={isCss ? 'xs' : 0}>
      {header}
      {body}
    </Box>
  )
}

const dayStart = (ms: number) => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Testo per uno standup o per la rendicontazione: attività per progetto, in ordine di tempo.
export const standupText = (entries: Entry[]) => {
  if (entries.length === 0) return 'Nessuna attività registrata.'
  const by = new Map<string, Entry[]>()
  for (const x of entries) by.set(x.project, [...(by.get(x.project) ?? []), x])
  const blocks = [...by.entries()].map(([name, list]) => {
    const total = list.reduce((s, x) => s + x.seconds, 0)
    const lines = list.map(x => `- ${clock(x.at)} ${x.summary}`)
    return `${name} (${duration(total)} di turni)\n${lines.join('\n')}`
  })
  return blocks.join('\n\n')
}
