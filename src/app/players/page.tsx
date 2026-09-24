'use client'
import { useState } from 'react'
import type { Player } from '@/types'
import { usePlayers } from '@/hooks/usePlayers'

function PlayerRow({
  player,
  onUpdate,
  onDelete,
}: {
  player: Player
  onUpdate: (patch: Partial<Omit<Player, 'id'>>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [num, setNum] = useState(String(player.number))
  const [name, setName] = useState(player.name)

  function save() {
    const n = parseInt(num)
    if (!name.trim() || isNaN(n)) return
    onUpdate({ number: n, name: name.trim() })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-violet-800/80 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            className="w-14 bg-violet-600 rounded-lg px-2 py-1.5 text-white text-sm font-bold text-center outline-none"
            value={num}
            onChange={e => setNum(e.target.value)}
            placeholder="#"
            type="number"
            min={1}
            max={99}
          />
          <input
            className="flex-1 bg-violet-600 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="名前"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') save() }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex-1 bg-violet-500 text-white rounded-lg py-1.5 text-sm font-bold"
          >
            保存
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex-1 bg-violet-600 text-violet-300 rounded-lg py-1.5 text-sm"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-violet-800/70 rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-black text-base text-white shrink-0">
        {player.number}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-base truncate">{player.name}</div>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="text-violet-400 p-1.5 rounded-lg hover:bg-violet-600 active:bg-violet-600"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button
        onClick={() => {
          if (confirm(`${player.name} を削除しますか？`)) onDelete()
        }}
        className="text-rose-500 p-1.5 rounded-lg hover:bg-rose-900/30 active:bg-rose-900/50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  )
}

function AddPlayerForm({ onAdd }: { onAdd: (n: number, name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [num, setNum] = useState('')
  const [name, setName] = useState('')

  function submit() {
    const n = parseInt(num)
    if (!name.trim() || isNaN(n)) return
    onAdd(n, name.trim())
    setNum('')
    setName('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-violet-700 rounded-xl py-3 text-violet-400 font-semibold text-sm flex items-center justify-center gap-2 active:bg-violet-900/30"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        選手を追加
      </button>
    )
  }

  return (
    <div className="bg-violet-800/80 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className="w-14 bg-violet-600 rounded-lg px-2 py-2 text-white text-sm font-bold text-center outline-none"
          value={num}
          onChange={e => setNum(e.target.value)}
          placeholder="#"
          type="number"
          min={1}
          max={99}
          autoFocus
        />
        <input
          className="flex-1 bg-violet-600 rounded-lg px-3 py-2 text-white text-sm outline-none"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="選手名"
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 bg-violet-500 text-white rounded-lg py-2 text-sm font-bold active:bg-violet-500"
        >
          追加
        </button>
        <button
          onClick={() => setOpen(false)}
          className="flex-1 bg-violet-600 text-violet-300 rounded-lg py-2 text-sm"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

export default function PlayersPage() {
  const { players, isLoaded, addPlayer, updatePlayer, deletePlayer } = usePlayers()

  const sorted = [...players].sort((a, b) => a.number - b.number)

  return (
    <div>
      <div className="bg-violet-600 px-4 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">選手管理</h1>
        <span className="text-sm text-violet-200">{isLoaded ? `${players.length}人登録中` : ''}</span>
      </div>
      {isLoaded && (
        <div className="px-3 pt-4 pb-4">
          <div className="flex flex-col gap-2 mb-4">
            {sorted.length === 0 && (
              <p className="text-violet-500 text-sm text-center py-8">
                選手が登録されていません
              </p>
            )}
            {sorted.map(p => (
              <PlayerRow
                key={p.id}
                player={p}
                onUpdate={patch => updatePlayer(p.id, patch)}
                onDelete={() => deletePlayer(p.id)}
              />
            ))}
          </div>
          <AddPlayerForm onAdd={addPlayer} />
        </div>
      )}
    </div>
  )
}
