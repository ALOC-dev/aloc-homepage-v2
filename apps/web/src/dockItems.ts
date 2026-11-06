import calendarIcon from './assets/dock-icons/calendar.png'
import contactsIcon from './assets/dock-icons/contacts.png'
import finderIcon from './assets/dock-icons/finder.png'
import folderIcon from './assets/dock-icons/folder.png'
import photosIcon from './assets/dock-icons/photos.webp'
import safariIcon from './assets/dock-icons/safari.webp'

export type DockItem = {
  id: string
  label: string
  to: string
  icon: string
}

export const DOCK_ITEMS: DockItem[] = [
  {
    id: 'projects',
    label: '프로젝트',
    to: '/projects',
    icon: finderIcon,
  },
  {
    id: 'archive',
    label: '아카이브',
    to: '/archive',
    icon: folderIcon,
  },
  {
    id: 'photos',
    label: '사진',
    to: '/photos',
    icon: photosIcon,
  },
  {
    id: 'schedule',
    label: '알록일정',
    to: '/schedule',
    icon: calendarIcon,
  },
  {
    id: 'profile',
    label: '개인 프로필',
    to: '/profile',
    icon: contactsIcon,
  },
  {
    id: 'knowledge',
    label: '지식공유회',
    to: '/knowledge',
    icon: safariIcon,
  },
]
