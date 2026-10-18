import { useRef, useState } from 'react'
import { Droplets, Volume2, VolumeX, Palette } from 'lucide-react'

type Motion = 'rest' | 'squish' | 'stretch'
const slimeColors = [
  { name: 'Lilás', value: '#b28bea' }, { name: 'Rosa', value: '#f28ebc' },
  { name: 'Azul', value: '#77b8f4' }, { name: 'Verde', value: '#83d7b0' },
  { name: 'Amarelo', value: '#f4d66f' }, { name: 'Laranja', value: '#f4a66d' },
]

export default function SlimeASMR() {
  const [motion, setMotion] = useState<Motion>('rest')
  const [soundOn, setSoundOn] = useState(true)
  const [count, setCount] = useState(0)
  const [color, setColor] = useState(slimeColors[0].value)
  const [dragging, setDragging] = useState(false)
  const [stretchX, setStretchX] = useState(1)
  const [stretchY, setStretchY] = useState(1)
  const start = useRef<{ x: number; y: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  function play(kind: 'squish' | 'stretch') {
    setMotion(kind); setCount(value => value + 1)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => { setMotion('rest'); setStretchX(1); setStretchY(1) }, 300)
    if (!soundOn) return
    try {
      const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      const ctx = new AC(), osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.type = kind === 'squish' ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(kind === 'squish' ? 190 : 330, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(kind === 'squish' ? 85 : 170, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22)
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.23)
      osc.onended = () => { void ctx.close() }
    } catch { /* áudio opcional */ }
  }
  function startStretch(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
    start.current = { x: event.clientX, y: event.clientY }; setDragging(true); setMotion('stretch')
  }
  function moveStretch(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging || !start.current) return
    const dx = event.clientX - start.current.x, dy = event.clientY - start.current.y
    setStretchX(Math.max(0.72, Math.min(1.75, 1 + Math.abs(dx) / 115)))
    setStretchY(Math.max(0.72, Math.min(1.65, 1 + Math.abs(dy) / 125)))
  }
  function endStretch(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return
    const dx = start.current ? event.clientX - start.current.x : 0
    const dy = start.current ? event.clientY - start.current.y : 0
    setDragging(false); start.current = null
    play(Math.abs(dx) + Math.abs(dy) > 12 ? 'stretch' : 'squish')
  }
  return <div className="mini-game-card slime-card">
    <span className="mini-game-tag"><Droplets size={16} /> PAUSA SENSORIAL</span>
    <h2>Slime ASMR</h2>
    <p>Segure o slime com o mouse ou dedo e arraste para qualquer direção para esticar. Solte para ele voltar à forma original.</p>
    <div className="slime-stage">
      <button type="button" className={'slime-blob' + (motion !== 'rest' ? ' ' + motion : '')}
        style={{ background: 'radial-gradient(circle at 32% 25%, color-mix(in srgb, ' + color + ' 35%, white) 0%, ' + color + ' 57%, color-mix(in srgb, ' + color + ' 65%, #35234f) 100%)', transform: dragging ? 'scale(' + stretchX + ', ' + stretchY + ')' : undefined }}
        onPointerDown={startStretch} onPointerMove={moveStretch} onPointerUp={endStretch} onPointerCancel={endStretch}
        aria-label="Segure e arraste para esticar o slime"><span aria-hidden="true">☺</span></button>
    </div>
    <div className="slime-palette"><span><Palette size={16} /> Escolha a cor do slime</span>
      <div className="slime-swatches" role="group" aria-label="Paleta de cores do slime">
        {slimeColors.map(item => <button key={item.value} type="button" className={'slime-swatch' + (color === item.value ? ' selected' : '')}
          style={{ background: item.value }} onClick={() => setColor(item.value)} aria-label={item.name} aria-pressed={color === item.value} title={item.name} />)}
      </div>
    </div>
    <label className="slime-toggle"><input type="checkbox" checked={soundOn} onChange={event => setSoundOn(event.target.checked)} />{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />} Sons ASMR {soundOn ? 'ativados' : 'desativados'}</label>
    <p className="slime-note" aria-live="polite">{count === 0 ? 'Experimente segurar e arrastar o slime.' : 'Interações: ' + count + ' · continue no seu ritmo.'}</p>
  </div>
}
