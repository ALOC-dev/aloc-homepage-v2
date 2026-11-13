export type ProjectFolder = {
  id: string
  label: string
}

export type SidebarItem = {
  id: string
  label: string
  folders: ProjectFolder[]
}

export const CURRENT_PROJECTS: SidebarItem[] = [
  {
    id: 'giut',
    label: '기웃',
    folders: [],
  },
  {
    id: 'irummate',
    label: '이룸매이트',
    folders: [
      { id: 'irummate-server', label: '서버' },
      { id: 'irummate-client', label: '클라이언트' },
    ],
  },
  {
    id: 'sai',
    label: '사이',
    folders: [
      { id: 'sai-server', label: '서버' },
      { id: 'sai-client', label: '클라이언트' },
      { id: 'sai-ai', label: 'AI' },
    ],
  },
  {
    id: 'sipyeong',
    label: '시평',
    folders: [{ id: 'sipyeong-web', label: '웹' }],
  },
]

export const PAST_GENERATIONS: SidebarItem[] = [
  { id: 'gen1', label: '1기', folders: [] },
  { id: 'gen2', label: '2기', folders: [] },
  {
    id: 'gen3',
    label: '3기',
    folders: [
      { id: 'uoscholar', label: 'UoScholar' },
      { id: 'trouos', label: 'TROUOS' },
    ],
  },
]
