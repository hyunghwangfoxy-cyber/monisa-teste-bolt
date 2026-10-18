import { useMemo, useState } from 'react'
import { Brain, RotateCcw, Sparkles, Trophy } from 'lucide-react'
import './Play.css'

const symbols = ['🌙', '🌿', '⭐', '🎧', '🪐', '💜']

function makeDeck() {
  return [...symbols, ...symbols].map((symbol, index) => ({ id: index, symbol })).sort(() => Math.random() - 0.5)
}

export default function Play() {
  const [deck, setDeck] = useState(makeDeck)
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [hint, setHint] = useState(false)
  const complete = matched.length === deck.length

  function choose(id: number) {
    if (open.includes(id) || matched.includes(id) || open.length >= 2) return
    const next = [...open, id]
    setOpen(next)
    if (next.length === 2) {
      setMoves(value => value + 1)
      const first = deck.find(card => card.id === next[0])
      const second = deck.find(card => card.id === next[1])
      if (first?.symbol === second?.symbol) {
        setMatched(old => [...old, ...next])
        setOpen([])
      } else {
        window.setTimeout(() => setOpen(current => current.length === 2 && current[0] === next[0] && current[1] === next[1] ? [] : current), 850)
      }
    }
  }

  function restart() { setDeck(makeDeck()); setOpen([]); setMatched([]); setMoves(0); setHint(false) }
  const progress = useMemo(() => Math.round((matched.length / deck.length) * 100), [matched.length, deck.length])

  return <section className="play-page" aria-labelledby="play-title">
    <header className="play-heading"><span className="play-icon"><Brain size={27} /></span><div><span className="eyebrow">MONISA PLAY · PAUSAS QUE ENSINAM</span><h1 id="play-title">Um desafio no seu ritmo</h1><p>Encontre os pares. Sem cronômetro, sem pressão — você pode tentar quantas vezes quiser.</p></div></header>
    <div className="play-stats"><div><span>Movimentos</span><strong>{moves}</strong></div><div><span>Pares encontrados</span><strong>{matched.length / 2} de {symbols.length}</strong></div><div className="play-progress"><span>Progresso</span><strong>{progress}%</strong><div className="play-progress-track"><span style={{ width: progress + '%' }} /></div></div></div>
    {complete ? <div className="play-complete" role="status"><Trophy size={34} /><h2>Você conseguiu! ✨</h2><p>Seu progresso é seu. Cada tentativa ajudou você a chegar até aqui.</p><button className="primary-button" onClick={restart}><RotateCcw size={17} /> Jogar novamente</button></div> : <>
      <div className="memory-grid" aria-label="Jogo da memória">
        {deck.map(card => { const revealed = open.includes(card.id) || matched.includes(card.id); return <button type="button" key={card.id} className={'memory-card' + (revealed ? ' revealed' : '') + (matched.includes(card.id) ? ' matched' : '')} onClick={() => choose(card.id)} aria-label={revealed ? (matched.includes(card.id) ? 'Par encontrado: ' : 'Carta: ') + card.symbol : 'Revelar carta'} aria-pressed={revealed} disabled={matched.includes(card.id)}>{revealed ? <span>{card.symbol}</span> : <span aria-hidden="true"><Sparkles size={23} /></span>}</button> })}
      </div>
      <div className="play-actions"><button className="secondary-button" onClick={() => setHint(value => !value)} aria-expanded={hint}>{hint ? 'Esconder dica' : 'Preciso de uma dica'}</button><button className="secondary-button" onClick={restart}><RotateCcw size={16} /> Recomeçar</button></div>
      {hint && <p className="play-hint" role="status">Dica: revele duas cartas por vez e tente guardar a posição dos símbolos. Não precisa correr; observe no seu próprio ritmo.</p>}
    </>}
    <aside className="play-access"><Sparkles size={18} /><div><strong>Seu jeito também funciona.</strong><p>Este jogo não tem limite de tempo, e errar faz parte da atividade. Faça uma pausa quando quiser.</p></div></aside>
  </section>
}
