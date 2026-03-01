export interface MockFriendProfile {
  userId: number
  fullName: string
  email: string
  avatar: string
  country: string
  city: string
  university: string
  points: number
  roadmapProgress: Record<string, number>
}

export const mockFriendDirectory: MockFriendProfile[] = [
  {
    userId: 11,
    fullName: "Aruzhan K.",
    email: "aruzhan@example.com",
    avatar: "A",
    country: "Казахстан",
    city: "Алматы",
    university: "KBTU",
    points: 3820,
    roadmapProgress: { ai: 88, frontend: 91, backend: 62, devops: 40, mobile: 35 }
  },
  {
    userId: 15,
    fullName: "Nikita S.",
    email: "nikita@example.com",
    avatar: "N",
    country: "Казахстан",
    city: "Астана",
    university: "ENU",
    points: 3410,
    roadmapProgress: { ai: 66, frontend: 73, backend: 84, devops: 57, mobile: 25 }
  },
  {
    userId: 22,
    fullName: "Miras T.",
    email: "miras@example.com",
    avatar: "M",
    country: "Казахстан",
    city: "Шымкент",
    university: "M. Auezov South Kazakhstan University",
    points: 2975,
    roadmapProgress: { ai: 54, frontend: 47, backend: 79, devops: 51, mobile: 42 }
  },
  {
    userId: 27,
    fullName: "Alina D.",
    email: "alina@example.com",
    avatar: "A",
    country: "Кыргызстан",
    city: "Бишкек",
    university: "AUCA",
    points: 2510,
    roadmapProgress: { ai: 58, frontend: 69, backend: 52, devops: 33, mobile: 72 }
  },
  {
    userId: 31,
    fullName: "Olga V.",
    email: "olga@example.com",
    avatar: "O",
    country: "Казахстан",
    city: "Астана",
    university: "NU",
    points: 2330,
    roadmapProgress: { ai: 45, frontend: 61, backend: 65, devops: 44, mobile: 36 }
  },
  {
    userId: 34,
    fullName: "Dana M.",
    email: "dana@example.com",
    avatar: "D",
    country: "Казахстан",
    city: "Алматы",
    university: "Satbayev University",
    points: 2770,
    roadmapProgress: { ai: 62, frontend: 86, backend: 59, devops: 29, mobile: 49 }
  }
]

export const mockDefaultFriendIds: number[] = [11, 15]
