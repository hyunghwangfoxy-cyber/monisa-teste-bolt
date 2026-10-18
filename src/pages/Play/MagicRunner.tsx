import { useEffect, useRef, useState } from 'react'
import { Gamepad2, RotateCcw, Zap } from 'lucide-react'

export default function MagicRunner() {
  const [running, setRunning] = useState(false)
  const [jumping, setJumping] = useState(false)
  const [over, setOver] = useState(false)
  const [score, setScore] = useState(0)
  const [obstacles, setObstacles] = useState([8, 13, 18])
  const jumpingRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setObstacles(previous => {
        const next = previous.map(position => position <= 0 ? 10 + Math.floor(Math.random() * 5) : position - 1)
        if (next.some(position => position === 2) && !jumpingRef.current) {
          setRunning(false)
          setOver(true)
        }
        return next
      })
      setScore(value => value + 1)
    }, 260)
    return () => window.clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (!jumping) return
    const timer = window.setTimeout(() => {
      setJumping(false)
      jumpingRef.current = false
    }, 650)
    return () => window.clearTimeout(timer)
  }, [jumping])

  function jump() {
    if (!running || jumpingRef.current) return
    jumpingRef.current = true
    setJumping(true)
  }
  function start() {
    setObstacles([8, 13, 18])
    setScore(0)
    setOver(false)
    setJumping(false)
    jumpingRef.current = false
    setRunning(true)
  }

  return <div className="mini-game-card runner-card">
    <span className="mini-game-tag"><Gamepad2 size={16} /> CORRIDA NO SEU RITMO</span>
    <h2>Corrida mágica</h2>
    <p>Ajude a exploradora a pular os cristais. Toque em “Pular!” ou use a barra de espaço. Se bater em um obstáculo, é só recomeçar.</p>
    <div className="runner-score">Estrelas coletadas: <strong>{Math.floor(score / 3)}</strong></div>
    <div className={'runner-world' + (running ? ' runner-playing' : '') + (over ? ' runner-ended' : '')} aria-label="Pista de corrida com obstáculos">
      <div className="runner-sky-stars" aria-hidden="true">✦　 ·　 ✧　　 ·　 ✦　　✧</div>
      <div className={'runner-player' + (jumping ? ' jumping' : '')} aria-label="Exploradora">🧑‍🚀</div>
      {obstacles.map((position, index) => <span key={index} className="runner-obstacle" style={{ left: (position * 10) + '%' }} aria-label="Obstáculo">💎</span>)}
      <div className="runner-ground"><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span><span>✧</span></div>
    </div>
    {over && <p className="game-celebration" role="status">Encontramos um cristal! Você conseguiu {Math.floor(score / 3)} estrelas. Vamos tentar outra vez?</p>}
    <div className="runner-controls"><button className="primary-button" onClick={running ? jump : start}>{running ? <><Zap size={17} /> Pular!</> : <><RotateCcw size={17} /> {over ? 'Tentar novamente' : 'Começar a correr'}</>}</button>{running && <button className="secondary-button" onClick={() => setRunning(false)}>Pausar</button>}</div>
    <p className="play-hint">Pule um pouquinho antes de o cristal chegar à exploradora. Você pode pausar quando quiser.</p>
  </div>
}
