import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Separator } from "../ui/separator"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"

const UserSettingsModal = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger className="focus:outline-none">{children}</DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-xl font-bold">User Settings</DialogHeader>
        <Separator />
        <div>
          <h1 className="text-gray-700 mb-3">Online Status</h1>
          <RadioGroup className="w-full px-2 py-3 rounded-lg hover:bg-green-100 transition-all hover:cursor-pointer">
            <label className="flex items-center hover:cursor-pointer" htmlFor="online">
              <div className="space-x-2 flex items-center">
                <RadioGroupItem value="online" id="online" />
                <Label>Online</Label>
              </div>
              <p className="text-xs text-gray-600 ml-auto">Friends will know you're online</p>
            </label>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserSettingsModal