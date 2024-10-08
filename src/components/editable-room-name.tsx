import { gameAtom, wsAtom } from "@/hooks/useGame";
import { Messages, Scene } from "@/types";
import { useAtomValue } from "jotai";
import { KeyboardEvent, useEffect, useRef } from "react";

export const EditableRoomName = () => {
  const game = useAtomValue(gameAtom);
  const ws = useAtomValue(wsAtom);
  const roomNameRef = useRef<HTMLHeadingElement>(null);

  const cleanText = (text: string) => {
    // Reemplaza múltiples espacios con uno solo y elimina espacios al inicio y al final
    return text.replace(/\s+/g, " ").trim();
  };

  const handleInputChange = () => {
    if (roomNameRef.current) {
      const newName = cleanText(roomNameRef.current.innerText || "");
      roomNameRef.current.innerText = newName; // Actualiza el contenido visible

      if (ws && game.id) {
        ws.send(
          JSON.stringify({
            type: Messages.UPDATE_ROOM_NAME,
            data: { roomCode: game.id, newName },
          }),
        );
      }
    }
  };

  useEffect(() => {
    if (roomNameRef.current && roomNameRef.current.innerText !== game.name) {
      roomNameRef.current.innerText = game.name || "Party Rank Group";
    }
  }, [game.name]);

  const handleKeyDown = (event: KeyboardEvent<HTMLHeadingElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      roomNameRef.current?.blur(); // Quita el foco del elemento
    }
  };

  const selectAllText = () => {
    if (roomNameRef.current && game.scene === Scene.LOBBY) {
      roomNameRef.current.focus();
      window.getSelection()?.selectAllChildren(roomNameRef.current);
    }
  };

  return (
    <h1
      contentEditable={game.scene === Scene.LOBBY}
      ref={roomNameRef}
      suppressContentEditableWarning
      onBlur={handleInputChange}
      onKeyDown={handleKeyDown}
      onClick={selectAllText}
      className="overflow-hidden py-2 text-center text-5xl font-semibold focus:outline-none md:text-6xl lg:text-7xl"
    >
      {game.name || "Party Rank Group"}
    </h1>
  );
};
