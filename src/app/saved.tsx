// import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { useSetAtom } from "jotai";
import { SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  // CardContent,
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

import { dexie } from "@/lib/dexie";
import { decodeCompactBase64 } from "@/lib/encode";

import { networkAtom } from "@/stores/network";

export function SavedPage() {
  const setNetwork = useSetAtom(networkAtom);

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
              <a href="/">Get Started</a>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {networkCodes?.map(({ id, code }) => {
            const network = decodeCompactBase64(code);
            const { name, description /* createdAt, updatedAt */ } = network;

            return (
              <Card key={id}>
                <CardHeader>
                  <CardTitle>{name || "New Network"}</CardTitle>
                  <CardDescription>
                    {description || "No description."}
                  </CardDescription>
                </CardHeader>
                {/* <CardContent className="text-sm [&>div>span:first-child]:font-medium [&>div>span:last-child]:text-muted-foreground [&>div]:flex [&>div]:justify-between">
                  <div>
                    <span>Created At</span>
                    <span>{format(createdAt, "MMM do, yyyy")}</span>
                  </div>
                  <div>
                    <span>Updated At</span>
                    <span>{format(updatedAt, "MMM do, yyyy")}</span>
                  </div>
                </CardContent> */}
                <CardFooter className="justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      try {
                        dexie.networkCodes.delete(id);

                        toast.success("Network removed successfully");
                      } catch (error) {
                        console.error(error);

                        toast.error("Failed to remove network");
                      }
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={() => {
                      setNetwork(network);

                      toast.success("Network loaded successfully");
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
