import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Participant, Room } from './types'
import { shuffle } from './utils'

type CreateRoomInput = {
  title: string
  hostName: string
  masterPassword: string
  participantNames: string[]
}

export async function createRoom({
  title,
  hostName,
  masterPassword,
  participantNames,
}: CreateRoomInput) {
  const roomRef = await addDoc(collection(db, 'rooms'), {
    title,
    hostName,
    masterPassword,
    isRevealed: false,
    createdAt: serverTimestamp(),
  })

  const uniqueNames = participantNames
    .map((name) => name.trim())
    .filter(Boolean)

  const shuffled = shuffle(uniqueNames)
  const targets = shuffled.map(
    (_, index) => shuffled[(index + 1) % shuffled.length]
  )
  const targetMap = new Map(
    shuffled.map((name, index) => [name, targets[index]])
  )

  const sortedNames = [...uniqueNames].sort((a, b) =>
    a.localeCompare(b, 'ko')
  )
  const participantsRef = collection(db, 'rooms', roomRef.id, 'participants')
  await Promise.all(
    sortedNames.map((name) =>
      addDoc(participantsRef, {
        name,
        targetName: targetMap.get(name) ?? '',
        personalPassword: '',
        isJoined: false,
        createdAt: serverTimestamp(),
      })
    )
  )

  return roomRef.id
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const snapshot = await getDoc(doc(db, 'rooms', roomId))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return {
    id: snapshot.id,
    title: data.title ?? '',
    hostName: data.hostName ?? '',
    masterPassword: data.masterPassword ?? '',
    isRevealed: Boolean(data.isRevealed),
  }
}

export async function listParticipants(roomId: string) {
  const snapshot = await getDocs(collection(db, 'rooms', roomId, 'participants'))
  return snapshot.docs
    .map((docItem) => {
      const data = docItem.data()
      return {
        id: docItem.id,
        name: data.name ?? '',
        targetName: data.targetName ?? '',
        personalPassword: data.personalPassword ?? '',
        isJoined: Boolean(data.isJoined),
      } as Participant
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

export async function getParticipantByName(roomId: string, name: string) {
  const participantsRef = collection(db, 'rooms', roomId, 'participants')
  const snapshot = await getDocs(
    query(participantsRef, where('name', '==', name))
  )
  if (snapshot.empty) return null
  const target = snapshot.docs[0]
  const data = target.data()
  return {
    id: target.id,
    name: data.name ?? '',
    targetName: data.targetName ?? '',
    personalPassword: data.personalPassword ?? '',
    isJoined: Boolean(data.isJoined),
  } as Participant
}

export async function setParticipantPassword({
  roomId,
  participantId,
  personalPassword,
}: {
  roomId: string
  participantId: string
  personalPassword: string
}) {
  const participantRef = doc(
    db,
    'rooms',
    roomId,
    'participants',
    participantId
  )
  await updateDoc(participantRef, {
    personalPassword,
    isJoined: true,
  })
}

export async function joinParticipant({
  roomId,
  name,
  personalPassword,
}: {
  roomId: string
  name: string
  personalPassword: string
}) {
  const participantsRef = collection(db, 'rooms', roomId, 'participants')
  const snapshot = await getDocs(
    query(participantsRef, where('name', '==', name))
  )
  if (snapshot.empty) return null
  const target = snapshot.docs[0]
  const data = target.data()
  if (data.isJoined) {
    return { status: 'already-joined' as const }
  }
  await updateDoc(target.ref, {
    personalPassword,
    isJoined: true,
  })
  return { status: 'joined' as const, id: target.id }
}

export async function getMyTarget({
  roomId,
  name,
  personalPassword,
}: {
  roomId: string
  name: string
  personalPassword: string
}) {
  const participantsRef = collection(db, 'rooms', roomId, 'participants')
  const snapshot = await getDocs(
    query(
      participantsRef,
      where('name', '==', name),
      where('personalPassword', '==', personalPassword)
    )
  )
  if (snapshot.empty) return null
  const data = snapshot.docs[0].data()
  return {
    id: snapshot.docs[0].id,
    targetName: data.targetName ?? '',
  }
}

export async function revealRoom(roomId: string) {
  await updateDoc(doc(db, 'rooms', roomId), { isRevealed: true })
}

export function subscribeRoom(
  roomId: string,
  onUpdate: (room: Room | null) => void
) {
  return onSnapshot(doc(db, 'rooms', roomId), (snapshot) => {
    if (!snapshot.exists()) {
      onUpdate(null)
      return
    }
    const data = snapshot.data()
    onUpdate({
      id: snapshot.id,
      title: data.title ?? '',
      hostName: data.hostName ?? '',
      masterPassword: data.masterPassword ?? '',
      isRevealed: Boolean(data.isRevealed),
    })
  })
}

export function subscribeParticipants(
  roomId: string,
  onUpdate: (participants: Participant[]) => void
) {
  return onSnapshot(
    collection(db, 'rooms', roomId, 'participants'),
    (snapshot) => {
      const items = snapshot.docs
        .map((docItem) => {
          const data = docItem.data()
          return {
            id: docItem.id,
            name: data.name ?? '',
            targetName: data.targetName ?? '',
            personalPassword: data.personalPassword ?? '',
            isJoined: Boolean(data.isJoined),
          } as Participant
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      onUpdate(items)
    }
  )
}

export async function rematchRoom(roomId: string) {
  const snapshot = await getDocs(collection(db, 'rooms', roomId, 'participants'))
  if (snapshot.empty) return
  const names = snapshot.docs
    .map((docItem) => docItem.data().name ?? '')
    .filter(Boolean)
  if (names.length < 3) return
  const shuffled = shuffle(names)
  const targets = shuffled.map(
    (_, index) => shuffled[(index + 1) % shuffled.length]
  )
  const targetMap = new Map(
    shuffled.map((name, index) => [name, targets[index]])
  )

  const batch = writeBatch(db)
  snapshot.docs.forEach((docItem) => {
    const data = docItem.data()
    const name = data.name ?? ''
    batch.update(docItem.ref, {
      targetName: targetMap.get(name) ?? '',
    })
  })
  batch.update(doc(db, 'rooms', roomId), { isRevealed: false })
  await batch.commit()
}

export async function rematchToNewRoom(roomId: string) {
  const roomSnapshot = await getDoc(doc(db, 'rooms', roomId))
  if (!roomSnapshot.exists()) return null
  const roomData = roomSnapshot.data()
  const participants = await listParticipants(roomId)
  const participantNames = participants.map((item) => item.name)
  if (participantNames.length < 3) return null

  const newRoomId = await createRoom({
    title: roomData.title ?? '',
    hostName: roomData.hostName ?? participantNames[0] ?? '',
    masterPassword: roomData.masterPassword ?? '',
    participantNames,
  })

  return {
    roomId: newRoomId,
    title: roomData.title ?? '',
  }
}
