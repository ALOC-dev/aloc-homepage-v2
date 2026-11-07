export type KnowledgeTalk = {
  id: string
  title: string
}

export type KnowledgeGeneration = {
  id: string
  label: string
  talks: KnowledgeTalk[]
}

export const KNOWLEDGE_GENERATIONS: KnowledgeGeneration[] = [
  { id: 'knowledge-gen1', label: '1기', talks: [] },
  { id: 'knowledge-gen2', label: '2기', talks: [] },
  { id: 'knowledge-gen3', label: '3기', talks: [] },
  { id: 'knowledge-gen4', label: '4기', talks: [] },
  {
    id: 'knowledge-gen5',
    label: '5기',
    talks: [
      { id: 'figma-how-to', title: '피그마 어떻게 써요?' },
      { id: 'write-or-not', title: '쓰거나 쓰지 않거나' },
    ],
  },
]

export const ALL_KNOWLEDGE_TALKS: KnowledgeTalk[] =
  KNOWLEDGE_GENERATIONS.flatMap((gen) => gen.talks)
