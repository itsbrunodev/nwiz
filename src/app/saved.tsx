import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { useAtom } from "jotai";
import { SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { networkAtom } from "@/stores/network";

import { dexie } from "@/lib/dexie";
import { decodeCompactBase64 } from "@/lib/encode";

export function SavedPage() {
  const navigate = useNavigate();

  const [network, setNetwork] = useAtom(networkAtom);

  const networkCodes = useLiveQuery(() => dexie.networkCodes.toArray());

  useEffect(() => {
    document.title = "nwiz - Saved Networks";
  }, []);

  return (
    <>
      <h2 className="border-b pb-3 font-bold text-2xl">Saved Networks</h2>
      {networkCodes?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SaveIcon />
            </EmptyMedia>
          </EmptyHeader>
          <div>
            <EmptyTitle>No saved networks</EmptyTitle>
            <EmptyDescription>There are no saved networks</EmptyDescription>
          </div>
          <EmptyContent>
            <Button asChild>
              <Link to="/">Get Started</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {networkCodes?.map(({ id, code }) => {
            const decodedNetwork = decodeCompactBase64(code);
            const { name, description, createdAt, updatedAt } = decodedNetwork;

            const isLoaded = network.id === id;

            return (
              <Card key={id}>
                <CardHeader>
                  <CardTitle>{name || "New Network"}</CardTitle>
                  {isLoaded && <Badge className="mb-1">Currently Loaded</Badge>}
                  <CardDescription className="line-clamp-2" title={description}>
                    {description || "No description."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm [&>div>span:first-child]:font-medium [&>div>span:last-child]:text-muted-foreground [&>div]:flex [&>div]:justify-between">
                  <div>
                    <span>Created At</span>
                    <span>{format(createdAt, "MMM do, yyyy")}</span>
                  </div>
                  <div>
                    <span>Updated At</span>
                    <span>{format(updatedAt, "MMM do, yyyy")}</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto justify-end gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Remove</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Network</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this network?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button variant="secondary">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            try {
                              dexie.networkCodes.delete(id);
                              toast.success("Successfully removed network.");
                            } catch (error) {
                              console.error(error);
                              toast.error("Failed to remove network.");
                            }
                          }}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    disabled={isLoaded}
                    onClick={() => {
                      setNetwork(decodedNetwork);
                      navigate("/");
                      toast.success("Successfully loaded network.");
                    }}
                  >
                    Load
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
