import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import mysql from 'mysql2/promise'
import 'dotenv/config'

const app = express()
const port = Number(process.env.PORT || 3000)
const dirname = path.dirname(fileURLToPath(import.meta.url))
const production = process.env.NODE_ENV === 'production'
const sessionCookie = 'scrumrupi_session'
const loginAttempts = new Map()
const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null
const pool = mysql.createPool({
  host: databaseUrl?.hostname,
  port: Number(databaseUrl?.port || 3306),
  user: databaseUrl ? decodeURIComponent(databaseUrl.username) : undefined,
  password: databaseUrl ? decodeURIComponent(databaseUrl.password) : undefined,
  database: databaseUrl?.pathname.slice(1),
  waitForConnections: true,
  connectionLimit: 5,
  timezone: 'Z',
  ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: true },
})

if (!process.env.DATABASE_URL || !process.env.TEAM_ACCESS_CODE || !process.env.SESSION_SECRET) {
  console.error('Configura DATABASE_URL, TEAM_ACCESS_CODE y SESSION_SECRET antes de iniciar el servidor.')
  process.exit(1)
}
if (process.env.TEAM_ACCESS_CODE.length < 24 || process.env.SESSION_SECRET.length < 32) {
  console.error('TEAM_ACCESS_CODE debe tener 24 caracteres y SESSION_SECRET al menos 32.')
  process.exit(1)
}

app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))
if (production) app.set('trust proxy', 1)
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }) }
  catch { res.status(503).json({ status: 'unavailable' }) }
})

async function initializeDatabase() {
  const schema = await fs.readFile(path.join(dirname, 'schema.sql'), 'utf8')
  for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) await pool.query(statement)
  await pool.query(`INSERT INTO workspace_meta (id, version) VALUES (1, 0) ON DUPLICATE KEY UPDATE id = id`)
  const people = [['jesus', 'Jesús Rocha', 'JR', 'coral'], ['erick', 'Erick Gamarra', 'EG', 'green'], ['jose', 'José Contreras', 'JC', 'gold']]
  for (const person of people) await pool.query('INSERT INTO team_members (id, name, initials, color) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), initials = VALUES(initials), color = VALUES(color)', person)
}

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(data).digest('base64url')
  return `${data}.${signature}`
}

function readSession(req, res, next) {
  const token = req.cookies?.[sessionCookie] || parseCookies(req.headers.cookie)[sessionCookie]
  if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar.' })
  const [payload, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload || '').digest()
  let actual
  try { actual = Buffer.from(signature || '', 'base64url') } catch { actual = Buffer.alloc(0) }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return res.status(401).json({ error: 'La sesión no es válida.' })
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (claims.exp < Date.now() || !['jesus', 'erick', 'jose'].includes(claims.memberId)) throw new Error('expired')
    req.memberId = claims.memberId
    next()
  } catch { return res.status(401).json({ error: 'La sesión venció. Ingresa otra vez.' }) }
}

function parseCookies(cookie = '') {
  return Object.fromEntries(cookie.split(';').map((part) => part.trim().split(/=(.*)/s).slice(0, 2)).filter(([key]) => key).map(([key, value]) => [key, decodeURIComponent(value || '')]))
}

app.get('/api/session', readSession, async (req, res) => {
  const [rows] = await pool.query('SELECT id, name FROM team_members WHERE id = ?', [req.memberId])
  res.json({ member: rows[0] })
})

app.post('/api/login', async (req, res) => {
  const remoteAddress = req.ip || 'unknown'
  const attempt = loginAttempts.get(remoteAddress) || { count: 0, resetAt: Date.now() + 10 * 60 * 1000 }
  if (attempt.resetAt <= Date.now()) { attempt.count = 0; attempt.resetAt = Date.now() + 10 * 60 * 1000 }
  if (attempt.count >= 10) return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' })
  const { accessCode, memberId } = req.body || {}
  const supplied = Buffer.from(typeof accessCode === 'string' ? accessCode : '')
  const expected = Buffer.from(process.env.TEAM_ACCESS_CODE)
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    loginAttempts.set(remoteAddress, { ...attempt, count: attempt.count + 1 })
    return res.status(401).json({ error: 'El código de acceso no es correcto.' })
  }
  loginAttempts.delete(remoteAddress)
  if (!['jesus', 'erick', 'jose'].includes(memberId)) return res.status(400).json({ error: 'Selecciona un integrante del equipo.' })
  const [rows] = await pool.query('SELECT id, name FROM team_members WHERE id = ?', [memberId])
  res.setHeader('Set-Cookie', `${sessionCookie}=${sign({ memberId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${production ? '; Secure' : ''}`)
  res.json({ member: rows[0] })
})

app.post('/api/logout', (_req, res) => {
  res.setHeader('Set-Cookie', `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${production ? '; Secure' : ''}`)
  res.status(204).end()
})

app.get('/api/workspace', readSession, async (_req, res) => {
  const [meta] = await pool.query('SELECT version FROM workspace_meta WHERE id = 1')
  const [[storyRows], [taskRows], [meetingRows], [attendeeRows], [sprintRows], [sprintStoryRows], [updateRows]] = await Promise.all([
    pool.query('SELECT * FROM user_stories ORDER BY id'), pool.query('SELECT * FROM story_tasks ORDER BY story_id, position'),
    pool.query('SELECT * FROM meetings ORDER BY starts_at'), pool.query('SELECT * FROM meeting_attendees'),
    pool.query('SELECT * FROM sprints ORDER BY starts_on'), pool.query('SELECT * FROM sprint_stories'),
    pool.query('SELECT * FROM work_updates ORDER BY created_at DESC'),
  ])
  const tasksByStory = new Map()
  for (const task of taskRows) {
    const tasks = tasksByStory.get(task.story_id) || []
    tasks.push({ id: task.id, title: task.title, completed: Boolean(task.completed) })
    tasksByStory.set(task.story_id, tasks)
  }
  const attendeesByMeeting = new Map()
  for (const attendee of attendeeRows) {
    const attendees = attendeesByMeeting.get(attendee.meeting_id) || []
    attendees.push(attendee.member_id)
    attendeesByMeeting.set(attendee.meeting_id, attendees)
  }
  const storiesBySprint = new Map()
  for (const relation of sprintStoryRows) {
    const ids = storiesBySprint.get(relation.sprint_id) || []
    ids.push(relation.story_id)
    storiesBySprint.set(relation.sprint_id, ids)
  }
  res.json({ version: Number(meta[0].version), data: {
    stories: storyRows.map((story) => ({ id: story.id, title: story.title, description: story.description, epic: story.epic, assignee: story.assignee_id, status: story.status, progress: story.progress, priority: story.priority, tasks: tasksByStory.get(story.id) || [] })),
    meetings: meetingRows.map((meeting) => ({ id: meeting.id, title: meeting.title, type: meeting.type, startsAt: new Date(`${meeting.starts_at.toISOString().slice(0, 23)}Z`).toISOString(), meetUrl: meeting.meet_url, attendees: attendeesByMeeting.get(meeting.id) || [], agenda: meeting.agenda, completed: Boolean(meeting.completed) })),
    sprints: sprintRows.map((sprint) => ({ id: sprint.id, name: sprint.name, goal: sprint.goal, startsOn: sprint.starts_on.toISOString().slice(0, 10), endsOn: sprint.ends_on.toISOString().slice(0, 10), storyIds: storiesBySprint.get(sprint.id) || [], completed: Boolean(sprint.completed) })),
    updates: updateRows.map((update) => ({ id: update.id, memberId: update.member_id, storyId: update.story_id, note: update.note, progress: update.progress, createdAt: new Date(`${update.created_at.toISOString().slice(0, 23)}Z`).toISOString() })),
  } })
})

app.put('/api/workspace', readSession, async (req, res) => {
  const { version, data } = req.body || {}
  if (!Number.isSafeInteger(version) || !data || !Array.isArray(data.stories) || !Array.isArray(data.meetings) || !Array.isArray(data.sprints) || !Array.isArray(data.updates)) return res.status(400).json({ error: 'Los datos del espacio no tienen un formato válido.' })
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [[meta]] = await connection.query('SELECT version FROM workspace_meta WHERE id = 1 FOR UPDATE')
    if (Number(meta.version) !== version) {
      await connection.rollback()
      return res.status(409).json({ error: 'Otro integrante guardó cambios al mismo tiempo. Actualiza la página antes de continuar.' })
    }
    await connection.query('DELETE FROM work_updates')
    await connection.query('DELETE FROM sprint_stories')
    await connection.query('DELETE FROM sprints')
    await connection.query('DELETE FROM meetings')
    await connection.query('DELETE FROM user_stories')
    for (const s of data.stories) {
      await connection.query('INSERT INTO user_stories (id,title,description,epic,assignee_id,status,progress,priority) VALUES (?,?,?,?,?,?,?,?)', [s.id,s.title,s.description,s.epic,s.assignee,s.status,s.progress,s.priority])
      for (const [position, task] of (s.tasks || []).entries()) await connection.query('INSERT INTO story_tasks (id,story_id,title,completed,position) VALUES (?,?,?,?,?)', [task.id,s.id,task.title,Boolean(task.completed),position])
    }
    for (const m of data.meetings) {
      await connection.query('INSERT INTO meetings (id,title,type,starts_at,meet_url,agenda,completed) VALUES (?,?,?,?,?,?,?)', [m.id,m.title,m.type,new Date(m.startsAt),m.meetUrl,m.agenda,Boolean(m.completed)])
      for (const memberId of m.attendees || []) await connection.query('INSERT INTO meeting_attendees (meeting_id,member_id) VALUES (?,?)', [m.id,memberId])
    }
    for (const s of data.sprints) {
      await connection.query('INSERT INTO sprints (id,name,goal,starts_on,ends_on,completed) VALUES (?,?,?,?,?,?)', [s.id,s.name,s.goal,s.startsOn,s.endsOn,Boolean(s.completed)])
      for (const storyId of s.storyIds || []) await connection.query('INSERT INTO sprint_stories (sprint_id,story_id) VALUES (?,?)', [s.id,storyId])
    }
    for (const update of data.updates) await connection.query('INSERT INTO work_updates (id,member_id,story_id,note,progress,created_at) VALUES (?,?,?,?,?,?)', [update.id,update.memberId,update.storyId,update.note,update.progress,new Date(update.createdAt)])
    const nextVersion = version + 1
    await connection.query('UPDATE workspace_meta SET version = ? WHERE id = 1', [nextVersion])
    await connection.commit()
    res.json({ version: nextVersion })
  } catch (error) {
    await connection.rollback()
    console.error('No se pudo guardar el espacio Scrum:', error.message)
    res.status(500).json({ error: 'No se pudieron guardar los cambios. Intenta nuevamente.' })
  } finally { connection.release() }
})

if (production) {
  const distPath = path.resolve(dirname, '../dist')
  app.use(express.static(distPath, { index: false, maxAge: '1h' }))
  app.get('/{*path}', async (_req, res, next) => {
    try { res.send(await fs.readFile(path.join(distPath, 'index.html'), 'utf8')) } catch (error) { next(error) }
  })
}

await initializeDatabase()
app.listen(port, () => console.log(`ScrumRupi API escuchando en el puerto ${port}`))
