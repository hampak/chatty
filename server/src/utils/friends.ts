import { ChatRoom, User } from "../db/models"

// export const getUserChatRooms = async (userId: string) => {
//   const chatRooms = await ChatRoom.find({
//     participants: userId
//   }).exec()

//   if (!chatRooms) return null

//   return chatRooms
// }

// export const getOtherParticipants = async (chatRoom: any, mainUserId: string) => {
//   return chatRoom.participants.filter((participant: string) => participant.toString())
// }

export const getUsersFriends = async (userId: string) => {
  const chatRooms = await ChatRoom.find({
    participants: userId
  }).exec()

  if (!chatRooms || chatRooms.length === 0) {
    return []
  }

  const friendIds = new Set<string>()

  chatRooms.forEach(room => {
    // Iterate over participants in each chat room
    room.participants.forEach(participantId => {
      // Convert participant ID to string and add to the Set if it's not the main user
      if (participantId.toString() !== userId) {
        friendIds.add(participantId.toString());
      }
    });
  });

  // Convert the Set to an array
  const friendIdsArray = Array.from(friendIds);

  // Optionally fetch user details for these friends
  const friends = await User.find({ _id: { $in: friendIdsArray } }).exec();

  return friends;
}