import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { socket } from "@/utils/io"
import { messageSchema } from "@/utils/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface MessageInputProps {
  isConnected: boolean;
  chatroomId: string
}

const MessageInput = ({ isConnected, chatroomId }: MessageInputProps) => {

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: ""
    }
  })

  const { getValues } = form
  const lengthOfMessage = getValues("message")

  const onSubmit = async (values: z.infer<typeof messageSchema>) => {
    socket.emit("sendMessage", values.message, chatroomId)
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
            disabled={!lengthOfMessage || !isConnected}
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default MessageInput