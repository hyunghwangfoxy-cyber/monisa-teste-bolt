import { useState } from 'react'
import './FAQ.css'
import { BookOpen, Brain, Palette, Sparkles, UserRound, ChevronDown, Search, Lightbulb } from 'lucide-react'

const topics = [
  { category: 'Conhecendo a Monisa', icon: Sparkles, color: 'violet', questions: [
    { q: 'O que é a Monisa?', a: 'É uma plataforma de aprendizagem com tutora de IA, atividades e opções para personalizar seus estudos.' },
    { q: 'Como posso começar?', a: 'Escreva uma dúvida, escolha uma matéria ou peça uma explicação desde o começo.' }
  ]},
  { category: 'Aprendizagem', icon: Brain, color: 'blue', questions: [
    { q: 'O quiz é uma prova?', a: 'Não. Ele ajuda a conhecer suas preferências de estudo. Não existe resposta certa ou errada.' },
    { q: 'A Monisa substitui o professor?', a: 'Não. Ela é um apoio para estudar. Confira conteúdos importantes com seus professores e materiais.' }
  ]},
  { category: 'Acessibilidade', icon: Palette, color: 'pink', questions: [
    { q: 'Posso mudar o visual?', a: 'Sim. Em configurações, escolha tema escuro, claro ou alto contraste e ajuste o tamanho do texto.' },
    { q: 'Preciso informar um diagnóstico?', a: 'Não. Os recursos podem ser usados por qualquer pessoa, conforme sua preferência.' }
  ]},
  { category: 'Conta e estudos', icon: UserRound, color: 'teal', questions: [
    { q: 'Onde edito meu perfil?', a: 'Abra “Meu perfil” no menu para alterar suas informações.' },
    { q: 'E se a IA errar?', a: 'Peça outra explicação e confira a informação com seu material de estudo.' }
  ]}
]

export default function FAQ() {
  const [query, setQuery] = useState('')
  const [opened, setOpened] = useState('O que é a Monisa?')
  const normalized = query.trim().toLocaleLowerCase('pt-BR')
  const filtered = topics.map(topic => ({ ...topic, questions: topic.questions.filter(item => !normalized || (item.q + ' ' + item.a + ' ' + topic.category).toLocaleLowerCase('pt-BR').includes(normalized)) })).filter(topic => topic.questions.length)
  const count = filtered.reduce((total, topic) => total + topic.questions.length, 0)

  return <section className="faq-page" aria-labelledby="faq-title">
    <div className="faq-hero">
      <div className="faq-hero-art" aria-hidden="true"><div className="faq-art-orbit" /><div className="faq-art-card"><Lightbulb size={48} /><span>Uma dúvida<br/>de cada vez.</span></div><span className="faq-art-star">✦</span></div>
      <div className="faq-hero-copy"><span className="eyebrow">CENTRAL DE AJUDA</span><h1 id="faq-title">Vamos descobrir<br/><span>juntos?</span></h1><p>Respostas simples para as dúvidas mais comuns sobre a Monisa, seus recursos e seu jeito de aprender.</p></div>
    </div>
    <label className="faq-search"><Search size={19}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Busque uma dúvida, como “quiz” ou “tema”..." aria-label="Buscar dúvidas frequentes"/>{query && <button type="button" onClick={() => setQuery('')}>Limpar</button>}</label>
    <div className="faq-results" aria-live="polite">{count} {count === 1 ? 'resposta encontrada' : 'respostas encontradas'}</div>
    {filtered.length ? <div className="faq-groups">{filtered.map(topic => { const Icon = topic.icon; return <section className="faq-group" key={topic.category}><div className="faq-group-title"><span className={'faq-category-icon '+topic.color}><Icon size={20}/></span><h2>{topic.category}</h2></div><div className="faq-list">{topic.questions.map(item => <article className={'faq-item '+(opened === item.q ? 'is-open' : '')} key={item.q}><button type="button" aria-expanded={opened === item.q} onClick={() => setOpened(opened === item.q ? '' : item.q)}><span>{item.q}</span><ChevronDown size={19}/></button>{opened === item.q && <p>{item.a}</p>}</article>)}</div></section>})}</div> : <div className="faq-empty"><Search size={28}/><strong>Não encontramos essa dúvida.</strong><span>Tente buscar por outra palavra.</span></div>}
    <aside className="faq-bottom"><Sparkles size={22}/><div><strong>Continue explorando no seu ritmo.</strong><p>Se uma explicação não ficar clara, tente perguntar de outro jeito. Aprender também é experimentar.</p></div></aside>
  </section>
}
