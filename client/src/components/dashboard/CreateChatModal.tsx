import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { z } from "zod"
import { addFriendSchema } from "../../utils/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from 'react';
import { Button } from "../ui/button"



const CreateChatModal = ({ children }: { children: React.ReactNode }) => {

  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      userTag: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof addFriendSchema>) => {
    alert(values.userTag)
  }

  return (
    <Dialog>
      <DialogTrigger className="w-full">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Start a new chat by adding a friend :D</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="userTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Tag</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usertag#1234"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
              >
                Start New Chat
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateChatModal