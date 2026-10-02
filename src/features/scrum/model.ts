import { backlog } from './backlog'
import { taskPlan } from './task-plan'

export type MemberId = 'jesus' | 'erick' | 'jose'
export type StoryStatus = 'Pendiente' | 'En progreso' | 'En revisión' | 'Hecha'
export type ViewId = 'inicio' | 'historias' | 'reuniones' | 'commits' | 'sprints'

export type Member = {
  id: MemberId
  name: string
  initials: string
  color: string
}

export type UserStory = {
  id: string
  title: string
  description: string
  epic: string
  assignee: MemberId | null
  status: StoryStatus
  progress: number
  priority: 'Muy alta' | 'Alta' | 'Media' | 'Sin definir'
  tasks: StoryTask[]
}

export type StoryTask = {
  id: string
  title: string
  completed: boolean
}

export type ScrumMeeting = {
  id: string
  title: string
  type: string
  startsAt: string
  meetUrl: string
  attendees: MemberId[]
  agenda: string
  completed: boolean
}

export type Sprint = {
  id: string
  name: string
  goal: string
  startsOn: string
  endsOn: string
  storyIds: string[]
  completed: boolean
}

export type WorkUpdate = {
  id: string
  memberId: MemberId
  storyId: string
  note: string
  progress: number
  createdAt: string
}

export type ScrumData = {
  stories: UserStory[]
  meetings: ScrumMeeting[]
  sprints: Sprint[]
  updates: WorkUpdate[]
}

export const members: Member[] = [
  { id: 'jesus', name: 'Jesús Rocha', initials: 'JR', color: 'coral' },
  { id: 'erick', name: 'Erick Gamarra', initials: 'EG', color: 'green' },
  { id: 'jose', name: 'José Contreras', initials: 'JC', color: 'gold' },
]

export const storyStatuses: StoryStatus[] = ['Pendiente', 'En progreso', 'En revisión', 'Hecha']

export const initialData: ScrumData = {
  stories: backlog.map((story) => ({
    ...story,
    tasks: (taskPlan[story.id] ?? []).map((title, index) => ({
      id: `${story.id}-T${index + 1}`,
      title,
      completed: false,
    })),
  })),
  meetings: [],
  sprints: [],
  updates: [],
}

const storageKey = 'rupi.scrum.workspace.v3'
const legacyStorageKey = 'rupi.scrum.workspace.v2'

export function loadScrumData(): ScrumData {
  try {
    const saved = localStorage.getItem(storageKey)
    const legacySaved = saved ? null : localStorage.getItem(legacyStorageKey)
    const source = saved ?? legacySaved
    if (!source) return initialData
    const parsed = JSON.parse(source) as Partial<ScrumData>
    const migrating = !saved && Boolean(legacySaved)
    return {
      stories: Array.isArray(parsed.stories)
        ? parsed.stories.map((story) => {
          const tasks = Array.isArray(story.tasks) ? story.tasks : []
          return {
            ...story,
            tasks: migrating && tasks.length === 0
              ? (taskPlan[story.id] ?? []).map((title, index) => ({ id: `${story.id}-T${index + 1}`, title, completed: false }))
              : tasks,
          }
        }) as UserStory[]
        : initialData.stories,
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
      sprints: Array.isArray(parsed.sprints) ? parsed.sprints : [],
      updates: Array.isArray(parsed.updates) ? parsed.updates : [],
    }
  } catch {
    return initialData
  }
}

export function saveScrumData(data: ScrumData) {
  localStorage.setItem(storageKey, JSON.stringify(data))
}
