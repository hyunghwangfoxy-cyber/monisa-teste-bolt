import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Camera, UserRound, Check, Trash2, LogOut, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMonisa } from '../../context/MonisaContext'
import { api, jsonRequest } from '../../lib/api'
import type { Profile as ProfileData } from '../../lib/preferences'

export default function Profile() {
  const { user, profile, setProfile, signOut, deleteAccount } = useMonisa()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [subject, setSubject] = useState(profile?.subject || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const updated = await api<ProfileData>('/api/profile', jsonRequest('PUT', { ...profile, name, bio, subject }))
      setProfile(updated)
      setName(updated.name)
      setBio(updated.bio)
      setSubject(updated.subject)
      setNotice('Seu perfil foi salvo. Que bom conhecer você melhor!')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível salvar o perfil.') }
    finally { setBusy(false) }
  }

  async function photo(event?: ChangeEvent<HTMLInputElement>) {
    const file = event?.target.files?.[0]
    if (event && !file) return
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024)) {
      setError('Escolha uma foto JPG, PNG ou WebP de até 2 MB.')
      if (fileInput.current) fileInput.current.value = ''
      return
    }
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const updated = await api<ProfileData>('/api/avatar', file ? { method: 'POST', headers: { 'Content-Type': file.type }, body: file } : { method: 'DELETE' })
      setProfile(updated)
      setNotice(file ? 'Sua foto foi atualizada.' : 'Sua foto foi removida.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível atualizar a foto.') }
    finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function exit() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await signOut()
      localStorage.removeItem('monisa-demo-messages')
      navigate('/', { replace: true })
    } catch {
      setError('Não foi possível sair. Tente novamente.')
      setBusy(false)
    }
  }

  async function removeAccount() {
    if (busy || confirmation !== 'EXCLUIR') return
    setBusy(true)
    setError('')
    try {
      await deleteAccount()
      navigate('/', { replace: true })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível excluir sua conta.')
      setBusy(false)
    }
  }

  if (!profile) return null
  return <section className="personal-page" aria-labelledby="profile-title">
    <div className="page-heading"><span className="eyebrow">UM ESPAÇO COM A SUA CARA</span><h1 id="profile-title">Prazer, você.</h1><p>Seu nome, seus interesses e aquilo que torna esse espaço seu.</p></div>
    <div className="profile-grid">
      <section className="settings-card photo-card"><div className="profile-photo">{profile.avatarUrl ? <img className="avatar large" src={profile.avatarUrl} alt="Sua foto de perfil" /> : <span className="avatar large avatar-placeholder"><UserRound size={54} /></span>}</div><h2>{profile.name}</h2><p className="field-hint">Uma foto é opcional.<br />JPG, PNG ou WebP, até 2 MB.</p><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" aria-label="Escolher foto de perfil" tabIndex={-1} disabled={busy} onChange={photo} /><button className="secondary-button" disabled={busy} onClick={() => fileInput.current?.click()}><Camera size={18} />{busy ? 'Aguarde…' : 'Escolher foto'}</button>{profile.avatarUrl && <button className="text-button" disabled={busy} onClick={() => photo()}><Trash2 size={15} />Remover foto</button>}<p className="privacy-note">Sua foto fica associada à sua conta e só é exibida no seu espaço.</p></section>
      <form className="settings-card stack-form" onSubmit={save}>
        <div className="card-title"><UserRound size={21} /><h2>Sobre você</h2></div>
        <label>Como quer ser chamado(a)?<input required maxLength={80} autoComplete="name" value={name} disabled={busy} onChange={event => setName(event.target.value)} /></label>
        <label>E-mail da conta<input type="email" value={user?.email || ''} readOnly /><span className="field-hint">Usado para entrar e recuperar seu acesso.</span></label>
        <label>Uma pequena apresentação <span className="field-hint">(opcional)</span><textarea rows={3} maxLength={300} value={bio} disabled={busy} onChange={event => setBio(event.target.value)} placeholder="O que você gosta de aprender?" /><span className="field-hint">{bio.length}/300. Não é necessário compartilhar informações de saúde.</span></label>
        <label>O que quer estudar agora?<input maxLength={80} value={subject} disabled={busy} onChange={event => setSubject(event.target.value)} placeholder="Ex.: matemática, português, programação" /><span className="field-hint">Usamos esse interesse na sugestão de começar um estudo.</span></label>
        <button className="primary-button" disabled={busy} type="submit"><Check size={18} />{busy ? 'Salvando…' : 'Salvar meu perfil'}</button>
      </form>
    </div>
    <section className="settings-card account-actions" aria-labelledby="account-actions-title">
      <div className="card-title"><UserRound size={21} /><h2 id="account-actions-title">Sua conta</h2></div>
      <div className="account-action-row"><div><strong>Sair da conta</strong><p className="field-hint">Encerra sua sessão neste dispositivo. Seu cadastro e seus estudos continuam salvos.</p></div><button className="secondary-button" type="button" disabled={busy} onClick={exit}><LogOut size={17} />Sair da conta</button></div>
      <div className="account-action-row danger-action"><div><strong>Excluir conta e dados</strong><p className="field-hint">Apaga permanentemente seu cadastro, perfil, conversas e dados de estudo vinculados à conta. Essa ação não pode ser desfeita.</p></div><button className="danger-button" type="button" disabled={busy} onClick={() => { setShowDelete(value => !value); setConfirmation(''); setError('') }}><Trash2 size={17} />Excluir dados</button></div>
      {showDelete && <div className="delete-confirmation" role="group" aria-label="Confirmação de exclusão da conta"><p><AlertTriangle size={18} /> Esta ação é permanente. Para confirmar, digite <strong>EXCLUIR</strong> abaixo.</p><label>Confirmação<input value={confirmation} onChange={event => setConfirmation(event.target.value.toUpperCase())} autoComplete="off" spellCheck={false} placeholder="Digite EXCLUIR" disabled={busy} /></label><div className="button-row"><button className="secondary-button" type="button" disabled={busy} onClick={() => { setShowDelete(false); setConfirmation('') }}>Cancelar</button><button className="danger-button" type="button" disabled={busy || confirmation !== 'EXCLUIR'} onClick={removeAccount}><Trash2 size={17} />{busy ? 'Excluindo…' : 'Confirmar exclusão'}</button></div></div>}
    </section>
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-success" role="status">{notice}</p>}
  </section>
}
