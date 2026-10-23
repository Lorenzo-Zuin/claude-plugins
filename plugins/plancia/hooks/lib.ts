// Funzioni pure: formattazione, date, previsione dei rate limit, riconoscimento di segreti e comandi rischiosi.
// Niente `$` qui dentro, così si testano da sole.

import type { Entry, Limit, ProjectTime, Sample } from '../types'

export const HOUR = 3_600_000
export const DAY = 24 * HOUR

export const k = (n: number | undefined) => {
  if (n === undefined) return '–'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`
  return String(n)
}

export const usd = (n: number | undefined) => {
  if (n === undefined) return '–'
  if (n > 0 && n < 0.01) return '<$0.01'
  return `$${n.toFixed(2)}`
}

export const duration = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
}

const pad = (n: number) => String(n).padStart(2, '0')

export const dayKey = (ms: number) => {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const clock = (ms: number) => {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const shortDate = (ms: number) => {
  const d = new Date(ms)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

export const ago = (ms: number, now: number) => {
  const s = Math.max(0, (now - ms) / 1000)
  if (s < 90) return 'adesso'
  if (s < 3600) return `${Math.round(s / 60)} min fa`
  if (s < 86_400) return `${Math.round(s / 3600)} h fa`
  const d = Math.round(s / 86_400)
  return d === 1 ? 'ieri' : `${d} giorni fa`
}

export const resetIn = (iso: string | undefined, now: number) => {
  if (!iso) return ''
  const at = Date.parse(iso)
  if (Number.isNaN(at)) return ''
  return duration(Math.max(0, (at - now) / 1000))
}

export const baseName = (path: string) => path.split(/[\\/]/).filter(Boolean).pop() ?? path

// Chiave stabile di un progetto: il percorso, minuscolo e con le barre normalizzate.
export const projectKey = (path: string) => path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()

export const newId = () => Math.random().toString(36).slice(2, 8)

export const clip = (text: string, max: number) => {
  const one = text.replace(/\s+/g, ' ').trim()
  return one.length > max ? `${one.slice(0, max - 1)}…` : one
}

export const LIMIT_NAMES: Record<string, string> = {
  five_hour: '5h',
  seven_day: '7g',
  seven_day_opus: '7g Opus',
  spend_limit: 'spesa',
}

export const limitName = (kind: string) => LIMIT_NAMES[kind] ?? kind

// Livello di un valore percentuale: decide il colore di barre, chip e card.
export type Level = 'ok' | 'warn' | 'high' | 'critical'

export const level = (percent: number | undefined): Level => {
  const p = percent ?? 0
  if (p < 50) return 'ok'
  if (p < 75) return 'warn'
  if (p < 90) return 'high'
  return 'critical'
}

// Previsione: al ritmo dell'ultima ora, quando la finestra arriva al 100%.
// `undefined` se il consumo è fermo o se il reset arriva prima.
export type Forecast = { eta?: number; perHour: number; resetsAt?: number }

export const forecast = (samples: Sample[], limit: Limit | undefined, now: number): Forecast | undefined => {
  if (!limit) return undefined
  const resetsAt = limit.resetsAt ? Date.parse(limit.resetsAt) : undefined
  const reset = resetsAt !== undefined && !Number.isNaN(resetsAt) ? resetsAt : undefined
  const recent = samples.filter(s => s.at >= now - HOUR && s.resetsAt === limit.resetsAt)
  const first = recent[0]
  if (!first || now - first.at < 5 * 60_000) return { perHour: 0, resetsAt: reset }
  const perHour = ((limit.percentUsed - first.percent) / (now - first.at)) * HOUR
  if (perHour <= 0) return { perHour: 0, resetsAt: reset }
  const eta = now + ((100 - limit.percentUsed) / perHour) * HOUR
  return { eta: reset !== undefined && eta >= reset ? undefined : eta, perHour, resetsAt: reset }
}

export const sumByProject = (entries: Entry[]): ProjectTime[] => {
  const by = new Map<string, ProjectTime>()
  for (const e of entries) {
    const cur = by.get(e.projectKey) ?? { key: e.projectKey, name: e.project, seconds: 0, turns: 0 }
    cur.seconds += e.seconds
    cur.turns += 1
    by.set(e.projectKey, cur)
  }
  return [...by.values()].sort((a, b) => b.seconds - a.seconds)
}

// Segreti nel testo: formati noti ad alta confidenza, per non bloccare il lavoro con falsi positivi.
const SECRET_PATTERNS: [string, RegExp][] = [
  ['chiave privata', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP |ENCRYPTED )?PRIVATE KEY-----/],
  ['chiave API Anthropic', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['chiave API OpenAI', /\bsk-(?:proj-)?[A-Za-z0-9]{32,}/],
  ['token GitHub', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{40,}/],
  ['chiave AWS', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['chiave Google', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['token Slack', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['stringa di connessione Azure Storage', /AccountKey=[A-Za-z0-9+/=]{40,}/i],
  ['firma SAS di Azure', /[?&]sig=[A-Za-z0-9%+/=]{30,}/],
  ['stringa di connessione con password', /\b(?:Password|Pwd)\s*=\s*[^;'"\s]{4,}\s*;/i],
  ['URL con credenziali', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s:/@]{4,}@[^\s]+/i],
  ['token JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
]

export const findSecret = (text: string): string | undefined => SECRET_PATTERNS.find(([, re]) => re.test(text))?.[0]

export const redact = (text: string) =>
  SECRET_PATTERNS.reduce((out, [, re]) => out.replace(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`), '[segreto]'), text)

