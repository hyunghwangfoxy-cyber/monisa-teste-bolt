import { useMemo, useState } from 'react'
import { Blocks, RotateCcw, Trophy } from 'lucide-react'
type Cell = string | null
type Shape = { id:number; cells:[number,number][]; color:string }
const SIZE=8
const COLORS=['#8c78e8','#ed8da9','#69b9d2','#e6b85c','#83b99a','#d58ac7']
const SHAPES:[number,number][][]=[[[0,0],[0,1],[1,0],[1,1]],[[0,0],[0,1],[0,2]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2],[1,1]],[[0,0],[1,0],[2,0],[2,1]],[[0,0],[0,1],[1,1]],[[0,1],[1,0],[1,1]],[[0,0],[1,0],[1,1],[2,1]],[[0,1],[1,0],[1,1],[2,0]],[[0,0],[0,1],[0,2],[1,0]],[[0,0],[0,1],[1,0]],[[0,0],[1,0]],[[0,0],[0,1]]]
const BEST_KEY='monisa-play-color-block-best-v3'
function makePieces():Shape[]{return Array.from({length:3},(_,id)=>({id,cells:SHAPES[Math.floor(Math.random()*SHAPES.length)],color:COLORS[Math.floor(Math.random()*COLORS.length)]}))}
function fits(board:Cell[][],shape:Shape,row:number,col:number){return shape.cells.every(([y,x])=>row+y<SIZE&&col+x<SIZE&&!board[row+y][col+x])}
function anyMove(board:Cell[][],tray:Shape[]){return tray.some(shape=>Array.from({length:SIZE},(_,r)=>r).some(r=>Array.from({length:SIZE},(_,c)=>c).some(c=>fits(board,shape,r,c))))}
export default function ColorBlock(){
 const empty=useMemo(()=>Array.from({length:SIZE},()=>Array<Cell>(SIZE).fill(null)),[])
 const [board,setBoard]=useState<Cell[][]>(()=>empty.map(row=>[...row]))
 const [tray,setTray]=useState<Shape[]>(makePieces)
 const [selected,setSelected]=useState<number|null>(null)
 const [hover,setHover]=useState<[number,number]|null>(null)
 const [score,setScore]=useState(0)
 const [best,setBest]=useState(()=>{try{return Number(localStorage.getItem(BEST_KEY))||0}catch{return 0}})
 const [message,setMessage]=useState('Escolha uma peça e toque em uma posição do tabuleiro.')
 const selectedShape=tray.find(piece=>piece.id===selected)
 const previewValid=!!(selectedShape&&hover&&fits(board,selectedShape,hover[0],hover[1]))
 const previewCells=new Set<string>(previewValid&&selectedShape&&hover?selectedShape.cells.map(([y,x])=>(hover[0]+y)+'-'+(hover[1]+x)):[])
 const finished=!anyMove(board,tray)
 function place(row:number,col:number){
  if(selected===null||finished)return
  const shape=tray.find(piece=>piece.id===selected);if(!shape)return
  if(!fits(board,shape,row,col)){setMessage('Essa peça não cabe aí. Tente outro espaço.');return}
  const next=board.map(line=>[...line]);shape.cells.forEach(([y,x])=>{next[row+y][col+x]=shape.color})
  const rows=next.map((line,index)=>line.every(Boolean)?index:-1).filter(index=>index>=0)
  const cols=Array.from({length:SIZE},(_,col)=>col).filter(col=>next.every(line=>Boolean(line[col])))
  rows.forEach(r=>next[r].fill(null));cols.forEach(col=>next.forEach(line=>{line[col]=null}))
  const gained=shape.cells.length*10+(rows.length+cols.length)*SIZE*10;const total=score+gained
  const remaining=tray.filter(piece=>piece.id!==selected)
  setBoard(next);setScore(total);setTray(remaining.length?remaining:makePieces());setSelected(null);setHover(null)
  setMessage(gained>shape.cells.length*10?'Linha ou coluna completa! Bônus de pontos!':'Boa! Escolha a próxima peça.')
  if(total>best){setBest(total);try{localStorage.setItem(BEST_KEY,String(total))}catch{/* armazenamento opcional */}}
 }
 function restart(){setBoard(empty.map(row=>[...row]));setTray(makePieces());setSelected(null);setHover(null);setScore(0);setMessage('Escolha uma peça e toque em uma posição do tabuleiro.')}
 return <div className="mini-game-card color-block-card">
  <span className="mini-game-tag"><Blocks size={16}/> PUZZLE CLÁSSICO</span><h2>Color Block</h2>
  <p>Arrume as peças no tabuleiro, complete linhas e colunas e faça a maior pontuação possível.</p>
  <div className="color-block-stats"><span>Pontuação <strong>{score}</strong></span><span><Trophy size={15}/> Recorde <strong>{best}</strong></span></div>
  <div className="color-block-board" role="group" aria-label="Tabuleiro Color Block">
   {board.map((line,row)=>line.map((cell,col)=>{const key=row+'-'+col;const preview=previewCells.has(key);return <button key={key} type="button" className={'color-block-cell'+(preview?' preview':'')+(preview&&!previewValid?' invalid':'')} style={{'--cell-color':cell||'transparent','--preview-color':selectedShape?.color||'transparent'} as React.CSSProperties} onMouseEnter={()=>setHover([row,col])} onFocus={()=>setHover([row,col])} onClick={()=>place(row,col)} aria-label={cell?'Casa ocupada':'Linha '+(row+1)+', coluna '+(col+1)} disabled={finished||selected===null}/> }))}
  </div>
  <div className="color-block-tray" aria-label="Peças disponíveis">{tray.map(piece=><button type="button" key={piece.id} className={'color-block-piece'+(selected===piece.id?' selected':'')} onClick={()=>{setSelected(piece.id);setMessage('Agora toque no tabuleiro para encaixar a peça.')}} aria-pressed={selected===piece.id} aria-label={'Selecionar peça '+(piece.id+1)}><span className="piece-shape" style={{'--piece-color':piece.color} as React.CSSProperties}>{piece.cells.map(([row,col],i)=><i key={i} style={{gridRow:row+1,gridColumn:col+1}}/>)}</span></button>)}</div>
  <p className="color-block-message" role="status">{finished?'Fim de jogo! Não há mais espaço para as peças.':message}</p>
  <div className="mini-game-footer"><span>Complete uma linha ou coluna para liberar espaço.</span><button className="secondary-button" onClick={restart}><RotateCcw size={16}/> Novo jogo</button></div>
 </div>
}