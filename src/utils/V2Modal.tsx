import { Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { Modal } from "../ui/React/Modal";
import { DocumentationLink } from "../ui/React/DocumentationLink";

let v2ModalOpen = false;

export const openV2Modal = (): void => {
  v2ModalOpen = true;
};

export const V2Modal = (): React.ReactElement => {
  const [open, setOpen] = useState(v2ModalOpen);
  return (
    <Modal open={open} onClose={() => undefined}>
      <Typography>V2 破坏性变更通知</Typography>
      <Typography>
        你的家用电脑上添加了一个名为 V2_0_0_API_BREAK.txt 的文件，强烈建议你查看
        该文件。它解释了大部分 API 破坏性变更发生的位置。
      </Typography>{" "}
      <Typography>
        你还应该查看{" "}
        <DocumentationLink page="migrations/v2.md">迁移指南</DocumentationLink> 以及{" "}
        <DocumentationLink page="changelog.md">更新日志</DocumentationLink>。
      </Typography>
      <Button onClick={() => setOpen(false)}>我已了解</Button>
    </Modal>
  );
};
