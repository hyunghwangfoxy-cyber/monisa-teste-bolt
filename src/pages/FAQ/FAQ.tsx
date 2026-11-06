import { useState } from 'react'
import './FAQ.css'
import { BookOpen, Brain, Palette, Sparkles, UserRound, ChevronDown, Search, Lightbulb } from 'lucide-react'

const topics = [
  { category: 'Conhecendo a Monisa', icon: Sparkles, color: 'violet', questions: [
    { q: 'O que é a Monisa?', a: 'A Monisa é uma plataforma de aprendizagem que reúne uma assistente de estudos, recursos de personalização e atividades. A proposta é ajudar cada pessoa a estudar de um jeito mais confortável.' },
    { q: 'Como a Monisa pode me ajudar?', a: 'Você pode fazer perguntas sobre matérias, pedir explicações, solicitar exemplos e organizar os estudos. Também pode explorar atividades e ajustar a experiência às suas preferências.' },
    { q: 'Preciso saber exatamente o que perguntar?', a: 'Não! Você pode começar com uma dúvida simples, escrever o nome de um assunto ou pedir: “me explique desde o começo”. A Monisa pode ajudar a organizar o próximo passo.' }
  ]},
  { category: 'Aprendizagem e quiz', icon: Brain, color: 'blue', questions: [
    { q: 'Para que serve o quiz inicial?', a: 'O quiz identifica preferências de aprendizagem, como formato das explicações, ritmo e conforto visual. Ele não é uma prova e não existe resposta certa ou errada.' },
    { q: 'Posso mudar minhas respostas depois?', a: 'Sim. Suas preferências podem ser ajustadas nas opções de acessibilidade e personalização. A ideia é que a plataforma acompanhe o que funciona melhor para você.' },
    { q: 'A Monisa substitui meu professor?', a: 'Não. Ela é uma ferramenta de apoio aos estudos. Confira conteúdos importantes com seus materiais didáticos e professores, especialmente antes de avaliações.' }
  ]},
  { category: 'Acessibilidade e conforto', icon: Palette, color: 'pink', questions: [
    { q: 'Como aumentar o tamanho das letras?', a: 'Acesse Acessibilidade no menu e escolha o tamanho de texto que deixe a leitura mais confortável.' },
    { q: 'Posso trocar o tema da plataforma?', a: 'Sim. Nas configurações, você pode escolher entre tema escuro, claro e alto contraste, conforme as opções disponíveis.' },
    { q: 'A plataforma exige informar algum diagnóstico?', a: 'Não. As preferências são escolhas pessoais de conforto e aprendizagem. Você não precisa informar diagnóstico para usar os recursos.' }
  ]},
  { category: 'Conta e perfil', icon: UserRound, color: 'teal', questions: [
    { q: 'Onde altero meu nome e meu perfil?', a: 'Abra Meu perfil no menu para consultar e editar as informações disponíveis na sua conta.' },
    { q: 'Minhas preferências ficam salvas?', a: 'Quando a conta e o armazenamento estiverem configurados, as preferências poderão ficar associadas ao seu perfil para serem recuperadas ao entrar novamente.' }
  ]},
  { category: 'Estudos e atividades', icon: BookOpen, color: 'gold', questions: [
    { q: 'O que é o Monisa Play?', a: 'É uma área com atividades interativas e jogos leves, pensados para oferecer pequenas pausas e experiências diferentes durante o uso da plataforma.' },
    { q: 'E se a resposta da IA estiver errada?', a: 'Peça outra explicação, solicite fontes ou confira a informação com seu material de aula. Sistemas de IA podem cometer erros e não devem ser tratados como fonte infalível.' }
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
