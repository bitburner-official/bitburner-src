import React, { useState } from "react";

import { Button, Tooltip } from "@mui/material";
import { ConfirmationModal } from "./ConfirmationModal";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";

interface IProps {
  color?: "primary" | "warning" | "error";
  noConfirmation?: boolean;
  onTriggered: () => void;
}

export function SoftResetButton({
  color = "primary",
  noConfirmation = false,
  onTriggered,
}: IProps): React.ReactElement {
  const [modalOpened, setModalOpened] = useState(false);

  function handleButtonClick(): void {
    if (noConfirmation) {
      onTriggered();
    } else {
      setModalOpened(true);
    }
  }

  const confirmationMessage = `软重置将会：

  - 重置基础属性与资金
  - 为公司和派系积累好感
  - 若有已购买的强化，则将其安装
  - 重置服务器、程序、最近的脚本和终端 
  - 家用电脑上的脚本会停止运行，但不会被删除
  - 停止部分特殊机制（犯罪、学习、${knowAboutBitverse() ? `Bladeburner 行动、移植任务、` : ""}等）
  - 你不会丢失总体进度或特殊机制的访问权限

确定要继续吗？ 
  `;

  return (
    <>
      <Tooltip title="执行与安装强化时相同的重置。即使没有排队中的强化也可以使用。会安装所有排队中的强化。">
        <Button startIcon={<RestartAltIcon />} color={color} onClick={handleButtonClick}>
          软重置
        </Button>
      </Tooltip>
      <ConfirmationModal
        onConfirm={onTriggered}
        open={modalOpened}
        onClose={() => setModalOpened(false)}
        confirmationText={<span style={{ whiteSpace: "pre-wrap" }}>{confirmationMessage}</span>}
        additionalButton={<Button onClick={() => setModalOpened(false)}>取消</Button>}
      />
    </>
  );
}
