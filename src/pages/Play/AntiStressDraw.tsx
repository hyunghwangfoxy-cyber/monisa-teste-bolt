import { useState } from 'react'
import { Eraser, Pencil, RotateCcw } from 'lucide-react'

type Point = { x: number; y: number }
type Stroke = { color: string; width: number; points: Point[] }
const colors = [
  { name: 'Roxo', value: '#8b5cf6' }, { name: 'Rosa', value: '#ec4899' },
  { name: 'Azul', value: '#3b82f6' }, { name: 'Verde', value: '#10b981' },
  { name: 'Amarelo', value: '#eab308' }, { name: 'Laranja', value: '#f97316' },
  { name: 'Preto', value: '#252238' }, { name: 'Branco', value: '#ffffff' },
]
export default function AntiStressDraw() {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [current, setCurrent] = useState<Stroke | null>(null)
  const [color, setColor] = useState(colors[0].value)
  const [width, setWidth] = useState(5)
  const [erase, setErase] = useState(false)
  function point(event: React.PointerEvent<SVGSVGElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - rect.left) / rect.width * 700, y: (event.clientY - rect.top) / rect.height * 360 }
  }
  function begin(event: React.PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    setCurrent({ color: erase ? '#ffffff' : color, width: erase ? 24 : width, points: [point(event)] })
  }
  function draw(event: React.PointerEvent<SVGSVGElement>) {
    if (current) { const next = point(event); setCurrent(old => old ? { ...old, points: [...old.points, next] } : old) }
  }
  function finish() { if (current) setStrokes(old => [...old, current]); setCurrent(null) }
  function path(stroke: Stroke) { return stroke.points.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ') }
  return <div className="mini-game-card draw-card">
    <span className="mini-game-tag"><Pencil size={16} /> PAUSA CRIATIVA</span>
    <h2>Desenho antisstresse</h2>
    <p>Rabisque livremente, faça formas ou pinte sem objetivo. Escolha uma cor e desenhe com o mouse ou com o dedo.</p>
    <div className="draw-palette" role="group" aria-label="Paleta de cores">
      {colors.map(item => <button key={item.value} type="button" className={'draw-swatch' + (color === item.value && !erase ? ' selected' : '')} style={{ background: item.value }} onClick={() => { setColor(item.value); setErase(false) }} aria-label={item.name} aria-pressed={color === item.value && !erase} title={item.name} />)}
    </div>
    <div className="draw-tools">
      <label>Espessura <input type="range" min="2" max="16" value={width} onChange={e => setWidth(Number(e.target.value))} /></label>
      <button type="button" className={'secondary-button' + (erase ? ' tool-active' : '')} onClick={() => setErase(value => !value)}><Eraser size={16} /> {erase ? 'Pincel' : 'Borracha'}</button>
      <button type="button" className="secondary-button" onClick={() => { setStrokes([]); setCurrent(null) }}><RotateCcw size={16} /> Limpar</button>
    </div>
    <svg className="draw-canvas" viewBox="0 0 700 360" aria-label="Área para desenhar com mouse ou dedo" onPointerDown={begin} onPointerMove={draw} onPointerUp={finish} onPointerCancel={finish}>
      <rect width="700" height="360" rx="16" fill="#ffffff" />
      {strokes.map((stroke, i) => <path key={i} d={path(stroke)} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" />)}
      {current && <path d={path(current)} fill="none" stroke={current.color} strokeWidth={current.width} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
    <p className="draw-note">Não precisa ficar perfeito. É só um espaço seu para relaxar.</p>
  </div>
}
