export type ArchivePerson = {
  id: string
  label: string
}

export type ArchiveGeneration = {
  id: string
  label: string
  people: ArchivePerson[]
}

export const ARCHIVE_GENERATIONS: ArchiveGeneration[] = [
  {
    id: 'archive-gen1',
    label: '1기',
    people: [{ id: 'leejongwoo', label: '1기_이종우' }],
  },
  {
    id: 'archive-gen2',
    label: '2기',
    people: [{ id: 'parkjuyoung', label: '2기_박주영' }],
  },
  {
    id: 'archive-gen3',
    label: '3기',
    people: [],
  },
]

export const ALL_ARCHIVE_PEOPLE: ArchivePerson[] = ARCHIVE_GENERATIONS.flatMap(
  (gen) => gen.people,
)
