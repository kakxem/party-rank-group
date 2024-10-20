import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dialogInfoAtom, formTypeAtom, openAtom } from "@/hooks/use-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { wsAtom } from "@/hooks/useGame";
import { cn } from "@/lib/utils";
import type { ConnectionData, Player } from "@/types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

function FormComponent({
  handleSubmit,
}: {
  handleSubmit: (e: React.FormEvent) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const formType = useAtomValue(formTypeAtom);
  const [dialogInfo, setDialogInfo] = useAtom(dialogInfoAtom);

  return (
    <form
      className={cn("grid items-start gap-7 px-4", isDesktop && "gap-3")}
      onSubmit={handleSubmit}
    >
      <div className="flex w-full gap-2">
        <div className="flex w-full flex-col gap-1">
          <Label>Username</Label>
          <Input
            id="username"
            placeholder="Enter Username"
            onChange={(e) =>
              setDialogInfo((prev) => ({ ...prev, playerName: e.target.value }))
            }
            value={dialogInfo.playerName}
            className="w-full"
            autoComplete="off"
          />
        </div>

        {formType === "join" && (
          <div className="flex w-full flex-col gap-1">
            <Label>Room ID</Label>
            <Input
              id="id"
              placeholder="Enter Room ID"
              onChange={(e) =>
                setDialogInfo((prev) => ({ ...prev, roomCode: e.target.value }))
              }
              value={dialogInfo.roomCode}
              className="w-full"
              autoComplete="off"
            />
          </div>
        )}
      </div>
      <Button type="submit">{formType === "create" ? "Create" : "Join"}</Button>
    </form>
  );
}

export function ResponsiveDialog() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [open, setOpen] = useAtom(openAtom);
  const [dialogInfo, setDialogInfo] = useAtom(dialogInfoAtom);
  const formType = useAtomValue(formTypeAtom);
  const setWs = useSetAtom(wsAtom);

  const renderTitleAndDescription = {
    title: formType === "create" ? "Create Room" : "Join Room",
    description:
      formType === "create"
        ? "Enter your username and create a new room."
        : "Enter your username and the room ID to join an existing room.",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { playerName, roomCode } = dialogInfo;

    if (!playerName || (formType === "join" && !roomCode)) return;

    const createPlayer = () => {
      const savedPlayer = getSavedPlayer();
      const newPlayer = {
        id: savedPlayer?.id ?? uuidv4(),
        name: playerName,
      };
      setSavedPlayer(newPlayer);
      return newPlayer;
    };

    const data: ConnectionData = {
      player: createPlayer(),
      join: formType === "join",
    };
    const roomId =
      formType === "create" ? Math.random().toString(36).slice(2, 8) : roomCode;

    const host = "127.0.0.1:1999";
    const ws = new WebSocket(
      `ws://${host}/party/${roomId}?data=${encodeURIComponent(
        JSON.stringify(data),
      )}`,
    );
    setWs(ws);
  };

  const getSavedPlayer = () => {
    return JSON.parse(localStorage.getItem("player") ?? "{}") as Pick<
      Player,
      "id" | "name"
    >;
  };

  const setSavedPlayer = (player: Pick<Player, "id" | "name">) => {
    localStorage.setItem("player", JSON.stringify(player));
  };

  useEffect(() => {
    const savedPlayer = getSavedPlayer();
    if (savedPlayer?.name)
      setDialogInfo((prev) => ({ ...prev, playerName: savedPlayer.name }));
  }, [setDialogInfo]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{renderTitleAndDescription.title}</DialogTitle>
            <DialogDescription>
              {renderTitleAndDescription.description}
            </DialogDescription>
          </DialogHeader>
          <FormComponent handleSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{renderTitleAndDescription.title}</DrawerTitle>
          <DrawerDescription>
            {renderTitleAndDescription.description}
          </DrawerDescription>
        </DrawerHeader>
        <FormComponent handleSubmit={handleSubmit} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
