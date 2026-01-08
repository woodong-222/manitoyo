export type Room = {
  id: string
  title: string
  hostName: string
  masterPassword: string
  isRevealed: boolean
}

export type Participant = {
  id: string
  name: string
  targetName: string
  personalPassword: string
  isJoined: boolean
}
