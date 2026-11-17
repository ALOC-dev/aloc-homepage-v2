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
    people: [
      {
        // TODO: 샘플 데이터 — 실제 정보로 교체
        id: 'leejongwoo',
        name: '이종우',
        generation: '1기',
        githubUrl: 'https://github.com/ALOC-dev',
        discordUrl: 'https://discord.com',
        projects: [
          'ALOC 홈페이지 v1',
          '학식 메뉴 알림 디스코드 봇',
          '스터디 출석 체크 웹앱',
        ],
        competitions: [
          '교내 프로그래밍 경진대회 장려상',
          'ICPC Seoul Regional 예선 참가',
          'SCPC 2차 예선 통과',
        ],
      },
    ],
  },
  {
    id: 'profile-gen2',
    label: '2기',
    people: [
      {
        // TODO: 샘플 데이터 — 실제 정보로 교체
        id: 'parkjuyoung',
        name: '박주영',
        generation: '2기',
        githubUrl: 'https://github.com/ALOC-dev',
        discordUrl: 'https://discord.com',
        projects: [
          '동아리 행사 신청 페이지',
          '캠퍼스 빈 강의실 찾기 앱',
          '알고리즘 스터디 문제 추천 봇',
        ],
        competitions: [
          '교내 해커톤 우수상',
          '공개SW 개발자대회 참가',
          '공공데이터 활용 공모전 입선',
        ],
      },
    ],
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
    people: [
      {
        // TODO: 샘플 데이터 — 실제 정보로 교체
        id: 'kimjungmook',
        name: '김정묵',
        generation: '5기',
        githubUrl: 'https://github.com/ALOC-dev',
        discordUrl: 'https://discord.com',
        projects: ['ALOC 홈페이지 v2', 'With Kim', '사이(SAI)'],
        competitions: [
          '교내 해커톤 대상',
          'AI 아이디어 공모전 최우수상',
          'SCPC 1차 예선 통과',
        ],
      },
    ],
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