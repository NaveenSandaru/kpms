import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/Components/ui/label";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InviteUserDialog({ open, onClose }: Props) {

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [role, setRole] = useState<"Dentist" | "Receptionist">("Dentist");
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const sendEmail = async (role: string, email: string) => {
    setSendingEmail(true);
    try {
      const response = await axios.post(
        `${backendURL}/admins/invite`, {
        role: role,
        email: email
      },
        {
          withCredentials: true,
          headers: {
            "Content-type": "application/json"
          }
        }
      );
      if (response.status == 500) {
        throw new Error("Error sending invite");
      }
    }
    catch (err: any) {
      window.alert(err.message);
    }
    finally {
      setSendingEmail(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl text-emerald-800">Invite User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select Role:</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Dentist"
                  checked={role === "Dentist"}
                  onChange={() => setRole("Dentist")}
                />
                Dentist
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Receptionist"
                  checked={role === "Receptionist"}
                  onChange={() => setRole("Receptionist")}
                />
                Receptionist
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-2">Email</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">

          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() =>sendEmail(role, email)}>Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
