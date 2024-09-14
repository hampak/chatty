import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { FriendsList } from "@/types"
import { startChatWithFriendSchema } from "@/utils/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"
import { useQueryClient } from "@tanstack/react-query"
import { useCreateChat } from "@/lib/data"
import { useUser } from "../provider/UserProvider"
import { AxiosError } from "axios"
import { toast } from "sonner"



const CreateChatModal = ({ children, data }: { children: React.ReactNode, data: FriendsList | null }) => {

  const { user } = useUser()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof startChatWithFriendSchema>>({
    resolver: zodResolver(startChatWithFriendSchema),
    defaultValues: {
      friendData: []
    }
  })

  const { watch } = form
  const selectedFriends = watch("friendData", [])

  const { mutate: createChat, isPending } = useCreateChat()

  const onSubmit = (values: z.infer<typeof startChatWithFriendSchema>) => {

    createChat({
      friendData: values.friendData,
      currentUserId: user!.id,
      currentUserName: user!.name,
      currentUserPicture: user!.picture
    }, {
      onSuccess: async (data) => {
        setOpen(false)
        form.reset()
        await queryClient.invalidateQueries({ queryKey: ["chat_list", user?.id] })
        toast.success(data.message)
        // socket.emit("add-friend", user?.id)
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error(`${error.response?.data.message}`)
          // setTimeout(() => window.location.href = "/login", 1200)
        } else {
          toast.error(error.message)
        }
      }
    })
  }

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="w-full h-full flex items-center justify-center focus:outline-none"
      >
        {children}
      </DialogTrigger>
      <DialogContent className="min-h-fit">
        <DialogHeader className="mb-2">
          <DialogTitle>Start a new chat</DialogTitle>
          <DialogDescription>You can start a 1 on 1 chat with a single friend or a group chat!</DialogDescription>
          <Separator />
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="overflow-y-auto h-[200px] custom-scrollbar">
                <FormField
                  control={form.control}
                  name="friendData"
                  render={({ field }) => (
                    <>
                      {
                        Array.isArray(data) && data.length > 0 ? (
                          data.map(f => {
                            // const isChecked = field.value.includes(f.userId)
                            const isChecked = field.value.some(friend => friend.friendId === f.userId)
                            return (
                              <FormItem
                                className="px-3 py-2 w-full flex items-center justify-between bg-red-200s rounded-lg hover:bg-gray-100 transition-all space-y-0 cursor-pointer mb-1"
                                key={f.userId}
                              >
                                <FormLabel className="flex items-center bg-green-200s w-full cursor-pointer">
                                  <Avatar className="mr-3">
                                    <AvatarImage
                                      src={f.image}
                                      className="border"
                                    />
                                  </Avatar>
                                  <h2>
                                    {f.name}
                                  </h2>
                                </FormLabel>
                                <FormControl>
                                  <Checkbox
                                    className=""
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        // field.onChange([...field.value, f.userId]); // Add userId to the list
                                        field.onChange([...field.value, { friendId: f.userId, friendPicture: f.image, friendName: f.name }])
                                      } else {
                                        field.onChange(
                                          // field.value.filter((id) => id !== f.userId) // Remove userId from the list
                                          field.value.filter((friend) => friend.friendId !== f.userId)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )
                          })
                        ) : (
                          <></>
                        )
                      }
                    </>
                  )}
                />
              </div>
              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  disabled={selectedFriends.length === 0 || isPending || !user}
                  className="w-full mt-4"
                >
                  {selectedFriends.length === 0 ? "Start New Chat" : (
                    selectedFriends.length === 1 ? "1 on 1 Chat" : `Group chat with ${selectedFriends.length} friends`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog >
  )
}

export default CreateChatModal


// const { mutate: createChat, isPending } = useCreateChat()

//   const onSubmit = async (values: z.infer<typeof addFriendSchema>) => {

//     const friendUserTag = values.friendUserTag

//     if (friendUserTag === user?.userTag) {
//       return toast.error("Cannot befriend yourself :/")
//     }

//     createChat({
//       userId: user?.id,
//       userName: user?.name,
//       userTag: user?.userTag,
//       userImage: user?.picture,
//       friendUserTag: friendUserTag
//     }, {
//       onSuccess: async (data) => {
//         setOpen(false)
//         form.reset()
//         await queryClient.invalidateQueries({ queryKey: ["chat_list", user?.id] })
//         toast.success(`Added ${data.friendUserTag} as a friend :D`)
//         socket.emit("add-friend", user?.id)
//       },
//       onError: (error) => {
//         if (error instanceof AxiosError) {
//           toast.error(`${error.response?.data.message}`)
//           setTimeout(() => window.location.href = "/login", 1200)
//         } else {
//           toast.error(error.message)
//         }
//       }
//     })
//   }