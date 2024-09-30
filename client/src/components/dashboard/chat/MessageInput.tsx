import { useSocket } from "@/components/context/SocketContext"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { socket } from "@/utils/io"
import { messageSchema } from "@/utils/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface MessageInputProps {
  isConnected: boolean;
  chatroomId: string,
  user: {
    id: string,
    name: string,
    online: boolean,
    picture: string,
    userTag: string
  },
  participants: string[]
}

const MessageInput = ({ isConnected, chatroomId, user, participants }: MessageInputProps) => {

  const { onlineFriends } = useSocket()

  const [participantsIds, setParticipantsIds] = useState<string[]>([])
  const [participantsSocketIds, setParticipantsSocketIds] = useState<string[]>([])

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
      senderImage: user.picture
    }
  })

  useEffect(() => {

    const participantsExcludingCurrentUser = participants.filter(p => p !== user.id)

    setParticipantsIds(participantsExcludingCurrentUser)

    const participantsSocketIds = participantsExcludingCurrentUser.map(id => onlineFriends[id]?.socketId)

    setParticipantsSocketIds(participantsSocketIds)
  }, [user.id, participants, onlineFriends])

  const { watch } = form

  const messageValue = watch("message")

  const trimmedMessage = messageValue.trim();

  const onSubmit = async (values: z.infer<typeof messageSchema>) => {

    const trimmedMessage = values.message.trim()

    const { senderImage } = values

    if (!trimmedMessage) return

    // socket.emit("sendMessage", values.message, chatroomId, user.id, participantsIds)
    // console.log("chatroomId", chatroomId)
    socket.emit("sendMessage", trimmedMessage, chatroomId, user.id, participantsIds, senderImage, participantsSocketIds);

    form.reset()
  }

  return (
    <div className="bg-green-300s h-[7%] py-1 px-3 flex items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full space-x-2"
        >
          <div className="flex-1">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="send message to your friend..."
                      {...field}
                      className="focus-visible:ring-1 px-2 focus-visible:ring-offset-0"
                      disabled={!isConnected}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={!trimmedMessage || !isConnected}
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default MessageInput