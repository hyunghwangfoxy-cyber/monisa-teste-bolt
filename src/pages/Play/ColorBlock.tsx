import { useMemo, useState } from 'react'
import { Blocks, RotateCcw, Trophy } from 'lucide-react'

type Cell = string | null
type Shape = { id: number; cells: [number, number][]; color: string }
const SIZE = 8
const COLORS = ['#8c78e8', '#ed8da9', '#69b9d2', '#e6b85c', '#83b99a', '#d58ac7']
const SHAPES: [number, number][][] = [
  [[0,0]], [[0,0],[0,1]], [[0,0],[1,0]], [[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0]], [[0,0],[0,1],[1,0]], [[0,0],[0,1],[1,1]],
  [[0,0],[1,0],[1,1]], [[0,1],[1,0],[1,1]], [[0,0],[0,1],[1,0],[1,1]],
  [[0,0],[0,1],[0,2],[1,1]], [[0,0],[1,0],[2,0],[2,1]]
]
const BEST_KEY = 'monisa-play-color-block-best-v2'
function createPieces(): Shape[] {
  return Array.from({length:3}, (_, id) => ({ id, cells: SHAPES[Math.floor(Math.random()*SHAPES.length)], color: COLORS[Math.floor(Math.random()*COLORS.length)] }))
}
function fits(board: Cell[][], shape: Shape, row: number, col: number) {
  return shape.cells.every(([y,x]) => row+y < SIZE && col+x < SIZE && !board[row+y][col+x])
}
export default function ColorBlock() {
  const empty = useMemo(() => Array.from({length:SIZE},()=>Array<Cell>(SIZE).fill(null)), [])
  const [board,setBoard] = useState<Cell[][]>(()=>empty.map(row=>[...row]))
  const [tray,setTray] = useState<Shape[]>(createPieces)
  const [selected,setSelected] = useState<number|null>(null)
  const [score,setScore] = useState(0)
  const [best,setBest] = useState(()=>{try{return Number(localStorage.getItem(BEST_KEY))||0}catch{return 0}})
  const [ended,setEnded] = useState(false)
  const canPlay = tray.some(shape => Array.from({length:SIZE},(_,r)=>r).some(r=>Array.from({length:SIZE},(_,col)=>col).some(col=>fits(board,shape,r,col))))
  function place(row:number,col:number) {
    if(ended || selected===null) return
    const shape=tray.find(item=>item.id===selected)
    if(!shape || !fits(board,shape,row,col)) return
    const next=board.map(line=>[...line])
    shape.cells.forEach(([y,x])=>{next[row+y][col+x]=shape.color})
    const rows=next.map((line,index)=>line.every(Boolean)?index:-1).filter(index=>index>=0)
    const cols=Array.from({length:SIZE},(_,col)=>col).filter(col=>next.every(line=>Boolean(line[col])))
    rows.forEach(r=>next[r].fill(null))
    cols.forEach(col=>next.forEach(line=>{line[col]=null}))
    const total=score+shape.cells.length*10+(rows.length+cols.length)*SIZE*10
    setBoard(next);setScore(total)
    const rest=tray.filter(item=>item.id!==selected)
    setTray(rest.length?rest:createPieces())
    setSelected(null)
    if(total>best){setBest(total);try{localStorage.setItem(BEST_KEY,String(total))}catch{/* armazenamento opcional */}}
  }
  function restart(){setBoard(empty.map(row=>[...row]));setTray(createPieces());setSelected(null);setScore(0);setEnded(false)}
  const finished=ended || !canPlay
  return <div className="mini-game-card color-block-card">
    <span className="mini-game-tag"><Blocks size={16}/> PUZZLE CLÁSSICO</span>
    <h2>Color Block</h2>
    <p>Escolha uma peça e encaixe no tabuleiro. Complete linhas ou colunas para abrir espaço e somar pontos.</p>
    <div className="color-block-stats"><span>Pontos <strong>{score}</strong></span><span><Trophy size={15}/> Recorde <strong>{best}</strong></span></div>
    <div className="color-block-board" role="group" aria-label="Tabuleiro Color Block">
      {board.map((line,row)=>line.map((cell,col)=><button key={row+'-'+col} type="button" className="color-block-cell" style={{'--cell-color':cell||'transparent'} as React.CSSProperties} onClick={()=>place(row,col)} aria-label={cell?'Casa ocupada':'Casa vazia'} disabled={finished || selected === null}/ >))}
    </div>
    <div className="color-block-tray" aria-label="Peças disponíveis">
      {tray.map(shape=><button type="button" key={shape.id} className={`color-block-piece${selected===shape.id?' selected':''}`} onClick={()=>setSelected(shape.id)} aria-pressed={selected===shape.id}>
        <span className="piece-shape" style={{'--piece-color':shape.color} as React.CSSProperties}>{shape.cells.map(([row,col],i)=><i key={i} style={{gridRow:row+1,gridColumn:col+1}}/>)}</span>
      </button>)}
    </div>
    {finished && <p className="game-celebration" role="status">Fim de jogo! Você fez {score} pontos. Seu recorde foi preservado.</p>}
    <div className="mini-game-footer"><span>Selecione uma peça e toque onde deseja encaixá-la.</span><button className="secondary-button" onClick={restart}><RotateCcw size={16}/> Recomeçar</button></div>
  </div>
}
