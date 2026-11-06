import { useEffect, useMemo, useRef, useState } from 'react'
import { Bold, Bot, ExternalLink, FileText, Highlighter, Italic, LayoutGrid, List, ListOrdered, NotebookPen, Palette, Redo2, Search, Sparkles, Underline, Undo2, Video } from 'lucide-react'
import AIChat from '../../components/AIChat/AIChat'
import { useMonisa } from '../../context/MonisaContext'
import './StudySpace.css'

type LayoutMode = 'notes-ai' | 'video-notes' | 'video-ai' | 'all'
type Tool = 'notes' | 'video' | 'ai'

function videoId(value: string) {
  try {
    const url = new URL(value)
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1).split('/')[0]
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2]
      if (url.pathname === '/watch') return url.searchParams.get('v')
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2]
    }
  } catch { return null }
  return null
}

export default function StudySpace() {
  const { user, profile } = useMonisa()
  const storageKey = `monisa-study-notes-${user?.id || 'guest'}`
  const [notesHtml, setNotesHtml] = useState('')
  const [notesLoaded, setNotesLoaded] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const editorRef = useRef<HTMLDivElement>(null)
  const savedSelection = useRef<Range | null>(null)
  const [videoInput, setVideoInput] = useState('')
  const [videoQuery, setVideoQuery] = useState(profile?.subject || '')
  const [activeVideo, setActiveVideo] = useState('')
  const [layout, setLayout] = useState<LayoutMode>('notes-ai')
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    let content = ''
    try { content = localStorage.getItem(storageKey) || '' } catch { content = '' }
    setNotesHtml(content)
    if (editorRef.current) editorRef.current.innerHTML = content
    setWordCount(editorRef.current?.innerText.trim().split(/\s+/).filter(Boolean).length || 0)
    setNotesLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (!notesLoaded) return
    setSaved(false)
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, notesHtml)
        setSaved(true)
      } catch { setSaved(false) }
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [notesHtml, storageKey, notesLoaded])

  function rememberSelection() {
    const selection = window.getSelection()
    if (selection && selection.rangeCount && editorRef.current?.contains(selection.anchorNode)) {
      savedSelection.current = selection.getRangeAt(0).cloneRange()
    }
  }

  function formatNote(command: string, value?: string) {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const selection = window.getSelection()
    if (savedSelection.current && selection) {
      selection.removeAllRanges()
      selection.addRange(savedSelection.current)
    }
    document.execCommand(command, false, value)
    rememberSelection()
    setNotesHtml(editor.innerHTML)
    setWordCount(editor.innerText.trim().split(/\s+/).filter(Boolean).length)
  }

  function changeFont(command: string, value: string) {
    formatNote(command, value)
  }

  function handleNotesInput() {
    const editor = editorRef.current
    if (!editor) return
    setNotesHtml(editor.innerHTML)
    setWordCount(editor.innerText.trim().split(/\s+/).filter(Boolean).length)
  }

  const tools = useMemo<Tool[]>(() => {
    const toolMap: Record<LayoutMode, Tool[]> = {
      'notes-ai': ['notes', 'ai'],
      'video-notes': ['video', 'notes'],
      'video-ai': ['video', 'ai'],
      all: ['video', 'notes', 'ai'],
    }
    return toolMap[layout]
  }, [layout])

  function openVideo() {
    const id = videoId(videoInput.trim())
    if (id) setActiveVideo(id)
  }

  function searchVideos() {
    if (!videoQuery.trim()) return
    window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(videoQuery.trim() + ' aula educativa'), '_blank', 'noopener,noreferrer')
  }

  return <section className="study-space-page" aria-labelledby="study-space-title">
    <header className="study-space-heading">
      <div>
        <span className="eyebrow">SEU AMBIENTE DE APRENDIZAGEM</span>
        <h1 id="study-space-title">Espaço de Estudos <span>✦</span></h1>
        <p>Reúna suas ferramentas em um só lugar. Assista, anote e converse com a Monisa sem ficar trocando de página.</p>
      </div>
      <div className="study-space-save" role="status"><span className={saved ? 'save-indicator' : 'save-indicator saving'} />{saved ? 'Anotações salvas neste dispositivo' : 'Salvando anotações…'}</div>
    </header>

    <section className="study-space-toolbar" aria-label="Organização do espaço">
      <div className="study-space-toolbar-title"><LayoutGrid size={18} /><div><strong>Organize sua tela</strong><span>Escolha as ferramentas que quer usar juntas.</span></div></div>
      <div className="study-layout-options">
        <button type="button" className={layout === 'notes-ai' ? 'selected' : ''} onClick={() => setLayout('notes-ai')}>Caderno + IA</button>
        <button type="button" className={layout === 'video-notes' ? 'selected' : ''} onClick={() => setLayout('video-notes')}>Vídeo + Caderno</button>
        <button type="button" className={layout === 'video-ai' ? 'selected' : ''} onClick={() => setLayout('video-ai')}>Vídeo + IA</button>
        <button type="button" className={layout === 'all' ? 'selected' : ''} onClick={() => setLayout('all')}>Tudo junto</button>
      </div>
    </section>

    <div className={`study-workspace-grid panels-${tools.length}`}>
      {tools.map(tool => tool === 'notes' ? <section className="study-tool-panel notes-panel" key={tool}>
        <header className="study-tool-header"><span className="study-tool-icon"><NotebookPen size={18} /></span><div><strong>Meu caderno</strong><small>Suas ideias, do seu jeito</small></div><span className="study-tool-status">Auto-save</span></header>
        <div className="notebook-toolbar" role="toolbar" aria-label="Formatação do caderno">
          <select aria-label="Tipo de letra" defaultValue="Arial" onMouseDown={rememberSelection} onChange={event => changeFont('fontName', event.target.value)}>
            <option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Verdana">Verdana</option><option value="Trebuchet MS">Trebuchet</option><option value="Courier New">Monoespaçada</option>
          </select>
          <select aria-label="Tamanho da letra" defaultValue="3" onMouseDown={rememberSelection} onChange={event => changeFont('fontSize', event.target.value)}>
            <option value="2">Pequena</option><option value="3">Normal</option><option value="4">Grande</option><option value="5">Título</option>
          </select>
          <button type="button" title="Negrito" aria-label="Negrito" onMouseDown={event => event.preventDefault()} onClick={() => formatNote('bold')}><Bold size={16}/></button>
          <button type="button" title="Itálico" aria-label="Itálico" onMouseDown={event => event.preventDefault()} onClick={() => formatNote('italic')}><Italic size={16}/></button>
          <button type="button" title="Sublinhado" aria-label="Sublinhado" onMouseDown={event => event.preventDefault()} onClick={() => formatNote('underline')}><Underline size={16}/></button>
          <label className="notebook-color" title="Cor do texto"><Palette size={16}/><input type="color" aria-label="Cor do texto" defaultValue="#26345a" onChange={event => formatNote('foreColor', event.target.value)}/></label>
          <label className="notebook-color highlight-control" title="Marca-texto"><Highlighter size={16}/><input type="color" aria-label="Cor do marca-texto" defaultValue="#fff09a" onChange={event => formatNote('hiliteColor', event.target.value)}/></label>
          <button type="button" title="Lista com marcadores" aria-label="Lista com marcadores" onMouseDown={event => event.preventDefault()} onClick={() => formatNote('insertUnorderedList')}><List size={16}/></button>
          <button type="button" title="Lista numerada" aria-label="Lista numerada" onMouseDown={event => event.preventDefault()} onClick={() => formatNote('insertOrderedList')}><ListOrdered size={16}/></button>
          <span className="notebook-toolbar-spacer"/>
          <button type="button" title="Desfazer" aria-label="Desfazer" onMouseDown={event => event.preventDefault()} onClick={() => formatNote('undo')}><Undo2 size={16}/></button>
          <button type="button" title="Refazer" aria-label="Refazer" onMouseDown={event => event.preventDefault()} onClick={() => formatNote('redo')}><Redo2 size={16}/></button>
        </div>
        <div className="notebook-paper">
          <div className="notebook-margin" aria-hidden="true"/>
          <label className="visually-hidden" htmlFor="monisa-study-notes">Escreva suas anotações</label>
          <div id="monisa-study-notes" ref={editorRef} className="notebook-editor" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder="Comece a escrever suas anotações aqui…\n\nOrganize suas ideias, destaque o que é importante e crie seu próprio resumo." onInput={handleNotesInput} onKeyUp={rememberSelection} onMouseUp={rememberSelection} />
        </div>
        <footer className="notes-footer"><span><FileText size={14} /> {wordCount} palavras</span><span>{saved ? 'Salvo neste dispositivo' : 'Salvando…'}</span></footer>
      </section> : tool === 'video' ? <section className="study-tool-panel video-panel" key={tool}>
        <header className="study-tool-header"><span className="study-tool-icon youtube-icon"><Video size={19} /></span><div><strong>Vídeo educativo</strong><small>Aprenda assistindo</small></div></header>
        <form className="video-search-form" onSubmit={event => { event.preventDefault(); searchVideos() }}>
          <label className="visually-hidden" htmlFor="video-topic">Assunto que deseja aprender</label>
          <input id="video-topic" value={videoQuery} onChange={event => setVideoQuery(event.target.value)} placeholder="O que você quer aprender?" />
          <button type="submit" aria-label="Buscar vídeos no YouTube"><Search size={17} /></button>
        </form>
        <form className="video-url-form" onSubmit={event => { event.preventDefault(); openVideo() }}>
          <label htmlFor="youtube-url">Cole o link de uma aula do YouTube</label>
          <div><input id="youtube-url" value={videoInput} onChange={event => setVideoInput(event.target.value)} placeholder="https://youtube.com/watch?v=…" /><button type="submit">Abrir aula</button></div>
        </form>
        <div className="video-player-wrap">
          {activeVideo ? <iframe src={`https://www.youtube-nocookie.com/embed/${activeVideo}`} title="Vídeo educativo do YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="video-empty"><span><Video size={34} /></span><strong>Sua próxima aula começa aqui</strong><p>Pesquise um assunto no YouTube ou cole o link de um vídeo para assistir nesta área.</p><button type="button" onClick={searchVideos} disabled={!videoQuery.trim()}><Search size={15} /> Buscar aulas</button></div>}
        </div>
        <p className="video-note"><ExternalLink size={13} /> Os vídeos são fornecidos pelo YouTube. A busca abre os resultados em uma nova aba.</p>
      </section> : <section className="study-tool-panel ai-panel" key={tool}>
        <div className="ai-panel-label"><Bot size={17} /> SUA TUTORA DE ESTUDOS</div>
        <AIChat />
      </section>)}
    </div>
    <p className="study-space-tip"><Sparkles size={16} /> Dica: você pode usar o caderno para registrar os pontos principais da aula e depois pedir à Monisa para transformar suas anotações em um resumo ou exercício.</p>
  </section>
}
