import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowRight, CalendarDays, Check,
  CheckCircle2, CircleDot, Clock3, Code2, ExternalLink, Flag,
  FolderGit2, GitCommitHorizontal, ListChecks, ListTodo, Plus, Radio, RotateCw,
  Search, Sparkles, Users, Video, X,
} from 'lucide-react'
import {
  loadScrumData, members, storyStatuses,
  type MemberId, type ScrumData, type ScrumMeeting, type Sprint, type StoryStatus, type StoryTask,
  type UserStory, type ViewId, type WorkUpdate,
} from './features/scrum/model'
import './App.css'

const repoUrl = 'https://github.com/Jesus-Rocha-B/Rupi'
const commitsApi = 'https://api.github.com/repos/Jesus-Rocha-B/Rupi/commits?per_page=8'

type Commit = { sha: string; message: string; author: string; date: string; url: string }
type ModalState = { kind: 'meeting' | 'sprint' | 'advance'; storyId?: string } | null

const fallbackCommits: Commit[] = [
  { sha: 'a1dd4d9', message: 'Estructura del prototipo de la página de Rupi', author: 'Jesús Rocha', date: '2026-09-29T19:39:18Z', url: `${repoUrl}/commit/a1dd4d9` },
  { sha: '6327196', message: 'feat: agrega prototipo inicial de RUPI', author: 'Jesús Rocha', date: '2026-09-29T19:35:21Z', url: `${repoUrl}/commit/6327196` },
]

const navItems: { id: ViewId; label: string; icon: typeof Activity }[] = [
  { id: 'inicio', label: 'Resumen', icon: Activity },
  { id: 'historias', label: 'Historias', icon: ListChecks },
  { id: 'reuniones', label: 'Reuniones', icon: CalendarDays },
  { id: 'commits', label: 'Commits', icon: GitCommitHorizontal },
  { id: 'sprints', label: 'Sprints', icon: Flag },
]

async function fetchGithubCommits(): Promise<Commit[]> {
  const response = await fetch(commitsApi, { headers: { Accept: 'application/vnd.github+json' } })
  if (!response.ok) throw new Error('No se pudo consultar GitHub')
  const payload = (await response.json()) as {
    sha: string
    html_url: string
    commit: { message: string; author: { name: string; date: string } }
  }[]
  return payload.map((item) => ({
    sha: item.sha.slice(0, 7),
    message: item.commit.message.split('\n')[0],
    author: item.commit.author.name,
    date: item.commit.author.date,
    url: item.html_url,
  }))
}

const pageCopy: Record<ViewId, { title: string; subtitle: string }> = {
  inicio: { title: 'Resumen del equipo', subtitle: 'Un lugar para coordinar el trabajo y ver cómo avanza Rupi.' },
  historias: { title: 'Historias de usuario', subtitle: 'Organiza el backlog, asigna responsables y registra avances.' },
  reuniones: { title: 'Reuniones', subtitle: 'Agenda las conversaciones del equipo y ten el enlace a mano.' },
  commits: { title: 'Actividad del repositorio', subtitle: 'Cambios recientes publicados en el repositorio de Rupi.' },
  sprints: { title: 'Sprints', subtitle: 'Planifica el trabajo en ciclos cortos cuando el equipo esté listo.' },
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', ...options }).format(new Date(value))
}

function localDateTimeValue() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function initialsName(id: MemberId) {
  return members.find((member) => member.id === id)
}

function displayStatus(status: string) {
  return status === 'Pendiente' ? 'Por hacer' : status
}

function priorityClass(priority: string) {
  return priority.toLowerCase().replaceAll(' ', '-')
}

