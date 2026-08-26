import React, { useState } from "react";
import { deleteGame } from "../../db";
import { ConfirmationModal } from "./ConfirmationModal";
import Button from "@mui/material/Button";
import { Tooltip } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { pushDisableRestore } from "../../Electron";

interface IProps {
  color?: "primary" | "warning" | "error";
}

export function DeleteGameButton({ color = "primary" }: IProps): React.ReactElement {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <Tooltip title="这将永久删除你的本地存档。你之前导出过存档吗？">
        <Button startIcon={<DeleteIcon />} color={color} onClick={() => setModalOpened(true)}>
          删除存档
        </Button>
      </Tooltip>
      <ConfirmationModal
        onConfirm={() => {
          setModalOpened(false);
          deleteGame()
            .then(() => {
              pushDisableRestore();
              setTimeout(() => location.reload(), 0);
            })
            .catch((r) => console.error("Could not delete game: %o", r));
        }}
        open={modalOpened}
        onClose={() => setModalOpened(false)}
        confirmationText={"真的要删除你的游戏吗？（此操作不可恢复！）"}
        additionalButton={<Button onClick={() => setModalOpened(false)}>取消</Button>}
      />
    </>
  );
}
