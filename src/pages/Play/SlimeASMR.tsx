import { useRef, useState } from 'react'
import { Droplets, Hand, Volume2, VolumeX } from 'lucide-react'

type Motion = 'rest' | 'squish' | 'stretch'

export default function SlimeASMR() {
  const [motion, setMotion] = useState<Motion>('rest')
  const [soundOn, setSoundOn] = useState(true)
  const [count, setCount] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  function play(kind: 'squish' | 'stretch') {
    setMotion(kind)
    setCount(value => value + 1)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMotion('rest'), 280)
    if (!soundOn) return
    try {
      const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      const ctx = new AC()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = kind === 'squish' ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(kind === 'squish' ? 190 : 330, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(kind === 'squish' ? 85 : 170, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 0.23)
      osc.onended = () => { void ctx.close() }
    } catch { /* o áudio é opcional */ }
  }

  return <div className="mini-game-card slime-card">
    <span className="mini-game-tag"><Droplets size={16} /> PAUSA SENSORIAL</span>
    <h2>Slime ASMR</h2>
    <p>Aperte, estique ou toque no slime fofinho. Os sons são curtinhos e suaves, e você pode desligá-los a qualquer momento.</p>
    <div className="slime-stage">
      <button type="button" className={'slime-blob' + (motion !== 'rest' ? ' ' + motion : '')} onClick={() => play('squish')} aria-label="Apertar o slime"><span aria-hidden="true">☺</span></button>
    </div>
    <div className="slime-controls">
      <button type="button" className="primary-button" onClick={() => play('squish')}><Hand size={17} /> Apertar</button>
      <button type="button" className="secondary-button" onClick={() => play('stretch')}><Droplets size={17} /> Esticar</button>
    </div>
    <label className="slime-toggle"><input type="checkbox" checked={soundOn} onChange={event => setSoundOn(event.target.checked)} />{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />} Sons ASMR {soundOn ? 'ativados' : 'desativados'}</label>
    <p className="slime-note" aria-live="polite">{count === 0 ? 'Toque no slime para começar.' : 'Toques no slime: ' + count + ' · continue no seu ritmo.'}</p>
  </div>
}
