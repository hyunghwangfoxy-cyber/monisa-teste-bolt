import { useCallback, useEffect, useRef, useState } from 'react'
import { Gamepad2, RotateCcw, ArrowUp, ArrowDown, Trophy } from 'lucide-react'

type Obstacle = { id:number; x:number; kind:'ground'|'air' }
const BEST_KEY='monisa-play-runner-best-v2'
const STAGES=[
  {name:'Fase 1 · Amanhecer',className:'runner-stage-one'},
  {name:'Fase 2 · Céu violeta',className:'runner-stage-two'},
  {name:'Fase 3 · Noite cósmica',className:'runner-stage-three'}
]
export default function MagicRunner(){
  const [running,setRunning]=useState(false)
  const [over,setOver]=useState(false)
  const [score,setScore]=useState(0)
  const [best,setBest]=useState(()=>{try{return Number(localStorage.getItem(BEST_KEY))||0}catch{return 0}})
  const [stage,setStage]=useState(0)
 const [ducking,setDucking]=useState(false)
  const [jumping,setJumping]=useState(false)
  const [obstacles,setObstacles]=useState<Obstacle[]>([])
  const world=useRef<HTMLDivElement>(null)
  const player=useRef<HTMLDivElement>(null)
  const obstacleNodes=useRef<Map<number,HTMLSpanElement>>(new Map())
  const obstacleData=useRef<Obstacle[]>([])
  const runningRef=useRef(false)
  const y=useRef(0)
  const velocity=useRef(0)
  const points=useRef(0)
  const displayedScore=useRef(0)
  const speed=useRef(300)
  const duck=useRef(false)
  const last=useRef(0)
  const spawn=useRef(.8)
  const nextId=useRef(1)
  const raf=useRef(0)

  const finish=useCallback(()=>{
    runningRef.current=false
    setRunning(false);setOver(true)
    const result=Math.floor(points.current)
    setScore(result)
    setBest(old=>{const value=Math.max(old,result);try{localStorage.setItem(BEST_KEY,String(value))}catch{/* armazenamento opcional */}return value})
  },[])
  const jump=useCallback(()=>{
    if(!runningRef.current||y.current>0||duck.current)return
    velocity.current=690;setJumping(true)
  },[])
  const setDuck=(value:boolean)=>{duck.current=value;setDucking(value)}
  const start=useCallback(()=>{
    cancelAnimationFrame(raf.current)
    runningRef.current=true;y.current=0;velocity.current=0;points.current=0;speed.current=300
    obstacleData.current=[];last.current=0;spawn.current=.8;nextId.current=1;displayedScore.current=0
    setObstacles([]);setScore(0);setStage(0);setOver(false);setJumping(false);setDuck(false);setRunning(true)
  },[])
  useEffect(()=>{
    if(!running)return
    const loop=(time:number)=>{
      if(!runningRef.current)return
      const dt=Math.min((time-(last.current||time))/1000,.032);last.current=time
      points.current+=dt*14
      const scoreNow=Math.floor(points.current)
      if(scoreNow-displayedScore.current>=3){displayedScore.current=scoreNow;setScore(scoreNow)}
      const phase=scoreNow>=900?2:scoreNow>=400?1:0
      setStage(phase)
      speed.current=300+phase*70+Math.min(scoreNow*.04,100)
      if(y.current>0||velocity.current>0){
        velocity.current-=1800*dt;y.current=Math.max(0,y.current+velocity.current*dt)
        if(y.current===0){velocity.current=0;setJumping(false)}
      }
      spawn.current-=dt
      if(spawn.current<=0){
        const item:Obstacle={id:nextId.current++,x:(world.current?.clientWidth||700)+35,kind:Math.random()<(phase===0?.3:phase===1?.43:.55)?'air':'ground'}
        obstacleData.current=[...obstacleData.current,item];setObstacles([...obstacleData.current])
        spawn.current=Math.max(.68,1.5-phase*.2+Math.random()*.55)
      }
      const width=world.current?.clientWidth||700
      obstacleData.current=obstacleData.current.map(item=>({...item,x:item.x-speed.current*dt})).filter(item=>item.x>-55)
      const px=width<500?58:82
      const playerHeight=duck.current?22:43
      for(const item of obstacleData.current){
        const ox=item.x
        const bottom=item.kind==='ground'?0:35
        const height=item.kind==='ground'?34:23
        const hitX=ox<px+35&&ox+(item.kind==='air'?38:30)>px+5
        const hitY=y.current<bottom+height&&y.current+playerHeight>bottom
        if(hitX&&hitY){finish();return}
      }
      for(const item of obstacleData.current){
        const node=obstacleNodes.current.get(item.id)
        if(node){node.style.transform=`translateX(${item.x-width}px)`;node.style.bottom=item.kind==='ground'?'24px':'59px'}
      }
      if(player.current)player.current.style.transform=`translateY(-${y.current}px)`
      setObstacles(current=>current.length===obstacleData.current.length?current:obstacleData.current)
      raf.current=requestAnimationFrame(loop)
    }
    raf.current=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(raf.current)
  },[running,finish])
  useEffect(()=>{
    const down=(event:KeyboardEvent)=>{
      if(['Space','ArrowUp','KeyW'].includes(event.code)){event.preventDefault();if(!runningRef.current)start();else jump()}
      if(['ArrowDown','KeyS'].includes(event.code)){event.preventDefault();setDuck(true)}
    }
    const up=(event:KeyboardEvent)=>{if(['ArrowDown','KeyS'].includes(event.code))setDuck(false)}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[start,jump])
  const current=STAGES[stage]
  return <div className="mini-game-card runner-card">
    <span className="mini-game-tag"><Gamepad2 size={16}/> CORRIDA NO SEU RITMO</span>
    <h2>Corrida mágica</h2>
    <p>Uma corrida infinita no estilo clássico: pule os obstáculos no chão e abaixe para passar por aqueles que vêm pelo ar.</p>
    <div className="runner-score-row"><span>Pontos <strong>{score}</strong></span><span><Trophy size={15}/> Recorde <strong>{best}</strong></span><span className="runner-stage-label">{current.name}</span></div>
    <div ref={world} className={`runner-world ${current.className}${running?' runner-playing':''}${over?' runner-ended':''}`} aria-label={current.name}>
      <div className="runner-sky-stars" aria-hidden="true">✦　 ·　 ✧　　 ·　 ✦　　✧</div>
      <div ref={player} className={`runner-player-stick${jumping?' jumping':''}`} aria-label="Pessoa-palito correndo"><i className="stick-head"/><i className="stick-body"/><i className="stick-arm arm-one"/><i className="stick-arm arm-two"/><i className="stick-leg leg-one"/><i className="stick-leg leg-two"/></div>
      {obstacles.map(item=><span key={item.id} ref={node=>{if(node)obstacleNodes.current.set(item.id,node);else obstacleNodes.current.delete(item.id)}} className={`runner-obstacle-new ${item.kind}`} aria-label={item.kind==='air'?'Obstáculo no ar':'Obstáculo no chão'}/>)}
      <div className="runner-ground"><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span><span>✧</span></div>
      {!running&&<div className="runner-overlay"><strong>{over?'Fim de corrida!':'Pronta para correr?'}</strong><span>{over?`Você marcou ${score} pontos.`:'Pressione começar para jogar.'}</span></div>}
    </div>
    <div className="runner-controls">
      <button className="primary-button" onClick={running?jump:start}>{running?<><ArrowUp size={17}/> Pular</>:<><RotateCcw size={17}/>{over?' Tentar novamente':' Começar a correr'}</>}</button>
      <button className={`secondary-button runner-duck-button${ducking?' active':''}`} onPointerDown={()=>setDuck(true)} onPointerUp={()=>setDuck(false)} onPointerLeave={()=>setDuck(false)} onPointerCancel={()=>setDuck(false)} disabled={!running}><ArrowDown size={17}/> Abaixar</button>
    </div>
    <p className="play-hint">Teclado: espaço ou ↑ para pular; ↓ para abaixar. No celular, use os botões. O recorde fica salvo neste dispositivo.</p>
  </div>
}
