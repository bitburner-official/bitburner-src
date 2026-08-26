import React, { useEffect } from "react";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { CONSTANTS } from "../../Constants";
import { StaneksGiftEvents } from "../StaneksGiftEvents";
import { MainBoard } from "./MainBoard";
import { StaneksGift } from "../StaneksGift";
import { Info } from "@mui/icons-material";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import Typography from "@mui/material/Typography";
import { ActiveFragment } from "../ActiveFragment";
import { Fragments } from "../Fragment";
import { DummyGrid } from "./DummyGrid";
import Container from "@mui/material/Container";
import { useRerender } from "../../ui/React/hooks";

interface IProps {
  staneksGift: StaneksGift;
}

export function StaneksGiftRoot({ staneksGift }: IProps): React.ReactElement {
  const rerender = useRerender();
  useEffect(() => StaneksGiftEvents.subscribe(rerender), [rerender]);
  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Typography variant="h4">
        Stanek 的礼物
        <Info
          sx={{ ml: 1, mb: 0 }}
          color="info"
          onClick={() =>
            dialogBoxCreate(
              <>
                <Typography>
                  Stanek 的礼物是一种强大且独一无二的强化，通过加入机械神教获得，该教会位于重庆。只有当你处于
                  BitNode 13 或拥有至少 1 级源文件 13 时才能加入教会；如果你购买或安装了除 NeuroFlux
                  Governors 以外的任何强化，你会被拒之门外。不过，一旦加入教会，你就可以正常安装其他强化。
                </Typography>
                <br />
                <Typography>
                  最初，携带礼物的人会发现它压倒性的力量会使你的所有属性降低
                  10%。这一惩罚可以通过接受机械神教派系的免费升级来逐渐克服，但这些升级所需的声望非常高，而且你只能通过为礼物充能来获得教会的声望。
                </Typography>
                <br />
                <Typography>
                  要为 Stanek 的礼物充能，用户必须先在设备上的网格中排列能够修改属性的碎片。这可以手动完成，也可以由使用
                  Stanek's Gift Netscript API
                  的脚本来完成。网格上并非每个格子都必须放置碎片，但碎片之间不能重叠或共享格子。碎片可以旋转，但其设计不允许翻转以镜像其原始形状。注意，网格的大小取决于你当前所在的
                  BitNode 以及你的源文件 13 的等级（如果适用）。
                </Typography>
                <br />
                <Typography>
                  碎片有两种。第一种是属性碎片（Stat
                  Fragment），占据网格的 4 个格子。每种属性碎片都是独一无二、仅有
                  1 个的，无法获得更多。每个属性碎片都有一个对应的属性会被提升，同时还有一个衡量其效果的乘数，称为威力（power）。刚放置时，属性碎片不会产生任何效果。要使碎片获得属性加成，必须为其充能。另一种碎片被称为增幅碎片（Booster
                  Fragment），占据网格的 5 个格子。增幅碎片数量充足，几乎不可能用完。虽然不会给用户带来直接的属性提升，但增幅碎片会将相邻属性碎片的效果提高
                  10%，并且无需充能。多个增幅碎片可以影响同一个属性碎片。
                </Typography>
                <br />

                <DummyGrid
                  width={4}
                  height={4}
                  fragments={[
                    new ActiveFragment({
                      x: 0,
                      y: 0,
                      rotation: 0,
                      fragment: Fragments.find((f) => f.id === 5) ?? Fragments[0],
                    }),
                    new ActiveFragment({
                      x: 0,
                      y: 2,
                      rotation: 0,
                      fragment: Fragments.find((f) => f.id === 101) ?? Fragments[0],
                    }),
                  ]}
                />
                <Typography sx={{ fontStyle: "italic" }}>
                  这个增幅碎片为其相邻的属性碎片提供加成。
                </Typography>
                <br />

                <DummyGrid
                  width={3}
                  height={4}
                  fragments={[
                    new ActiveFragment({
                      x: 0,
                      y: 1,
                      rotation: 3,
                      fragment: Fragments.find((f) => f.id === 100) ?? Fragments[0],
                    }),
                    new ActiveFragment({
                      x: 0,
                      y: 0,
                      rotation: 2,
                      fragment: Fragments.find((f) => f.id === 1) ?? Fragments[0],
                    }),
                  ]}
                />
                <Typography sx={{ fontStyle: "italic" }}>
                  即使这个增幅碎片在多处接触到属性碎片，加成也只会生效一次。
                </Typography>
                <br />

                <DummyGrid
                  width={4}
                  height={4}
                  fragments={[
                    new ActiveFragment({
                      x: 0,
                      y: 0,
                      rotation: 0,
                      fragment: Fragments.find((f) => f.id === 5) ?? Fragments[0],
                    }),
                    new ActiveFragment({
                      x: 1,
                      y: 1,
                      rotation: 0,
                      fragment: Fragments.find((f) => f.id === 105) ?? Fragments[0],
                    }),
                  ]}
                />
                <Typography sx={{ fontStyle: "italic" }}>
                  这个增幅碎片没有作用，因为它没有接触任何属性碎片。
                </Typography>
                <br />

                <DummyGrid
                  width={4}
                  height={4}
                  fragments={[
                    new ActiveFragment({
                      x: 0,
                      y: 0,
                      rotation: 1,
                      fragment: Fragments.find((f) => f.id === 27) ?? Fragments[0],
                    }),
                    new ActiveFragment({
                      x: 0,
                      y: 1,
                      rotation: 2,
                      fragment: Fragments.find((f) => f.id === 100) ?? Fragments[0],
                    }),
                    new ActiveFragment({
                      x: 2,
                      y: 0,
                      rotation: 1,
                      fragment: Fragments.find((f) => f.id === 30) ?? Fragments[0],
                    }),
                  ]}
                />
                <Typography sx={{ fontStyle: "italic" }}>
                  这个增幅碎片为它接触到的两个属性碎片都提供加成。
                </Typography>
                <br />

                <Typography>
                  属性碎片通过 stanek.chargeFragment(rootX, rootY) 这一 NetScript API 函数进行充能。充能过程通常需要
                  1000ms 完成，但在奖励时间内只需
                  200ms。函数执行完毕后，碎片的充能等级会根据所使用的线程数相应提升。单次调用 chargeFragment
                  所使用的最大线程数也会被记录为其最高充能。随着属性碎片的充能等级和最高充能的提高，其加成也会增加，但收益会递减。因此，通常最有效率的做法是均匀地为所有已放置的碎片充能。碎片的充能等级不会随时间下降，但在将其从棋盘上移除或安装强化时会被重置为
                  0。
                </Typography>
              </>,
            )
          }
        />
      </Typography>

      <Typography sx={{ mb: 1 }}>
        礼物是一个网格，你可以在上面放置被称为碎片的升级。主要类型的碎片可以提升一项属性，例如你的黑客技能或敏捷经验。属性碎片放置后需要通过脚本充能才能发挥作用。另一种碎片被称为增幅碎片，它们会提升相邻碎片（不含对角线）的效率。使用 Q/E 旋转碎片。
      </Typography>
      {staneksGift.storedCycles > 5 && (
        <Typography sx={{ mb: 1 }}>
          奖励时间：{convertTimeMsToTimeElapsedString(CONSTANTS.MilliPerCycle * staneksGift.storedCycles)}
        </Typography>
      )}
      <MainBoard gift={staneksGift} />
    </Container>
  );
}
