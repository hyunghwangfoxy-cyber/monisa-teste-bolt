import { useEffect, useMemo, useState } from 'react'
import { Brain, RotateCcw, Sparkles, Trophy, Wind, Blocks, Flower2, Heart, Gamepad2, Droplets, Pencil } from 'lucide-react'
import './Play.css'
import MagicRunner from './MagicRunner'
import SlimeASMR from './SlimeASMR'
import AntiStressDraw from './AntiStressDraw'

const symbols = ['🌙', '🌿', '⭐', '🎧', '🪐', '💜']
type Game = 'memory' | 'blocks' | 'breathe' | 'garden' | 'runner' | 'slime' | 'draw'

function makeDeck() {
  return [...symbols, ...symbols].map((symbol, index) => ({ id: index, symbol })).sort(() => Math.random() - 0.5)
}
const gardenSymbols = ['🌼', '🌷', '🌻', '🌸', '🍀', '🪻']
function makeGarden(target: string) {
  const distractors = gardenSymbols.filter(symbol => symbol !== target)
  return Array.from({ length: 12 }, (_, index) => ({ id: index, symbol: index < 4 ? target : distractors[Math.floor(Math.random() * distractors.length)] }))
    .sort(() => Math.random() - 0.5)
}

export default function Play() {
  const [game, setGame] = useState<Game>('memory')
  const [deck, setDeck] = useState(makeDeck)
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [hint, setHint] = useState(false)
  const [blocks, setBlocks] = useState(() => Array.from({ length: 20 }, (_, id) => id))
  const [broken, setBroken] = useState<number[]>([])
  const [breathing, setBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in')
  const [target, setTarget] = useState(() => gardenSymbols[Math.floor(Math.random() * gardenSymbols.length)])
  const [garden, setGarden] = useState(() => makeGarden(gardenSymbols[0]))
  const [flowers, setFlowers] = useState(0)
  const complete = matched.length === deck.length

  useEffect(() => {
    if (!breathing) return
    const interval = window.setInterval(() => setBreathPhase(phase => phase === 'in' ? 'out' : 'in'), 4000)
    return () => window.clearInterval(interval)
  }, [breathing])

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

  function restartMemory() { setDeck(makeDeck()); setOpen([]); setMatched([]); setMoves(0); setHint(false) }
  function restartBlocks() { setBlocks(Array.from({ length: 20 }, (_, id) => id)); setBroken([]) }
  function playBlockSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(420, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.09)
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12)
      oscillator.connect(gain); gain.connect(context.destination)
      oscillator.start(); oscillator.stop(context.currentTime + 0.13)
      oscillator.onended = () => { void context.close() }
    } catch { /* áudio opcional */ }
  }
  function newGarden() {
    const nextTarget = gardenSymbols[Math.floor(Math.random() * gardenSymbols.length)]
    setTarget(nextTarget)
    setGarden(makeGarden(nextTarget))
  }
  const progress = useMemo(() => Math.round((matched.length / deck.length) * 100), [matched.length, deck.length])

  return <section className="play-page" aria-labelledby="play-title">
    <header className="play-heading"><span className="play-icon"><Brain size={27} /></span><div><span className="eyebrow">MONISA PLAY · PAUSAS QUE ENSINAM</span><h1 id="play-title">Um desafio no seu ritmo</h1><p>Escolha uma brincadeira. Sem cronômetro, sem pressão e com espaço para recomeçar sempre que quiser.</p></div></header>
    <nav className="game-picker" aria-label="Escolha um minijogo">
      <button type="button" className={game === 'memory' ? 'active' : ''} onClick={() => setGame('memory')}><Brain size={18} />Jogo da memória</button>
      <button type="button" className={game === 'blocks' ? 'active' : ''} onClick={() => setGame('blocks')}><Blocks size={18} />Quebra-blocos</button>
      <button type="button" className={game === 'breathe' ? 'active' : ''} onClick={() => setGame('breathe')}><Wind size={18} />Respira comigo</button>
      <button type="button" className={game === 'garden' ? 'active' : ''} onClick={() => setGame('garden')}><Flower2 size={18} />Jardim do foco</button>
      <button type="button" className={game === 'runner' ? 'active' : ''} onClick={() => setGame('runner')}><Gamepad2 size={18} />Corrida mágica</button>
      <button type="button" className={game === 'slime' ? 'active' : ''} onClick={() => setGame('slime')}><Droplets size={18} />Slime ASMR</button>
      <button type="button" className={game === 'draw' ? 'active' : ''} onClick={() => setGame('draw')}><Pencil size={18} />Desenho antisstresse</button>
    </nav>

    {game === 'memory' && <>
      <div className="play-game-intro"><h2>Encontre os pares</h2><p>Vire duas cartas por vez e tente encontrar os símbolos iguais.</p></div>
      <div className="play-stats"><div><span>Movimentos</span><strong>{moves}</strong></div><div><span>Pares encontrados</span><strong>{matched.length / 2} de {symbols.length}</strong></div><div className="play-progress"><span>Progresso</span><strong>{progress}%</strong><div className="play-progress-track"><span style={{ width: progress + '%' }} /></div></div></div>
      {complete ? <div className="play-complete" role="status"><Trophy size={34} /><h2>Você conseguiu! ✨</h2><p>Seu progresso é seu. Cada tentativa ajudou você a chegar até aqui.</p><button className="primary-button" onClick={restartMemory}><RotateCcw size={17} /> Jogar novamente</button></div> : <>
        <div className="memory-grid" aria-label="Jogo da memória">
          {deck.map(card => { const revealed = open.includes(card.id) || matched.includes(card.id); return <button type="button" key={card.id} className={'memory-card' + (revealed ? ' revealed' : '') + (matched.includes(card.id) ? ' matched' : '')} onClick={() => choose(card.id)} aria-label={revealed ? (matched.includes(card.id) ? 'Par encontrado: ' : 'Carta: ') + card.symbol : 'Revelar carta'} aria-pressed={revealed} disabled={matched.includes(card.id)}>{revealed ? <span>{card.symbol}</span> : <span aria-hidden="true"><Sparkles size={23} /></span>}</button> })}
        </div>
        <div className="play-actions"><button className="secondary-button" onClick={() => setHint(value => !value)} aria-expanded={hint}>{hint ? 'Esconder dica' : 'Preciso de uma dica'}</button><button className="secondary-button" onClick={restartMemory}><RotateCcw size={16} /> Recomeçar</button></div>
        {hint && <p className="play-hint" role="status">Dica: revele duas cartas por vez e tente guardar a posição dos símbolos. Não precisa correr; observe no seu próprio ritmo.</p>}
      </>}
    </>}

    {game === 'blocks' && <div className="mini-game-card">
      <div className="mini-game-copy"><span className="mini-game-tag"><Blocks size={16} /> FASE LIVRE</span><h2>Quebra-blocos mágicos</h2><p>Como num jogo de plataforma, sua missão é limpar o caminho. Toque nos blocos para quebrá-los e ouvir um som suave. Não há vidas nem limite de tempo.</p></div>
      <div className="block-scene" aria-label="Cenário de blocos mágicos">
        <div className="block-sky"><span className="block-cloud">☁️</span><span className="block-hero" aria-label="Personagem">🧑‍🚀</span></div>
        <div className="break-block-grid">
          {blocks.map(id => <button key={id} type="button" className={'break-block' + (broken.includes(id) ? ' broken' : '')} onClick={() => { if (!broken.includes(id)) { setBroken(old => [...old, id]); playBlockSound() } }} aria-label={broken.includes(id) ? 'Bloco quebrado, estrela revelada' : 'Quebrar bloco ' + (id + 1)} disabled={broken.includes(id)}><span className="block-symbol">{broken.includes(id) ? '⭐' : '✦'}</span></button>)}
        </div>
        <div className="block-ground" />
      </div>
      <div className="mini-game-footer"><span><strong>{broken.length}</strong> de {blocks.length} blocos quebrados</span><button className="secondary-button" onClick={restartBlocks}><RotateCcw size={16} /> Recomeçar fase</button></div>
      {broken.length === blocks.length && <p className="game-celebration" role="status">Caminho livre! Você encontrou todas as estrelas. ✨</p>}
    </div>}

    {game === 'runner' && <MagicRunner />}

    {game === 'slime' && <SlimeASMR />}

    {game === 'draw' && <AntiStressDraw />}

    {game === 'breathe' && <div className="mini-game-card breathe-card">
      <span className="mini-game-tag"><Heart size={16} /> PAUSA OPCIONAL</span><h2>Respira comigo</h2><p>Se quiser, acompanhe o círculo: inspire suavemente quando ele crescer e solte o ar quando ele diminuir. Não precisa prender a respiração. Você pode parar a qualquer momento ou simplesmente observar.</p>
      <div className={'breath-visual' + (breathing ? ' is-active ' + breathPhase : '')} role="img" aria-label={breathing ? breathPhase === 'in' ? 'Círculo crescendo: inspire suavemente se for confortável' : 'Círculo diminuindo: solte o ar se for confortável' : 'Círculo de respiração em repouso'}><div><Wind size={32} /><strong>{!breathing ? 'No seu ritmo' : breathPhase === 'in' ? 'Inspire' : 'Solte o ar'}</strong><span>{breathing ? 'Sem forçar' : 'Quando quiser, comece'}</span></div></div>
      <div className="breath-controls"><button className="primary-button" onClick={() => { setBreathing(value => !value); setBreathPhase('in') }}>{breathing ? 'Encerrar a pausa' : 'Começar a pausa'}</button></div>
      <p className="play-hint">Esta é apenas uma pausa guiada opcional, não um tratamento. Se focar na respiração for desconfortável, pare e escolha outro jogo.</p>
    </div>}

    {game === 'garden' && <div className="mini-game-card">
      <span className="mini-game-tag"><Flower2 size={16} /> ATENÇÃO SEM PRESSA</span><h2>Jardim do foco</h2><p>Encontre no jardim todas as flores iguais à flor-modelo. Cada acerto faz seu jardim crescer. Não há punição por tocar em outra flor.</p>
      <div className="garden-target"><span>Encontre esta flor</span><strong>{target}</strong><span>Flores cuidadas: {flowers}</span></div>
      <div className="garden-grid" aria-label="Jardim de flores">
        {garden.map(item => <button type="button" key={item.id} className="garden-flower" onClick={() => { if (item.symbol === target) { setFlowers(value => value + 1); setGarden(old => old.map(flower => flower.id === item.id ? { ...flower, symbol: '✨' } : flower)) } }} disabled={item.symbol === '✨'} aria-label={item.symbol === '✨' ? 'Flor já encontrada' : 'Flor ' + item.symbol}>{item.symbol}</button>)}
      </div>
      <div className="mini-game-footer"><span>Escolha uma flor de cada vez.</span><button className="secondary-button" onClick={newGarden}><Sparkles size={16} /> Novo jardim</button></div>
    </div>}

    <aside className="play-access"><Sparkles size={18} /><div><strong>Seu jeito também funciona.</strong><p>Os jogos não têm limite de tempo, e errar faz parte da atividade. Faça uma pausa quando quiser. Eles são atividades de apoio e não substituem acompanhamento profissional.</p></div></aside>
  </section>
}
