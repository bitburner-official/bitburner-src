import React from "react";
import { FactionName } from "@enums";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { CinematicText } from "../../ui/React/CinematicText";

export function BladeburnerCinematic(): React.ReactElement {
  return (
    <CinematicText
      lines={[
        `21世纪中叶，${FactionName.OmniTekIncorporated}推出了合成人（Synthoid，即合成仿生人），`,
        "这种存在与人类几乎一模一样。",
        "------",
        "他们的第六代合成人被称为MK-VI，比人类更强壮、更迅捷、",
        "也更加聪明。许多人认为MK-VI合成人是首个",
        "具有自我意识的AI实例。",
        "------",
        "不幸的是，2070年一个名为Ascendis Totalis的恐怖组织入侵了",
        `${FactionName.OmniTekIncorporated}，将一个失控的AI上传到了其合成人制造`,
        `工厂中。`,
        "------",
        "感染了失控AI的MK-VI合成人开始敌视人类，",
        "引发了人类历史上最致命的冲突。这段黑暗时期如今被称为",
        "合成人起义。",
        "------",
        "起义过后，进一步制造具备高级AI的合成人被明令禁止。",
        "未感染Ascendis Totalis失控AI的MK-VI合成人",
        "获准继续存续。",
        "------",
        "情报界认为，起义中失控的MK-VI合成人并未被全部找出并销毁，",
        "其中许多至今仍混迹于社会、",
        `扮作普通人生活。因此，许多国家组建了${FactionName.Bladeburners}`,
        "部门——负责调查和应对合成人威胁的特别部队。",
      ]}
      onDone={() => {
        Router.toPage(Page.Terminal);
      }}
    />
  );
}