// File che contengono di solito credenziali.
const SECRET_FILES = [
  /(^|[\\/])\.env(\.[^\\/]*)?$/i,
  /\.(pem|key|pfx|p12|jks|keystore|kdbx|ppk)$/i,
  /(^|[\\/])id_(rsa|dsa|ecdsa|ed25519)$/i,
  /(^|[\\/])(secrets?|credentials?)\.(json|ya?ml|xml|txt)$/i,
  /(^|[\\/])\.(npmrc|pypirc|netrc|git-credentials)$/i,
]

export const isSecretFile = (path: string) => SECRET_FILES.some(re => re.test(path))

// Comandi distruttivi o che toccano sistemi remoti: chiedono sempre conferma.
const RISKY_COMMANDS: [string, RegExp][] = [
  ['cancellazione ricorsiva', /\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r|--recursive\s+--force|--force\s+--recursive)\b/i],
  ['cancellazione ricorsiva', /\bRemove-Item\b(?=.*-Recurse)(?=.*-Force)/i],
  ['cancellazione ricorsiva', /\b(rd|rmdir)\s+\/s\b/i],
  ['push forzato', /\bgit\s+push\b.*(\s--force\b|\s-f\b|--force-with-lease)/i],
  ['reset distruttivo di git', /\bgit\s+(reset\s+--hard|clean\s+-[a-z]*[fdx])/i],
  ['riscrittura della storia git', /\bgit\s+(filter-branch|filter-repo|rebase\b.*--root)/i],
  ['DDL o cancellazione su database', /\b(DROP\s+(TABLE|DATABASE|SCHEMA|INDEX)|TRUNCATE\s+TABLE|DELETE\s+FROM\s+\w+\s*(;|$))/i],
  ['modifica di risorse Azure', /\baz\s+\S+(\s+\S+)*\s+(delete|create|update|set|purge|deallocate|stop|restart)\b/i],
  ['modifica di risorse Azure', /\b(Remove|New|Set|Stop|Restart)-Az[A-Za-z]+/],
  ['Active Directory', /\b(Remove|New|Set|Disable|Enable|Unlock|Move)-AD[A-Za-z]+/],
  ['Terraform', /\bterraform\s+(apply|destroy|import|state\s+(rm|mv|push))\b/i],
  ['Kubernetes', /\bkubectl\s+(delete|apply|replace|patch|scale|drain|cordon)\b/i],
  ['Docker', /\bdocker\s+(system\s+prune|volume\s+(rm|prune)|rm\s+-f)\b/i],
  ['pubblicazione di pacchetti', /\b(npm|pnpm|yarn)\s+publish\b|\bdotnet\s+nuget\s+push\b|\btwine\s+upload\b/i],
  ['spegnimento o formattazione', /\b(shutdown|Stop-Computer|Restart-Computer|format\s+[a-z]:|mkfs\.)/i],
  ['firewall', /\b(netsh\s+advfirewall|New-NetFirewallRule|Set-NetFirewallRule|Remove-NetFirewallRule|iptables\s+-[ADFI]|ufw\s+(allow|deny|delete))/i],
]

export const findRisk = (command: string): string | undefined => RISKY_COMMANDS.find(([, re]) => re.test(command))?.[0]

export const DEFAULT_SNIPPETS = [
  { name: 'review', text: 'Rivedi le modifiche non ancora committate: bug, casi limite, sicurezza. Elenca i problemi per gravità con file:riga.' },
  { name: 'piano', text: 'Prima di scrivere codice proponi un piano in passi numerati, con i file che tocchi, e aspetta il mio via.' },
  { name: 'test', text: 'Scrivi o aggiorna i test per le modifiche di questa sessione ed eseguili. Riporta l’esito senza addolcirlo.' },
  { name: 'riprendi', text: 'Riassumi dove eravamo rimasti in questo progetto (diario e todo della plancia) e proponi il prossimo passo.' },
  { name: 'spiega', text: 'Spiegami questo codice come a un collega che non lo conosce: scopo, flusso, punti delicati.' },
]
