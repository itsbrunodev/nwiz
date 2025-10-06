import { useAtom } from "jotai";
import short from "short-uuid";

import { INITIAL_NETWORK, networkAtom } from "@/stores/network";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function ResetNetworkButton() {
  const [network, setNetwork] = useAtom(networkAtom);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={
            network.connections.length === 0 && network.devices.length === 0
          }
        >
          Reset Network
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Network</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset the network? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              setNetwork({ ...INITIAL_NETWORK, id: short.generate() })
            }
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
