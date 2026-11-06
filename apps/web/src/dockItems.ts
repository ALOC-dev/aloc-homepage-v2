import {
  Archive,
  CalendarDays,
  Compass,
  FolderKanban,
  IdCard,
  Image,
  type LucideIcon,
} from 'lucide-react'

export type DockItem = {
  id: string
  label: string
  to: string
  Icon: LucideIcon
  from: string
  to2: string
}

export const DOCK_ITEMS: DockItem[] = [
  {
    id: 'projects',
    label: '프로젝트',
    to: '/projects',
    Icon: FolderKanban,
    from: '#c084fc',
    to2: '#7c3aed',
  },
  {
    id: 'archive',
    label: '아카이브',
    to: '/archive',
    Icon: Archive,
    from: '#fbbf24',
    to2: '#d97706',
  },
  {
    id: 'photos',
    label: '사진',
    to: '/photos',
    Icon: Image,
    from: '#fb7185',
    to2: '#e11d48',
  },
  {
    id: 'schedule',
    label: '알록일정',
    to: '/schedule',
    Icon: CalendarDays,
    from: '#fb923c',
    to2: '#ea580c',
  },
  {
    id: 'profile',
    label: '개인 프로필',
    to: '/profile',
    Icon: IdCard,
    from: '#2dd4bf',
    to2: '#0891b2',
  },
  {
    id: 'knowledge',
    label: '지식공유회',
    to: '/knowledge',
    Icon: Compass,
    from: '#38bdf8',
    to2: '#0ea5e9',
  },
]
