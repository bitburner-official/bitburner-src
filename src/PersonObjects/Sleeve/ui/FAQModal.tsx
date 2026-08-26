import React from "react";

import { Modal } from "../../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import { FactionName } from "@enums";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function FAQModal({ open, onClose }: IProps): React.ReactElement {
  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Typography variant="h4">分身是如何运作的？</Typography>
        <br />
        <Typography>
          分身本质上是你的克隆体。你可以让它们执行任何类型的工作，例如为公司/派系工作或实施犯罪。让分身执行这些任务可以为你赚取资金、经验和声望。
        </Typography>
        <br />
        <br />
        <Typography>
          每个分身都是独立的个体，这意味着它们各自拥有自己的经验和属性。
        </Typography>
        <br />
        <br />
        <Typography>
          当一个分身获得经验时，它自己、玩家的本体意识以及玩家所有其他分身都会获得经验。
        </Typography>
        <br />
        <br />
        <Typography variant="h4">什么是同步（Sync）？</Typography>
        <br />
        <Typography>
          同步衡量的是你的意识与分身意识之间的契合程度。它是 1 到 100 之间的数值，影响分身执行任务时获得经验的多少。
        </Typography>
        <br />
        <br />
        <Typography>
          设 N 为分身的同步率。当该分身通过执行任务获得经验时，分身本身和玩家本体意识都会获得该任务正常经验量的 N%，而玩家所有其他分身会获得
          ((N/100)^2 * 100)% 的经验。
        </Typography>
        <br />
        <br />
        <Typography>将分身指派到"同步"任务可以提高同步率。</Typography>
        <br />
        <br />
        <Typography variant="h4">什么是震荡（Shock）？</Typography>
        <br />
        <Typography>
          分身震荡衡量的是分身因被置入新身体而产生的创伤程度。它是 0 到 99 之间的数值，99 表示完全震荡，0 表示没有震荡。震荡会影响分身获得的经验量。
        </Typography>
        <br />
        <br />
        <Typography>
          分身震荡会随时间缓慢降低。你可以将分身指派到"震荡恢复"任务，进一步提高其下降速度。
        </Typography>
        <br />
        <br />
        <Typography variant="h4">为什么我的分身不能为这家公司或派系工作？</Typography>
        <br />
        <Typography>
          对于给定的公司/派系，同一时间只能有一个分身为之工作。进一步说明：如果你有两个分身，它们可以为两家不同的公司/派系工作，但不能同时为同一家公司/派系工作。
        </Typography>
        <br />
        <br />
        <Typography variant="h4">如何为我的分身购买强化？</Typography>
        <br />
        <Typography>分身的震荡必须降为 0，你才能为它购买强化。</Typography>
        <br />
        <br />
        <Typography variant="h4">为什么我不能为分身购买某个强化？</Typography>
        <br />
        <Typography>
          某些强化，例如 {FactionName.Bladeburners} 专属强化和 NeuroFlux Governor，对分身不可用。你还需要在提供该强化的某个派系拥有足够的当前声望。
        </Typography>
        <br />
        <br />
        <Typography variant="h4">安装强化或切换 BitNode 时分身会被重置吗？</Typography>
        <br />
        <Typography>
          切换 BitNode 时分身会被重置，但安装强化时不会。不过，在分身上安装强化会重置它们的属性。
        </Typography>
        <br />
        <br />
        <Typography variant="h4">什么是记忆（Memory）？</Typography>
        <br />
        <Typography>
          分身记忆决定了分身在切换 BitNode 被重置后的同步率。例如，如果某个分身的记忆为 25，那么当你切换 BitNode 时，它的同步率初始会被设为
          25，而不是 1。
        </Typography>
        <br />
        <br />
        <Typography>
          记忆只能通过向 {FactionName.TheCovenant} 购买升级来提升。它是一个永久属性，意味着它永远不会被重置回 1。分身记忆的最大可能值为 100。
        </Typography>
        <br />
        <br />
        <Typography variant="h4">什么是奖励时间？</Typography>
        <br />
        <Typography>
          当分身空闲时、或者你在离线后重新打开游戏时，分身会积累奖励时间。它们会使用奖励时间来减少完成任务所需的时间，从而更快地完成任务。
        </Typography>
      </>
    </Modal>
  );
}