function App() {
  const [view, setView] = useState<ViewId>('inicio')
  const [data, setData] = useState<ScrumData>(loadScrumData)
  const [modal, setModal] = useState<ModalState>(null)
  const [searchText, setSearchText] = useState('')
  const [commits, setCommits] = useState<Commit[]>(fallbackCommits)
  const [commitState, setCommitState] = useState<'loading' | 'connected' | 'fallback'>('loading')
  const [refreshingCommits, setRefreshingCommits] = useState(false)
  const [mountedAt] = useState(() => Date.now())
  const [teamMember, setTeamMember] = useState<{ id: MemberId; name: string } | null>(null)
  const [accessCode, setAccessCode] = useState('')
  const [authError, setAuthError] = useState('')
  const [workspaceReady, setWorkspaceReady] = useState(false)
  const [saveState, setSaveState] = useState<'loading' | 'saved' | 'saving' | 'error'>('loading')
  const [workspaceError, setWorkspaceError] = useState('')
  const versionRef = useRef(0)
  const knownDataRef = useRef('')
  const pendingSaveRef = useRef(false)

  useEffect(() => {
    let active = true
    void fetch('/api/session').then(async (response) => {
      if (!response.ok) return null
      return response.json() as Promise<{ member: { id: MemberId; name: string } }>
    }).then(async (session) => {
      if (!active || !session) { if (active) setSaveState('saved'); return }
      setTeamMember(session.member)
      const response = await fetch('/api/workspace')
      if (!response.ok) throw new Error('No se pudo cargar el espacio del equipo.')
      const remote = await response.json() as { version: number; data: ScrumData }
      versionRef.current = remote.version
      if (remote.data.stories.length === 0) {
        const localData = loadScrumData()
        const saved = await fetch('/api/workspace', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: remote.version, data: localData }) })
        if (!saved.ok) throw new Error('No se pudieron importar los datos iniciales.')
        const result = await saved.json() as { version: number }
        versionRef.current = result.version
        if (active) { setData(localData); knownDataRef.current = JSON.stringify(localData) }
      } else if (active) {
        setData(remote.data)
        knownDataRef.current = JSON.stringify(remote.data)
      }
      if (active) { setWorkspaceReady(true); setSaveState('saved'); setWorkspaceError('') }
    }).catch((error: unknown) => { if (active) { const message = error instanceof Error ? error.message : 'Error al conectar con el espacio.'; setWorkspaceError(message); setAuthError(message); setSaveState('error') } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!workspaceReady) return
    const serialized = JSON.stringify(data)
    if (serialized === knownDataRef.current) return
    pendingSaveRef.current = true
    setSaveState('saving')
    const timeout = window.setTimeout(() => {
      void fetch('/api/workspace', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: versionRef.current, data }) }).then(async (response) => {
        if (response.status === 409) throw new Error('Otro integrante guardó cambios al mismo tiempo. Actualiza la página para ver la última versión.')
        if (!response.ok) throw new Error('No se pudieron guardar los cambios. Revisa tu conexión e inténtalo de nuevo.')
        const result = await response.json() as { version: number }
        versionRef.current = result.version
        knownDataRef.current = serialized
        pendingSaveRef.current = false
        setWorkspaceError('')
        setSaveState('saved')
      }).catch((error: unknown) => {
        pendingSaveRef.current = false
        setWorkspaceError(error instanceof Error ? error.message : 'Error al guardar.')
        setSaveState('error')
      })
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [data, workspaceReady])

  useEffect(() => {
    if (!teamMember || !workspaceReady) return
    const interval = window.setInterval(() => {
      if (pendingSaveRef.current) return
      void fetch('/api/workspace').then((response) => response.ok ? response.json() as Promise<{ version: number; data: ScrumData }> : null).then((remote) => {
        if (!remote || remote.version <= versionRef.current || pendingSaveRef.current) return
        versionRef.current = remote.version
        knownDataRef.current = JSON.stringify(remote.data)
        setData(remote.data)
        setSaveState('saved')
      }).catch(() => undefined)
    }, 10000)
    return () => window.clearInterval(interval)
  }, [teamMember, workspaceReady])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    const memberId = (event.currentTarget.elements.namedItem('memberId') as HTMLSelectElement).value as MemberId
    try {
      const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessCode, memberId }) })
      const result = await response.json() as { member?: { id: MemberId; name: string }; error?: string }
      if (!response.ok || !result.member) throw new Error(result.error || 'No se pudo iniciar sesión.')
      setTeamMember(result.member)
      setAccessCode('')
      setSaveState('loading')
      const workspace = await fetch('/api/workspace')
      if (!workspace.ok) throw new Error('No se pudo cargar la información del equipo.')
      const remote = await workspace.json() as { version: number; data: ScrumData }
      versionRef.current = remote.version
      if (!remote.data.stories.length) {
        const localData = loadScrumData()
        const saved = await fetch('/api/workspace', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: remote.version, data: localData }) })
        if (!saved.ok) throw new Error('No se pudieron importar los datos iniciales.')
        versionRef.current = ((await saved.json()) as { version: number }).version
        setData(localData)
        knownDataRef.current = JSON.stringify(localData)
      } else {
        setData(remote.data)
        knownDataRef.current = JSON.stringify(remote.data)
      }
      setWorkspaceError('')
      setWorkspaceReady(true)
      setSaveState('saved')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
      setTeamMember(null)
    }
  }

  async function loadCommits() {
    setRefreshingCommits(true)
    try {
      setCommits(await fetchGithubCommits())
      setCommitState('connected')
    } catch {
      setCommits(fallbackCommits)
      setCommitState('fallback')
    } finally {
      setRefreshingCommits(false)
    }
  }

  useEffect(() => {
    let active = true
    void fetchGithubCommits().then((items) => {
      if (active) { setCommits(items); setCommitState('connected') }
    }).catch(() => {
      if (active) { setCommits(fallbackCommits); setCommitState('fallback') }
    })
    return () => { active = false }
  }, [])

  const activeSprint = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
    return data.sprints.find((sprint) => !sprint.completed && sprint.startsOn <= today && sprint.endsOn >= today)
  }, [data.sprints])

  const upcomingMeetings = useMemo(() => data.meetings
    .filter((meeting) => !meeting.completed && new Date(meeting.startsAt).getTime() >= mountedAt)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt)), [data.meetings, mountedAt])

  const filteredStories = useMemo(() => data.stories.filter((story) =>
    `${story.id} ${story.title} ${story.epic}`.toLowerCase().includes(searchText.toLowerCase()),
  ), [data.stories, searchText])

  function addMeeting(meeting: ScrumMeeting) {
    setData((current) => ({ ...current, meetings: [...current.meetings, meeting] }))
    setModal(null)
  }

  function addSprint(sprint: Sprint) {
    setData((current) => ({ ...current, sprints: [...current.sprints, sprint] }))
    setModal(null)
  }

  function addUpdate(update: WorkUpdate) {
    setData((current) => ({
      ...current,
      updates: [update, ...current.updates],
      stories: current.stories.map((story) => story.id === update.storyId
        ? { ...story, progress: update.progress, status: update.progress === 100 ? 'Hecha' : update.progress >= 70 ? 'En revisión' : 'En progreso' }
        : story),
    }))
    setModal(null)
  }

  function changeStory(storyId: string, changes: Partial<UserStory>) {
    setData((current) => ({
      ...current,
      stories: current.stories.map((story) => story.id === storyId ? { ...story, ...changes } : story),
    }))
  }

  function addStoryTask(storyId: string, title: string) {
    const task: StoryTask = { id: crypto.randomUUID(), title, completed: false }
    setData((current) => ({
      ...current,
      stories: current.stories.map((story) => story.id === storyId ? { ...story, tasks: [...story.tasks, task] } : story),
    }))
  }

  function toggleStoryTask(storyId: string, taskId: string) {
    setData((current) => ({
      ...current,
      stories: current.stories.map((story) => story.id === storyId
        ? { ...story, tasks: story.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task) }
        : story),
    }))
  }

  function removeStoryTask(storyId: string, taskId: string) {
    setData((current) => ({
      ...current,
      stories: current.stories.map((story) => story.id === storyId
        ? { ...story, tasks: story.tasks.filter((task) => task.id !== taskId) }
        : story),
    }))
  }

  function toggleMeeting(meetingId: string) {
    setData((current) => ({
      ...current,
      meetings: current.meetings.map((meeting) => meeting.id === meetingId ? { ...meeting, completed: !meeting.completed } : meeting),
    }))
  }

  function finishSprint(sprintId: string) {
    setData((current) => ({
      ...current,
      sprints: current.sprints.map((sprint) => sprint.id === sprintId ? { ...sprint, completed: true } : sprint),
    }))
  }

  return (
    teamMember ?
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#inicio" onClick={() => setView('inicio')} aria-label="Rupi, resumen">
          <img src="/rupi-logo.jpg" alt="" />
          <span>Rupi<span className="brand-period">.</span><small>ESPACIO DE EQUIPO</small></span>
        </a>

        <nav className="side-nav" aria-label="Navegación principal">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button className={`nav-link ${view === id ? 'selected' : ''}`} key={id} onClick={() => setView(id)} type="button">
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
              {id === 'historias' && <span className="nav-count">{data.stories.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <section className="team-widget">
          <div className="team-widget-head"><span>EL EQUIPO</span><button type="button" title="Integrantes"><Users size={15} /></button></div>
          {members.map((member) => <MemberRow memberId={member.id} key={member.id} />)}
        </section>
        <a className="repo-link" href={repoUrl} target="_blank" rel="noreferrer">
          <Code2 size={16} /><span>Repositorio GitHub</span><ExternalLink size={13} />
        </a>
      </aside>

      <main className="main-area">
        {workspaceError && <div className="sync-banner" role="status">{workspaceError}</div>}
        <div className="page-content">
          <section className="page-heading">
            <div>
              <h1>{pageCopy[view].title}</h1>
              <p>{pageCopy[view].subtitle}</p>
            </div>
          </section>

          {view === 'inicio' && <Dashboard
            data={data}
            activeSprint={activeSprint}
            upcomingMeetings={upcomingMeetings}
            commits={commits}
            onOpenView={setView}
            onCreateSprint={() => setModal({ kind: 'sprint' })}
            onCreateMeeting={() => setModal({ kind: 'meeting' })}
            onToggleMeeting={toggleMeeting}
          />}
          {view === 'historias' && <StoriesPage
            stories={filteredStories}
            query={searchText}
            onQuery={setSearchText}
            onChange={changeStory}
            onAddTask={addStoryTask}
            onToggleTask={toggleStoryTask}
            onRemoveTask={removeStoryTask}
            onAddUpdate={(storyId) => setModal({ kind: 'advance', storyId })}
          />}
          {view === 'reuniones' && <MeetingsPage meetings={data.meetings} onCreate={() => setModal({ kind: 'meeting' })} onToggle={toggleMeeting} />}
          {view === 'commits' && <CommitsPage commits={commits} state={commitState} loading={refreshingCommits} onRefresh={() => void loadCommits()} />}
          {view === 'sprints' && <SprintsPage sprints={data.sprints} stories={data.stories} activeSprint={activeSprint} onCreate={() => setModal({ kind: 'sprint' })} onFinish={finishSprint} />}
        </div>
      </main>
      <div className={`save-indicator ${saveState}`} role="status">{saveState === 'saving' ? 'Guardando…' : saveState === 'saved' ? `Guardado · ${teamMember.name}` : saveState === 'loading' ? 'Conectando…' : 'Error de guardado'}</div>

      {modal && <Modal onClose={() => setModal(null)}>
        {modal.kind === 'meeting' && <MeetingForm onCancel={() => setModal(null)} onSave={addMeeting} />}
        {modal.kind === 'sprint' && <SprintForm stories={data.stories} onCancel={() => setModal(null)} onSave={addSprint} />}
        {modal.kind === 'advance' && modal.storyId && <UpdateForm story={data.stories.find((item) => item.id === modal.storyId)!} onCancel={() => setModal(null)} onSave={addUpdate} />}
      </Modal>}
    </div> : <main className="login-screen"><form className="login-card" onSubmit={login}><img src="/rupi-logo.jpg" alt="" /><span className="eyebrow">ESPACIO DE EQUIPO</span><h1>Entrar a Rupi</h1><p>Usa el código compartido del equipo para abrir el tablero.</p><label>Tu nombre<select name="memberId" defaultValue="jesus">{members.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></label><label>Código de acceso<input type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" required /></label>{authError && <p className="login-error" role="alert">{authError}</p>}<button className="primary-button" type="submit">Continuar <ArrowRight size={16} /></button></form></main>
  )
}

function Dashboard({
  data, activeSprint, upcomingMeetings, commits, onOpenView, onCreateSprint, onCreateMeeting, onToggleMeeting,
}: {
  data: ScrumData
  activeSprint?: Sprint
  upcomingMeetings: ScrumMeeting[]
  commits: Commit[]
  onOpenView: (view: ViewId) => void
  onCreateSprint: () => void
  onCreateMeeting: () => void
  onToggleMeeting: (id: string) => void
}) {
  const working = data.stories.filter((story) => story.status === 'En progreso' || story.status === 'En revisión').length
  const allTasks = data.stories.flatMap((story) => story.tasks)
  const openTasks = allTasks.filter((task) => !task.completed).length
  const completedTasks = allTasks.length - openTasks
  const nextMeeting = upcomingMeetings[0]

  return <>
    <section className="welcome-banner">
      <div className="welcome-copy">
        <span className="welcome-kicker"><Sparkles size={14} /> CICLO DE TRABAJO</span>
        <h2>Construyamos Rupi, <em>en equipo.</em></h2>
        <p>Coordinen sus reuniones, compartan avances y conviertan las ideas en entregas.</p>
        <div className="welcome-actions">
          <button className="button button-light" type="button" onClick={onCreateMeeting}><CalendarDays size={16} />Programar reunión</button>
          <button className="button button-glass" type="button" onClick={() => onOpenView('historias')}>Ver historias <ArrowRight size={16} /></button>
        </div>
      </div>
      <div className="welcome-art" aria-hidden="true">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <img src="/rupi-logo.jpg" alt="" />
        <span className="art-caption">IDEAS QUE<br />VAN TOMANDO FORMA</span>
      </div>
      <div className="welcome-corner"><span>01</span><i /></div>
    </section>

    <section className="metric-grid" aria-label="Trabajo del equipo">
      <Metric icon={<CircleDot size={18} />} label="Historias activas" value={`${working}`} note="En progreso o revisión" color="green" />
      <Metric icon={<ListTodo size={18} />} label="Tareas pendientes" value={`${openTasks}`} note="Desglose de historias" color="gold" />
      <Metric icon={<CheckCircle2 size={18} />} label="Tareas terminadas" value={`${completedTasks}`} note={`De ${allTasks.length} tareas creadas`} color="blue" />
    </section>

    <div className="dashboard-grid">
      <div className="dashboard-main-column">
        <section className="panel sprint-panel">
          <PanelHeading icon={<Flag size={17} />} eyebrow="PLAN DE TRABAJO" title={activeSprint ? activeSprint.name : 'Aún no hay sprint activo'} action={activeSprint ? <span className="status-pill status-active"><span />En curso</span> : undefined} />
          {activeSprint ? <div className="active-sprint-body">
            <p>{activeSprint.goal}</p>
            <div className="sprint-detail-row"><span><CalendarDays size={15} />{activeSprint.startsOn} — {activeSprint.endsOn}</span><span><ListChecks size={15} />{activeSprint.storyIds.length} historias comprometidas</span></div>
            <button className="text-button" type="button" onClick={() => onOpenView('sprints')}>Ver sprint <ArrowRight size={15} /></button>
          </div> : <div className="empty-sprint">
            <div className="sprint-illustration"><Flag size={27} /><Sparkles className="illustration-spark spark-a" size={15} /><Sparkles className="illustration-spark spark-b" size={12} /></div>
            <div><b>El equipo todavía no ha iniciado su primer sprint.</b><p>Cuando estén listos, definan el objetivo, las fechas y las historias que quieren completar.</p></div>
            <button className="button button-primary" type="button" onClick={onCreateSprint}><Plus size={16} />Planificar sprint</button>
          </div>}
        </section>

        <section className="panel story-panel">
          <PanelHeading icon={<ListChecks size={17} />} eyebrow="BACKLOG DEL PRODUCTO" title="Historias de usuario" action={<button className="text-button" type="button" onClick={() => onOpenView('historias')}>Ver todas <ArrowRight size={15} /></button>} />
          <div className="story-preview-list">{data.stories.slice(0, 4).map((story) => <StoryPreview key={story.id} story={story} />)}</div>
        </section>

        <section className="panel updates-panel">
          <PanelHeading icon={<Radio size={17} />} eyebrow="SEGUIMIENTO" title="Últimos avances" action={<span className="subtle-label">ACTIVIDAD DEL EQUIPO</span>} />
          {data.updates.length ? <div className="updates-list">{data.updates.slice(0, 4).map((update) => <UpdateRow key={update.id} update={update} stories={data.stories} />)}</div> : <EmptyInline title="Todavía no hay avances registrados" copy="Al actualizar una historia, el equipo podrá ver aquí qué cambió." action={<button className="text-button" type="button" onClick={() => onOpenView('historias')}>Ir a historias <ArrowRight size={15} /></button>} />}
        </section>
      </div>

      <aside className="dashboard-side-column">
        <section className="panel meetings-panel">
          <PanelHeading icon={<CalendarDays size={17} />} eyebrow="AGENDA" title="Próximas reuniones" />
          {nextMeeting ? <div className="next-meeting-card">
            <div className="meeting-date"><span>{formatDate(nextMeeting.startsAt, { month: 'short' }).toUpperCase()}</span><b>{formatDate(nextMeeting.startsAt, { day: '2-digit' })}</b></div>
            <div className="meeting-info"><span className="meeting-type">{nextMeeting.type}</span><b>{nextMeeting.title}</b><small><Clock3 size={13} />{formatDate(nextMeeting.startsAt, { hour: '2-digit', minute: '2-digit' })}</small></div>
            <a className="meet-join" href={nextMeeting.meetUrl} target="_blank" rel="noreferrer"><Video size={15} />Entrar</a>
            <div className="meeting-attendees">{nextMeeting.attendees.map((id) => <Avatar key={id} memberId={id} small />)}</div>
            <button className="meeting-done" type="button" onClick={() => onToggleMeeting(nextMeeting.id)}><Check size={14} /> Marcar realizada</button>
          </div> : <EmptyInline title="No hay reuniones programadas" copy="Usa Programar reunión para coordinar el próximo encuentro del equipo." />}
          {upcomingMeetings.length > 1 && <button className="text-button full-width" type="button" onClick={() => onOpenView('reuniones')}>Ver {upcomingMeetings.length - 1} más <ArrowRight size={15} /></button>}
        </section>

        <section className="panel commits-panel">
          <PanelHeading icon={<GitCommitHorizontal size={17} />} eyebrow="GITHUB · MAIN" title="Últimos commits" action={<button className="text-button" type="button" onClick={() => onOpenView('commits')}>Ver historial <ArrowRight size={15} /></button>} />
          <div className="commit-mini-list">{commits.slice(0, 3).map((commit) => <CommitRow key={commit.sha} commit={commit} compact />)}</div>
        </section>

      </aside>
    </div>
  </>
}

function Metric({ icon, label, value, note, color }: { icon: ReactNode; label: string; value: string; note: string; color: string }) {
  return <article className="metric-card"><span className={`metric-icon ${color}`}>{icon}</span><div className="metric-copy"><span>{label}</span><b>{value}</b><small>{note}</small></div></article>
}

function PanelHeading({ icon, eyebrow, title, action }: { icon: ReactNode; eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="panel-heading"><div className="panel-heading-title"><span className="panel-heading-icon">{icon}</span><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div></div>{action}</div>
}

function MemberRow({ memberId }: { memberId: MemberId }) {
  const member = initialsName(memberId)!
  return <div className="member-row"><Avatar memberId={memberId} small /><span><b>{member.name}</b></span></div>
}

function Avatar({ memberId, small = false }: { memberId: MemberId; small?: boolean }) {
  const member = initialsName(memberId)!
  return <span className={`avatar ${member.color} ${small ? 'avatar-small' : ''}`} title={member.name}>{member.initials}</span>
}

function StoryPreview({ story }: { story: UserStory }) {
  return <div className="story-preview"><span className={`story-id priority-${priorityClass(story.priority)}`}>{story.id}</span><div className="story-preview-copy"><b>{story.title}</b><small>{story.epic}</small></div><span className={`status-pill status-${story.status.toLowerCase().replace(' ', '-')}`}><span />{displayStatus(story.status)}</span><div className="story-progress-mini"><span style={{ width: `${story.progress}%` }} /></div></div>
}

function EmptyInline({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <div className="empty-inline"><span className="empty-symbol"><CalendarDays size={19} /></span><b>{title}</b><p>{copy}</p>{action}</div>
}

function StoriesPage({ stories, query, onQuery, onChange, onAddTask, onToggleTask, onRemoveTask, onAddUpdate }: {
  stories: UserStory[]
  query: string
  onQuery: (value: string) => void
  onChange: (id: string, changes: Partial<UserStory>) => void
  onAddTask: (storyId: string, title: string) => void
  onToggleTask: (storyId: string, taskId: string) => void
  onRemoveTask: (storyId: string, taskId: string) => void
  onAddUpdate: (id: string) => void
}) {
  const columns = storyStatuses.map((status) => ({ status, stories: stories.filter((story) => story.status === status) }))
  return <>
    <section className="page-toolbar"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar historia o épica" /></label><div className="toolbar-hint"><span className="state-dot" />{stories.length} historias en el backlog</div></section>
    <div className="stories-board">{columns.map(({ status, stories: items }) => <section className="story-column" key={status}>
      <div className="column-heading"><span className={`column-dot ${status.toLowerCase().replace(' ', '-')}`} /><b>{displayStatus(status)}</b><span>{items.length}</span></div>
      <div className="column-cards">{items.length ? items.map((story) => <StoryCard key={story.id} story={story} onChange={onChange} onAddTask={onAddTask} onToggleTask={onToggleTask} onRemoveTask={onRemoveTask} onAddUpdate={onAddUpdate} />) : <div className="column-empty">No hay historias aquí</div>}</div>
    </section>)}</div>
    <p className="storage-note"><CheckCircle2 size={15} /> Los cambios de este prototipo se guardan en este navegador.</p>
  </>
}

function StoryCard({ story, onChange, onAddTask, onToggleTask, onRemoveTask, onAddUpdate }: { story: UserStory; onChange: (id: string, changes: Partial<UserStory>) => void; onAddTask: (storyId: string, title: string) => void; onToggleTask: (storyId: string, taskId: string) => void; onRemoveTask: (storyId: string, taskId: string) => void; onAddUpdate: (id: string) => void }) {
  const completedTasks = story.tasks.filter((task) => task.completed).length
  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('task') ?? '').trim()
    if (!title) return
    onAddTask(story.id, title)
    event.currentTarget.reset()
  }

  return <article className="story-card"><div className="story-card-top"><span className={`story-id priority-${priorityClass(story.priority)}`}>{story.id}</span><span className={`priority-tag priority-${priorityClass(story.priority)}`}>{story.priority === 'Sin definir' ? 'Sin prioridad' : story.priority}</span></div><h3>{story.title}</h3><details className="story-full"><summary>Ver descripción</summary><p>{story.description}</p></details><span className="epic-tag">{story.epic}</span><div className="story-card-progress"><div><span>Avance registrado</span><b>{story.progress}%</b></div><div className="progress-track"><span style={{ width: `${story.progress}%` }} /></div></div>
    <div className="story-card-controls"><label><span>Responsable</span><select value={story.assignee ?? ''} onChange={(event) => onChange(story.id, { assignee: (event.target.value || null) as MemberId | null })}><option value="">Sin asignar</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label><span>Estado</span><select value={story.status} onChange={(event) => { const status = event.target.value as StoryStatus; onChange(story.id, { status, progress: status === 'Pendiente' ? 0 : status === 'Hecha' ? 100 : status === 'En revisión' ? Math.max(story.progress, 75) : Math.max(story.progress, 25) }) }}>{storyStatuses.map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}</select></label></div>
    <details className="story-tasks">
      <summary><ListTodo size={14} /><span>Tareas</span><b>{completedTasks}/{story.tasks.length}</b></summary>
      <div className="story-task-content">
        {story.tasks.length ? <ul>{story.tasks.map((task) => <li key={task.id} className={task.completed ? 'task-complete' : ''}>
          <label><input type="checkbox" checked={task.completed} onChange={() => onToggleTask(story.id, task.id)} /><span>{task.title}</span></label>
          <button type="button" aria-label={`Eliminar tarea: ${task.title}`} title="Eliminar tarea" onClick={() => onRemoveTask(story.id, task.id)}><X size={13} /></button>
        </li>)}</ul> : <p>Divide esta historia en pasos concretos.</p>}
        <form onSubmit={submitTask}><input name="task" aria-label={`Nueva tarea para ${story.id}`} placeholder="Añadir una tarea" maxLength={100} /><button type="submit" aria-label="Añadir tarea"><Plus size={15} /></button></form>
      </div>
    </details>
    <button className="update-button" type="button" onClick={() => onAddUpdate(story.id)}><Activity size={14} /> Registrar avance</button>
  </article>
}

function MeetingsPage({ meetings, onCreate, onToggle }: { meetings: ScrumMeeting[]; onCreate: () => void; onToggle: (id: string) => void }) {
  const sorted = [...meetings].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  return <section className="panel full-panel meetings-view-panel">
    {sorted.length ? <><div className="meetings-page-actions"><button className="button button-primary" type="button" onClick={onCreate}><Plus size={16} />Agendar reunión</button></div><div className="meeting-list">{sorted.map((meeting) => <article className={`meeting-row ${meeting.completed ? 'is-completed' : ''}`} key={meeting.id}><div className="meeting-date-large"><span>{formatDate(meeting.startsAt, { month: 'short' }).toUpperCase()}</span><b>{formatDate(meeting.startsAt, { day: '2-digit' })}</b><small>{formatDate(meeting.startsAt, { weekday: 'short' })}</small></div><div className="meeting-row-content"><div className="meeting-row-title"><span className="meeting-type">{meeting.type}</span><span className="meeting-time"><Clock3 size={14} />{formatDate(meeting.startsAt, { hour: '2-digit', minute: '2-digit' })}</span></div><h3>{meeting.title}</h3><p>{meeting.agenda || 'Sin agenda agregada.'}</p><div className="meeting-row-members">{meeting.attendees.map((id) => <span key={id}><Avatar memberId={id} small />{initialsName(id)?.name}</span>)}</div></div><div className="meeting-row-actions">{meeting.completed ? <span className="status-pill status-done"><CheckCircle2 size={13} />Realizada</span> : <><a className="button button-outline button-small" href={meeting.meetUrl} target="_blank" rel="noreferrer"><Video size={15} />Abrir Meet</a><button className="text-button" type="button" onClick={() => onToggle(meeting.id)}>Marcar realizada</button></>}</div></article>)}</div></> : <EmptyInline title="La agenda está lista para empezar" copy="Programa una reunión, agrega el enlace de Google Meet e invita a Jesús, Erick y José." action={<button className="button button-primary" type="button" onClick={onCreate}><Plus size={16} />Agendar primera reunión</button>} />}
  </section>
}

function CommitsPage({ commits, state, loading, onRefresh }: { commits: Commit[]; state: string; loading: boolean; onRefresh: () => void }) {
  return <>
    <section className="repo-banner"><div className="repo-avatar"><FolderGit2 size={23} /></div><div><span className="eyebrow">REPOSITORIO</span><h2>Jesus-Rocha-B / Rupi</h2><a href={repoUrl} target="_blank" rel="noreferrer">github.com/Jesus-Rocha-B/Rupi <ExternalLink size={13} /></a></div><button className="icon-button refresh-button" type="button" aria-label="Actualizar commits" onClick={onRefresh} disabled={loading}><RotateCw size={16} className={loading ? 'spinning' : ''} /></button></section>
    <section className="panel full-panel commit-history-panel"><div className="section-toolbar"><PanelHeading icon={<GitCommitHorizontal size={17} />} eyebrow="RAMA PRINCIPAL · MAIN" title="Historial reciente" /><span className="subtle-label">{commits.length} COMMITS</span></div><div className="commit-timeline">{commits.map((commit) => <CommitRow key={commit.sha} commit={commit} />)}</div><div className="github-footnote"><Code2 size={15} />{state === 'connected' ? 'Datos consultados directamente desde la API pública de GitHub.' : 'No se pudo consultar GitHub; se muestran los últimos commits conocidos del proyecto.'}<a href={`${repoUrl}/commits/main`} target="_blank" rel="noreferrer">Abrir en GitHub <ArrowRight size={14} /></a></div></section>
  </>
}

function CommitRow({ commit, compact = false }: { commit: Commit; compact?: boolean }) {
  return <article className={`commit-row ${compact ? 'compact' : ''}`}><span className="commit-line-icon"><GitCommitHorizontal size={16} /></span><div className="commit-main"><a href={commit.url} target="_blank" rel="noreferrer" className="commit-message">{commit.message}</a><div className="commit-meta"><span className="commit-author-avatar">{commit.author.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><b>{commit.author}</b><span>·</span><time>{formatDate(commit.date, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div></div><a className="commit-sha" href={commit.url} target="_blank" rel="noreferrer">{commit.sha}<ExternalLink size={12} /></a></article>
}

function SprintsPage({ sprints, stories, activeSprint, onCreate, onFinish }: { sprints: Sprint[]; stories: UserStory[]; activeSprint?: Sprint; onCreate: () => void; onFinish: (id: string) => void }) {
  const pastSprints = sprints.filter((sprint) => sprint.completed)
  const futureSprints = sprints.filter((sprint) => !sprint.completed && sprint.id !== activeSprint?.id)
  return <>
    {!sprints.length && <section className="sprint-empty-page"><div className="sprint-empty-art"><div className="empty-flag"><Flag size={38} /></div><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-dot dot-three" /></div><span className="eyebrow">PRIMER CICLO DE TRABAJO</span><h2>Cuando estén listos,<br />comienza el primer sprint.</h2><p>Definan un objetivo, el tiempo que tienen y las historias que pueden completar. El backlog seguirá disponible para el resto del trabajo.</p><button className="button button-primary" type="button" onClick={onCreate}><Plus size={17} />Crear un sprint</button><div className="sprint-empty-note"><CheckCircle2 size={15} />Todavía no hay sprints registrados</div></section>}
    {activeSprint && <section className="panel full-panel sprint-detail-panel"><div className="section-toolbar"><PanelHeading icon={<Flag size={17} />} eyebrow="SPRINT ACTIVO" title={activeSprint.name} /><button className="button button-outline button-small" type="button" onClick={() => onFinish(activeSprint.id)}><CheckCircle2 size={15} />Finalizar sprint</button></div><p className="sprint-goal">{activeSprint.goal}</p><div className="sprint-date-strip"><span><CalendarDays size={16} />{activeSprint.startsOn} — {activeSprint.endsOn}</span><span><ListChecks size={16} />{activeSprint.storyIds.length} historias</span></div><div className="sprint-story-list">{stories.filter((story) => activeSprint.storyIds.includes(story.id)).map((story) => <StoryPreview key={story.id} story={story} />)}</div></section>}
    {futureSprints.length > 0 && <section className="panel full-panel sprint-detail-panel"><PanelHeading icon={<CalendarDays size={17} />} eyebrow="PRÓXIMOS CICLOS" title="Sprints planificados" />{futureSprints.map((sprint) => <div className="planned-sprint-row" key={sprint.id}><div><b>{sprint.name}</b><p>{sprint.goal}</p></div><span>{sprint.startsOn} — {sprint.endsOn}</span></div>)}</section>}
    {pastSprints.length > 0 && <section className="panel full-panel sprint-detail-panel"><PanelHeading icon={<CheckCircle2 size={17} />} eyebrow="TRABAJO COMPLETADO" title="Sprints anteriores" />{pastSprints.map((sprint) => <div className="planned-sprint-row" key={sprint.id}><div><b>{sprint.name}</b><p>{sprint.goal}</p></div><span>{sprint.startsOn} — {sprint.endsOn}</span></div>)}</section>}
    {sprints.length > 0 && <div className="sprint-add-row"><span>El equipo puede planificar más de un ciclo.</span><button className="button button-outline" type="button" onClick={onCreate}><Plus size={16} />Planificar otro sprint</button></div>}
  </>
}

function UpdateRow({ update, stories }: { update: WorkUpdate; stories: UserStory[] }) {
  const story = stories.find((item) => item.id === update.storyId)
  return <article className="update-row"><Avatar memberId={update.memberId} small /><div><b>{initialsName(update.memberId)?.name} actualizó {update.storyId}</b><p>{update.note}</p><small>{story?.title ?? 'Historia'}</small></div><span className="update-percent">{update.progress}%</span></article>
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onClick={onClose} role="presentation"><section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>{children}</section></div>
}

function MeetingForm({ onCancel, onSave }: { onCancel: () => void; onSave: (meeting: ScrumMeeting) => void }) {
  const minDateTime = localDateTimeValue()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const meeting: ScrumMeeting = {
      id: crypto.randomUUID(),
      title: String(form.get('title')),
      type: String(form.get('type')),
      startsAt: String(form.get('startsAt')),
      meetUrl: String(form.get('meetUrl')),
      attendees: form.getAll('attendees').map(String) as MemberId[],
      agenda: String(form.get('agenda')),
      completed: false,
    }
    onSave(meeting)
  }
  return <form className="modal-form" onSubmit={submit}><ModalHeading eyebrow="COORDINACIÓN DEL EQUIPO" title="Agendar una reunión" copy="Define el encuentro y comparte el enlace para que todos puedan unirse." onClose={onCancel} />
    <label className="field-label">Nombre de la reunión<input name="title" placeholder="Ej. Revisión de avances" required maxLength={100} /></label>
    <div className="form-grid"><label className="field-label">Tipo<select name="type" defaultValue="Daily Scrum"><option>Daily Scrum</option><option>Planificación</option><option>Revisión</option><option>Retrospectiva</option><option>Coordinación</option></select></label><label className="field-label">Fecha y hora<input name="startsAt" type="datetime-local" min={minDateTime} required /></label></div>
    <label className="field-label">Enlace de Google Meet<input name="meetUrl" type="url" placeholder="https://meet.google.com/xxx-yyyy-zzz" pattern="https://meet\.google\.com/.*" title="Pega un enlace de meet.google.com" required /></label>
    <label className="field-label">Agenda <span className="field-optional">OPCIONAL</span><textarea name="agenda" placeholder="Temas a conversar, bloqueos o decisiones pendientes…" rows={3} maxLength={500} /></label>
    <fieldset className="attendees-field"><legend>Integrantes invitados</legend><div>{members.map((member) => <label key={member.id}><input type="checkbox" name="attendees" value={member.id} defaultChecked /><Avatar memberId={member.id} small /><span>{member.name}</span></label>)}</div></fieldset>
    <FormActions onCancel={onCancel} submitLabel="Guardar reunión" />
  </form>
}

function SprintForm({ stories, onCancel, onSave }: { stories: UserStory[]; onCancel: () => void; onSave: (sprint: Sprint) => void }) {
  const [today] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }))
  const [later] = useState(() => new Date(Date.now() + 13 * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Lima' }))
  const [startsOn, setStartsOn] = useState(today)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSave({
      id: crypto.randomUUID(),
      name: String(form.get('name')),
      goal: String(form.get('goal')),
      startsOn: String(form.get('startsOn')),
      endsOn: String(form.get('endsOn')),
      storyIds: form.getAll('storyIds').map(String),
      completed: false,
    })
  }
  return <form className="modal-form" onSubmit={submit}><ModalHeading eyebrow="PLANIFICACIÓN" title="Preparar un sprint" copy="Un sprint necesita una meta clara y un grupo manejable de historias." onClose={onCancel} />
    <label className="field-label">Nombre<input name="name" defaultValue={`Sprint ${new Date().getMonth() + 1}`} required maxLength={60} /></label>
    <label className="field-label">Objetivo del sprint<textarea name="goal" placeholder="¿Qué resultado concreto quiere lograr el equipo?" rows={2} required maxLength={250} /></label>
    <div className="form-grid"><label className="field-label">Inicio<input name="startsOn" type="date" value={startsOn} min={today} onChange={(event) => setStartsOn(event.target.value)} required /></label><label className="field-label">Fin<input name="endsOn" type="date" defaultValue={later < startsOn ? startsOn : later} min={startsOn} required /></label></div>
    <fieldset className="sprint-stories-field"><legend>Historias candidatas <span>Elige las que entran al ciclo</span></legend><div>{stories.map((story) => <label key={story.id}><input type="checkbox" name="storyIds" value={story.id} defaultChecked={story.status !== 'Hecha'} /><span className="story-id">{story.id}</span><span>{story.title}</span></label>)}</div></fieldset>
    <FormActions onCancel={onCancel} submitLabel="Crear sprint" />
  </form>
}

function UpdateForm({ story, onCancel, onSave }: { story: UserStory; onCancel: () => void; onSave: (update: WorkUpdate) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSave({ id: crypto.randomUUID(), memberId: String(form.get('memberId')) as MemberId, storyId: story.id, note: String(form.get('note')), progress: Number(form.get('progress')), createdAt: new Date().toISOString() })
  }
  return <form className="modal-form" onSubmit={submit}><ModalHeading eyebrow={story.id} title="Registrar avance" copy={story.title} onClose={onCancel} />
    <label className="field-label">¿Quién registra el avance?<select name="memberId" defaultValue={story.assignee ?? 'jesus'}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
    <label className="field-label">Descripción<textarea name="note" placeholder="¿Qué se completó, qué sigue o qué bloquea esta historia?" rows={4} required maxLength={500} /></label>
    <label className="field-label">Avance aproximado <select name="progress" defaultValue={story.progress}><option value="0">0% · Aún por iniciar</option><option value="25">25% · Primeros pasos</option><option value="50">50% · En desarrollo</option><option value="75">75% · En revisión</option><option value="100">100% · Completada</option></select></label>
    <FormActions onCancel={onCancel} submitLabel="Guardar avance" />
  </form>
}

function ModalHeading({ eyebrow, title, copy, onClose }: { eyebrow: string; title: string; copy: string; onClose: () => void }) {
  return <div className="modal-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{copy}</p></div><button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar ventana"><X size={18} /></button></div>
}

function FormActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return <div className="form-actions"><button className="button button-plain" type="button" onClick={onCancel}>Cancelar</button><button className="button button-primary" type="submit"><Check size={16} />{submitLabel}</button></div>
}

export default App
