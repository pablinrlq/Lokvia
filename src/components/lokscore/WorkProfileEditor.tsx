import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Clock, Headphones, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkProfile } from '@/lib/store'
import type { WorkPriority, WorkSchedule, WorkType, WorkProfile } from '@/types'

const TYPES: Array<{ value: WorkType; label: string; emoji: string }> = [
  { value: 'dev',        label: 'Dev',        emoji: '⌨️' },
  { value: 'designer',   label: 'Designer',   emoji: '🎨' },
  { value: 'writer',     label: 'Writer',     emoji: '✍️' },
  { value: 'founder',    label: 'Founder',    emoji: '🚀' },
  { value: 'consultant', label: 'Consultant', emoji: '💼' },
  { value: 'creator',    label: 'Creator',    emoji: '📸' },
]

const SCHEDULES: Array<{ value: WorkSchedule; label: string; hint: string }> = [
  { value: 'morning',  label: 'Manhãzeiro', hint: '6h–13h' },
  { value: 'business', label: 'Comercial',  hint: '9h–18h' },
  { value: 'flex',     label: 'Flexível',   hint: 'sem padrão' },
  { value: 'night',    label: 'Noturno',    hint: '20h–3h' },
]

const PRIORITIES: Array<{ value: WorkPriority; label: string }> = [
  { value: 'silence',       label: 'Silêncio' },
  { value: 'fast_wifi',     label: 'Wi-Fi rápido' },
  { value: 'natural_light', label: 'Luz natural' },
  { value: 'ergonomics',    label: 'Ergonomia' },
  { value: 'networking',    label: 'Networking' },
  { value: 'coffee',        label: 'Café especial' },
  { value: 'view',          label: 'Vista' },
  { value: 'kitchen',       label: 'Cozinha' },
  { value: 'pet_friendly',  label: 'Pet friendly' },
  { value: 'gym',           label: 'Academia' },
]

export function WorkProfileEditor({ onSaved }: { onSaved?: () => void }) {
  const stored = useWorkProfile((s) => s.profile)
  const setProfile = useWorkProfile((s) => s.setProfile)
  const [draft, setDraft] = useState<WorkProfile>(stored)

  function togglePriority(p: WorkPriority) {
    const has = draft.priorities.includes(p)
    if (has) return setDraft({ ...draft, priorities: draft.priorities.filter((x) => x !== p) })
    if (draft.priorities.length >= 4) return
    setDraft({ ...draft, priorities: [...draft.priorities, p] })
  }

  function save() {
    setProfile(draft)
    onSaved?.()
  }

  return (
    <div className="space-y-7">
      {/* Tipo */}
      <section>
        <Label icon={Briefcase}>Como você trabalha?</Label>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <Chip
              key={t.value}
              active={draft.type === t.value}
              onClick={() => setDraft({ ...draft, type: t.value })}
            >
              <span className="mr-1">{t.emoji}</span> {t.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* Horário */}
      <section>
        <Label icon={Clock}>Quando você produz mais?</Label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {SCHEDULES.map((s) => (
            <Chip
              key={s.value}
              active={draft.schedule === s.value}
              onClick={() => setDraft({ ...draft, schedule: s.value })}
            >
              <div className="flex flex-col items-start text-left">
                <span>{s.label}</span>
                <span className="text-[10px] text-ink-300 font-mono">{s.hint}</span>
              </div>
            </Chip>
          ))}
        </div>
      </section>

      {/* Prioridades */}
      <section>
        <Label icon={Headphones}>
          Suas prioridades <span className="text-ink-300 font-normal">(até 4)</span>
        </Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRIORITIES.map((p) => {
            const active = draft.priorities.includes(p.value)
            const disabled = !active && draft.priorities.length >= 4
            return (
              <Chip
                key={p.value}
                active={active}
                disabled={disabled}
                onClick={() => togglePriority(p.value)}
              >
                {p.label}
              </Chip>
            )
          })}
        </div>
      </section>

      {/* Calls + monitor */}
      <section className="grid grid-cols-2 gap-4">
        <div>
          <Label icon={Headphones}>Calls/dia</Label>
          <input
            type="number"
            min={0}
            max={20}
            value={draft.callsPerDay ?? 0}
            onChange={(e) => setDraft({ ...draft, callsPerDay: Number(e.target.value) })}
            className="input mt-2"
          />
        </div>
        <div>
          <Label icon={Monitor}>Precisa de monitor extra?</Label>
          <div className="mt-2 flex gap-2">
            <Chip active={draft.needsExternalMonitor === true} onClick={() => setDraft({ ...draft, needsExternalMonitor: true })}>
              Sim
            </Chip>
            <Chip active={draft.needsExternalMonitor === false} onClick={() => setDraft({ ...draft, needsExternalMonitor: false })}>
              Não
            </Chip>
          </div>
        </div>
      </section>

      <button onClick={save} className="btn-rust w-full">
        Salvar perfil e reordenar resultados
      </button>
    </div>
  )
}

function Label({ icon: Icon, children }: { icon: typeof Briefcase; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-ink-500">
      <Icon size={14} className="text-rust-400" />
      {children}
    </div>
  )
}

function Chip({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-rust-400 bg-rust-400 text-bone shadow-rust'
          : 'border-ink-500/12 bg-white text-ink-500 hover:border-rust-400/40 hover:bg-rust-50',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {children}
    </motion.button>
  )
}
