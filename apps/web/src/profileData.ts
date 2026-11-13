export type ProfilePerson = {
  id: string
  name: string
  generation: string
  bio?: string
  githubUrl?: string
  discordUrl?: string
  projects?: string[]
  competitions?: string[]
}

export type ProfileGeneration = {
  id: string
  label: string
  people: ProfilePerson[]
}

export const PROFILE_GENERATIONS: ProfileGeneration[] = [
  {
    id: 'profile-gen1',
    label: '1기',
    people: [{ id: 'leejongwoo', name: '이종우', generation: '1기' }],
  },
  {
    id: 'profile-gen2',
    label: '2기',
    people: [{ id: 'parkjuyoung', name: '박주영', generation: '2기' }],
  },
  {
    id: 'profile-gen3',
    label: '3기',
    people: [],
  },
  {
    id: 'profile-gen4',
    label: '4기',
    people: [],
  },
  {
    id: 'profile-gen5',
    label: '5기',
    people: [{ id: 'kimjungmook', name: '김정묵', generation: '5기' }],
  },
  {
    id: 'profile-gen6',
    label: '6기',
    people: [],
  },
]

export const ALL_PROFILE_PEOPLE: ProfilePerson[] = PROFILE_GENERATIONS.flatMap(
  (gen) => gen.people,
)
