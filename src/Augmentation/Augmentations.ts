import { AugmentationName, CompletedProgramName, FactionName } from "@enums";
import { Augmentation, AugmentationCtorParams } from "./Augmentation";
import { getUnstableCircadianModulatorParams } from "./CircadianModulator";
import { CONSTANTS } from "../Constants";
import { createEnumKeyedRecord } from "../Types/Record";

export const Augmentations: Record<AugmentationName, Augmentation> = (() => {
  // Used to determine strength of NFG
  const donationBonus = CONSTANTS.Donations / 1e6 / 100; // 1 millionth of a percent per donation
  const metadata: Record<AugmentationName, Omit<AugmentationCtorParams, "name">> = {
    // Alphabetical
    // === A === //
    [AugmentationName.ADRPheromone1]: {
      repCost: 3.75e3,
      moneyCost: 1.75e7,
      info:
        "通过基因重组改造身体，使其分泌 ADR-V1 信息素——一种由科学家发现的人工信息素。" +
        "ADR-V1 信息素在分泌时会引发他人的钦佩与好感。",
      company_rep: 1.1,
      faction_rep: 1.1,
      charisma_exp: 1.05,
      factions: [
        FactionName.TianDiHui,
        FactionName.TheSyndicate,
        FactionName.NWO,
        FactionName.MegaCorp,
        FactionName.FourSigma,
      ],
    },
    [AugmentationName.ADRPheromone2]: {
      repCost: 6.25e4,
      moneyCost: 5.5e8,
      info:
        "通过基因重组改造身体，使其分泌 ADR-V2 信息素，它与 ADR-V1 类似但效力更强。" +
        "这种信息素在分泌时会引发他人的钦佩、好感与尊重。",
      company_rep: 1.2,
      faction_rep: 1.2,
      charisma: 1.1,
      factions: [
        FactionName.Silhouette,
        FactionName.FourSigma,
        FactionName.BachmanAndAssociates,
        FactionName.ClarkeIncorporated,
      ],
    },
    [AugmentationName.ArtificialBioNeuralNetwork]: {
      repCost: 2.75e5,
      moneyCost: 3e9,
      info:
        "一个由数百万纳米处理器构成的网络被植入大脑。" +
        "该网络旨在模仿生物大脑解决问题的方式，每个纳米处理器的作用类似于神经网络中的一个神经元。不过，这些" +
        "纳米处理器经过编程，其运算速度远超有机神经元，" +
        "使用户能够以更快的速度解决复杂得多的问题。",
      hacking_speed: 1.03,
      hacking_money: 1.15,
      hacking: 1.12,
      factions: [FactionName.BitRunners, FactionName.FulcrumSecretTechnologies],
    },
    [AugmentationName.ArtificialSynapticPotentiation]: {
      repCost: 6.25e3,
      moneyCost: 8e7,
      info:
        "向体内注射一种能够人为诱导突触增强（即强化突触连接）的化学物质。" +
        "这将带来认知能力的提升。",
      hacking_speed: 1.02,
      hacking_chance: 1.05,
      hacking_exp: 1.05,
      factions: [FactionName.TheBlackHand, FactionName.NiteSec],
    },
    // === B === //
    [AugmentationName.BeautyOfAphrodite]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "注入胸背神经的信息素挤出器。它会散发出一种宜人的气味，保证让" +
        "交谈对象变得更加随和。",
      stats: "该强化会标示出错误路径，使贿赂小游戏更容易。",
      charisma: 1.1,
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    [AugmentationName.BigDsBigBrain]: {
      isSpecial: true,
      factions: [],
      repCost: Infinity,
      moneyCost: Infinity,
      info:
        "一枚承载着史上最伟大 BitRunner 灵魂的芯片。" +
        "安装这件遗物将大幅提升你的所有属性。" +
        "不过，它可能对使用者的精神健康造成意想不到的影响。",
      stats: "赋予你难以想象的力量。",
      hacking: 2,
      strength: 2,
      defense: 2,
      dexterity: 2,
      agility: 2,
      charisma: 2,
      hacking_exp: 2,
      strength_exp: 2,
      defense_exp: 2,
      dexterity_exp: 2,
      agility_exp: 2,
      charisma_exp: 2,
      hacking_chance: 2,
      hacking_speed: 2,
      hacking_money: 2,
      hacking_grow: 2,
      company_rep: 2,
      faction_rep: 2,
      crime_money: 2,
      crime_success: 2,
      work_money: 2,
      hacknet_node_money: 2,
      hacknet_node_purchase_cost: 0.5,
      hacknet_node_ram_cost: 0.5,
      hacknet_node_core_cost: 0.5,
      hacknet_node_level_cost: 0.5,
      bladeburner_max_stamina: 2,
      bladeburner_stamina_gain: 2,
      bladeburner_analysis: 2,
      bladeburner_success_chance: 2,

      startingMoney: 1e12,
      programs: [
        CompletedProgramName.bruteSsh,
        CompletedProgramName.ftpCrack,
        CompletedProgramName.relaySmtp,
        CompletedProgramName.httpWorm,
        CompletedProgramName.sqlInject,
        CompletedProgramName.deepScan1,
        CompletedProgramName.deepScan2,
        CompletedProgramName.serverProfiler,
        CompletedProgramName.autoLink,
        CompletedProgramName.formulas,
      ],
    },
    [AugmentationName.BionicArms]: {
      repCost: 6.25e4,
      moneyCost: 2.75e8,
      info: "由塑钢和碳纤维打造的义肢手臂，完全取代使用者的天然手臂。",
      strength: 1.3,
      dexterity: 1.3,
      factions: [FactionName.Tetrads],
    },
    [AugmentationName.BionicLegs]: {
      repCost: 1.5e5,
      moneyCost: 3.75e8,
      info: "由塑钢和碳纤维打造的义肢双腿，提升奔跑速度。",
      agility: 1.6,
      factions: [
        FactionName.SpeakersForTheDead,
        FactionName.TheSyndicate,
        FactionName.KuaiGongInternational,
        FactionName.OmniTekIncorporated,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.BionicSpine]: {
      repCost: 4.5e4,
      moneyCost: 1.25e8,
      info:
        "脊柱由塑钢和碳纤维重建。" +
        "它如今能够刺激并调节穿过脊髓的神经信号，" +
        "改善感官与反应速度。" +
        "“仿生脊柱”还会与所有其他“仿生”植入体交互。",
      strength: 1.15,
      defense: 1.15,
      agility: 1.15,
      dexterity: 1.15,
      factions: [
        FactionName.SpeakersForTheDead,
        FactionName.TheSyndicate,
        FactionName.KuaiGongInternational,
        FactionName.OmniTekIncorporated,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.BitWire]: {
      repCost: 3.75e3,
      moneyCost: 1e7,
      info:
        "嵌入大脑的小型脑部植入体。它能调节并改善大脑的运算" +
        "能力。",
      hacking: 1.05,
      factions: [FactionName.CyberSec, FactionName.NiteSec],
    },
    [AugmentationName.BladeArmor]: {
      repCost: 1.25e4,
      moneyCost: 1.375e9,
      info:
        `为${FactionName.Bladeburners}部队设计的动力外骨骼装甲。这套` +
        "外骨骼适应力极强，能够保护穿戴者免受钝击、穿刺、" +
        "震荡、高温、化学和电击创伤。它还能增强使用者的" +
        "身体能力。",
      strength: 1.04,
      defense: 1.04,
      dexterity: 1.04,
      agility: 1.04,
      bladeburner_stamina_gain: 1.02,
      bladeburner_success_chance: 1.03,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BladeArmorEnergyShielding]: {
      repCost: 2.125e4,
      moneyCost: 5.5e9,
      info:
        "为 BLADE-51b 特斯拉装甲升级一套等离子能量推进系统，" +
        "可投射出能量护盾力场。",
      prereqs: [AugmentationName.BladeArmor],
      defense: 1.05,
      bladeburner_success_chance: 1.06,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BladeArmorIPU]: {
      repCost: 1.5e4,
      moneyCost: 1.1e9,
      info:
        "为 BLADE-51b 特斯拉装甲升级一台 AI 信息处理单元，" +
        "专门用于分析合成人相关的数据与情报。",
      prereqs: [AugmentationName.BladeArmor],
      bladeburner_analysis: 1.15,
      bladeburner_success_chance: 1.02,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BladeArmorOmnibeam]: {
      repCost: 6.25e4,
      moneyCost: 2.75e10,
      info:
        "将 BLADE-51b 特斯拉装甲的 Unibeam 强化升级为" +
        "多光纤系统。这件升级后的武器使用多个光纤激光" +
        "模块，它们汇聚成一束最高可达 2000MW 的更强光束。",
      prereqs: [AugmentationName.BladeArmorUnibeam],
      bladeburner_success_chance: 1.1,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BladeArmorPowerCells]: {
      repCost: 1.875e4,
      moneyCost: 2.75e9,
      info:
        "为 BLADE-51b 特斯拉装甲升级离子动力电池，" +
        "能更高效地储存和使用能量。",
      prereqs: [AugmentationName.BladeArmor],
      bladeburner_success_chance: 1.05,
      bladeburner_stamina_gain: 1.02,
      bladeburner_max_stamina: 1.05,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BladeArmorUnibeam]: {
      repCost: 3.125e4,
      moneyCost: 1.65e10,
      info:
        "为 BLADE-51b 特斯拉装甲升级浓缩氟化氘激光武器。" +
        "它的精确度与准度使其适合在快速瓦解威胁的同时" +
        "将伤亡降到最低。",
      prereqs: [AugmentationName.BladeArmor],
      bladeburner_success_chance: 1.08,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BladeRunner]: {
      repCost: 2e4,
      moneyCost: 8.25e9,
      info:
        `在合成人起义期间专为${FactionName.Bladeburners}打造的` +
        "仿生足部强化。人足的有机肌肉组织" +
        "由智能伺服电机控制的柔性碳纳米管基质加以强化。",
      agility: 1.05,
      bladeburner_max_stamina: 1.05,
      bladeburner_stamina_gain: 1.05,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BladesSimulacrum]: {
      repCost: 1.25e3,
      moneyCost: 1.5e11,
      info:
        "高度先进的物质相位移模块，嵌入" +
        "脑干和小脑。该强化允许" +
        "使用者在极大的半径内投射并控制全息拟像。" +
        "这些经过特殊改装的全息影像曾被 Bladeburner 部队" +
        "专门武器化，用来对付合成人。",
      stats:
        "该强化让你可以同时执行 Bladeburner 行动和其他行动（例如工作、犯罪等）。",
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.BrachiBlades]: {
      repCost: 1.25e4,
      moneyCost: 9e7,
      info: "一组植入皮下、可伸缩的塑钢刀刃。",
      strength: 1.15,
      defense: 1.15,
      crime_success: 1.1,
      crime_money: 1.15,
      factions: [FactionName.TheSyndicate],
    },
    // === C === //
    [AugmentationName.CRTX42AA]: {
      repCost: 4.5e4,
      moneyCost: 2.25e8,
      info:
        "将 CRTX42-AA 基因注入基因组。" +
        "CRTX42-AA 是一种人工合成基因，靶向视觉皮层和前额叶皮层，提升认知能力。",
      hacking: 1.08,
      hacking_exp: 1.15,
      factions: [FactionName.NiteSec],
    },
    [AugmentationName.CashRoot]: {
      repCost: 1.25e4,
      moneyCost: 1.25e8,
      info: "保存在小芯片上的一组数字资产。芯片被植入你的手腕。芯片上的一个小插口可以让你把它连接到电脑并上传资产。",
      startingMoney: 1e6,
      programs: [CompletedProgramName.bruteSsh],
      factions: [FactionName.Sector12],
    },
    [AugmentationName.ChaosOfDionysus]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info: "视-枕植入体，在大脑解析之前处理视觉信号。",
      stats: "该强化通过翻转词语，使倒序小游戏更容易。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    [AugmentationName.CombatRib1]: {
      repCost: 7.5e3,
      moneyCost: 2.375e7,
      info:
        "肋骨经过强化改造，会持续向血液中释放增强剂，" +
        "提高血液的携氧能力。",
      strength: 1.1,
      defense: 1.1,
      factions: [
        FactionName.SlumSnakes,
        FactionName.TheDarkArmy,
        FactionName.TheSyndicate,
        FactionName.Volhaven,
        FactionName.Ishima,
        FactionName.OmniTekIncorporated,
        FactionName.KuaiGongInternational,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.CombatRib2]: {
      repCost: 1.875e4,
      moneyCost: 6.5e7,
      info:
        "“战斗肋骨”强化的升级版本，加入了强效兴奋剂，" +
        "可改善专注力与耐力，同时缩短反应时间并减轻疲劳。",
      prereqs: [AugmentationName.CombatRib1],
      strength: 1.14,
      defense: 1.14,
      factions: [
        FactionName.TheDarkArmy,
        FactionName.TheSyndicate,
        FactionName.Volhaven,
        FactionName.OmniTekIncorporated,
        FactionName.KuaiGongInternational,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.CombatRib3]: {
      repCost: 3.5e4,
      moneyCost: 1.2e8,
      info:
        "“战斗肋骨”强化的最新版本，会释放先进的合成代谢类固醇，" +
        "在安全无副作用的前提下提升肌肉量与身体表现。",
      prereqs: [AugmentationName.CombatRib2, AugmentationName.CombatRib1],
      strength: 1.18,
      defense: 1.18,
      factions: [
        FactionName.TheDarkArmy,
        FactionName.TheSyndicate,
        FactionName.OmniTekIncorporated,
        FactionName.KuaiGongInternational,
        FactionName.BladeIndustries,
        FactionName.TheCovenant,
      ],
    },
    [AugmentationName.CongruityImplant]: {
      repCost: Infinity,
      moneyCost: 50e12,
      info:
        "由移植研究先驱开发，该植入体会产生稳定脉冲，似乎对熵病毒有抵消效果。\n\n" +
        "注意：由于未知的原因，小写的 'v' 似乎是它正常运作不可或缺的一部分。",
      stats: "该强化会清除熵病毒，并防止它再次影响你。",
      factions: [],
    },
    [AugmentationName.CordiARCReactor]: {
      repCost: 1.125e6,
      moneyCost: 5e9,
      info:
        "胸腔内装有一个小型腔室，专门用于容纳并维持氢等离子体。" +
        "等离子体通过核聚变产生能量，" +
        "为身体提供无限的清洁能源。",
      strength: 1.35,
      defense: 1.35,
      dexterity: 1.35,
      agility: 1.35,
      strength_exp: 1.35,
      defense_exp: 1.35,
      dexterity_exp: 1.35,
      agility_exp: 1.35,
      factions: [FactionName.MegaCorp],
    },
    [AugmentationName.CranialSignalProcessorsG1]: {
      repCost: 1e4,
      moneyCost: 7e7,
      info:
        "第一代颅信号处理器。颅信号处理器" +
        "是一组连接到大脑神经元的专用微处理器。这些芯片处理神经信号，快速自动地完成特定运算，" +
        "从而让大脑不必亲自操劳。",
      hacking_speed: 1.01,
      hacking: 1.05,
      factions: [FactionName.CyberSec, FactionName.NiteSec],
    },
    [AugmentationName.CranialSignalProcessorsG2]: {
      repCost: 1.875e4,
      moneyCost: 1.25e8,
      info:
        "第二代颅信号处理器。颅信号处理器" +
        "是一组连接到大脑神经元的专用微处理器。这些芯片处理神经信号，快速自动地完成特定运算，" +
        "从而让大脑不必亲自操劳。",
      prereqs: [AugmentationName.CranialSignalProcessorsG1],
      hacking_speed: 1.02,
      hacking_chance: 1.05,
      hacking: 1.07,
      factions: [FactionName.CyberSec, FactionName.NiteSec],
    },
    [AugmentationName.CranialSignalProcessorsG3]: {
      repCost: 5e4,
      moneyCost: 5.5e8,
      info:
        "第三代颅信号处理器。颅信号处理器" +
        "是一组连接到大脑神经元的专用微处理器。这些芯片处理神经信号，快速自动地完成特定运算，" +
        "从而让大脑不必亲自操劳。",
      prereqs: [AugmentationName.CranialSignalProcessorsG2, AugmentationName.CranialSignalProcessorsG1],
      hacking_speed: 1.02,
      hacking_money: 1.15,
      hacking: 1.09,
      factions: [FactionName.NiteSec, FactionName.TheBlackHand, FactionName.BitRunners],
    },
    [AugmentationName.CranialSignalProcessorsG4]: {
      repCost: 1.25e5,
      moneyCost: 1.1e9,
      info:
        "第四代颅信号处理器。颅信号处理器" +
        "是一组连接到大脑神经元的专用微处理器。这些芯片处理神经信号，快速自动地完成特定运算，" +
        "从而让大脑不必亲自操劳。",
      prereqs: [
        AugmentationName.CranialSignalProcessorsG3,
        AugmentationName.CranialSignalProcessorsG2,
        AugmentationName.CranialSignalProcessorsG1,
      ],
      hacking_speed: 1.02,
      hacking_money: 1.2,
      hacking_grow: 1.25,
      factions: [FactionName.TheBlackHand, FactionName.BitRunners],
    },
    [AugmentationName.CranialSignalProcessorsG5]: {
      repCost: 2.5e5,
      moneyCost: 2.25e9,
      info:
        "第五代颅信号处理器。颅信号处理器" +
        "是一组连接到大脑神经元的专用微处理器。这些芯片处理神经信号，快速自动地完成特定运算，" +
        "从而让大脑不必亲自操劳。",
      prereqs: [
        AugmentationName.CranialSignalProcessorsG4,
        AugmentationName.CranialSignalProcessorsG3,
        AugmentationName.CranialSignalProcessorsG2,
        AugmentationName.CranialSignalProcessorsG1,
      ],
      hacking: 1.3,
      hacking_money: 1.25,
      hacking_grow: 1.75,
      factions: [FactionName.BitRunners],
    },
    // === D === //
    [AugmentationName.DataJack]: {
      repCost: 1.125e5,
      moneyCost: 4.5e8,
      info:
        "一种脑部植入体，为计算机主存与思维之间提供直接无线通信的接口。" +
        "该植入体不仅让使用者能够访问计算机内存，还能修改" +
        "和删除它。",
      hacking_money: 1.25,
      factions: [
        FactionName.BitRunners,
        FactionName.TheBlackHand,
        FactionName.NiteSec,
        FactionName.Chongqing,
        FactionName.NewTokyo,
      ],
    },
    [AugmentationName.DermaForce]: {
      repCost: 1.5e4,
      moneyCost: 5e7,
      info:
        "移植到身体上的人造皮肤。这种皮肤由" +
        "数百万个纳米机器人构成，能够投射高密度μ子束，" +
        "在使用者周围形成能量屏障。",
      defense: 1.4,
      charisma: 1.03,
      factions: [FactionName.Volhaven],
    },
    // === E === //
    [AugmentationName.Eloquence]: {
      repCost: 2.5e4,
      moneyCost: 2.5e8,
      info:
        "一种神经植入体，增强使用者与他人共鸣的能力。" +
        "它能够分析并解读周围人的情绪，让使用者" +
        "更好地理解并影响他们。",
      charisma: 1.05,
      crime_success: 1.1,
      work_money: 1.2,
      factions: [FactionName.SpeakersForTheDead],
    },
    [AugmentationName.EMS4Recombination]: {
      repCost: 2.5e3,
      moneyCost: 2.75e8,
      info:
        "对 EMS-4 基因进行的 DNA 重组。这种基因工程" +
        "技术最初在合成人起义期间用于 Bladeburners，" +
        "以诱导清醒与专注、抑制恐惧、减少共情、" +
        "改善反应和记忆等。",
      bladeburner_success_chance: 1.03,
      bladeburner_analysis: 1.05,
      bladeburner_stamina_gain: 1.02,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.ENM]: {
      repCost: 1.5e4,
      moneyCost: 2.5e8,
      info:
        "一种嵌入手臂内的轻薄设备，包含可连接附近网络的无线模块。" +
        "一旦连接，Netburner 模块便能捕获并处理该网络上的所有流量。" +
        "就其本身而言，嵌入式 Netburner 模块作用有限，但可以安装各种极其强大的升级，让你完全" +
        "掌控网络上的流量。",
      hacking: 1.08,
      factions: [
        FactionName.BitRunners,
        FactionName.TheBlackHand,
        FactionName.NiteSec,
        FactionName.ECorp,
        FactionName.MegaCorp,
        FactionName.FulcrumSecretTechnologies,
        FactionName.NWO,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.ENMAnalyzeEngine]: {
      repCost: 6.25e5,
      moneyCost: 6e9,
      info:
        "为嵌入式 Netburner 模块安装分析引擎，这是一个 CPU 集群，" +
        "性能远超 Netburner 模块自带的单核处理器。",
      prereqs: [AugmentationName.ENM],
      hacking_speed: 1.1,
      factions: [
        FactionName.ECorp,
        FactionName.MegaCorp,
        FactionName.FulcrumSecretTechnologies,
        FactionName.NWO,
        FactionName.Daedalus,
        FactionName.TheCovenant,
        FactionName.Illuminati,
      ],
    },
    [AugmentationName.ENMCore]: {
      repCost: 175e3,
      moneyCost: 2.5e9,
      info:
        "Core 库是一种为嵌入式 Netburner 模块升级固件的植入体。" +
        "这次升级使嵌入式 Netburner 模块能够在网络上生成自己的数据。",
      prereqs: [AugmentationName.ENM],
      hacking_speed: 1.03,
      hacking_money: 1.1,
      hacking_chance: 1.03,
      hacking_exp: 1.07,
      hacking: 1.07,
      factions: [
        FactionName.BitRunners,
        FactionName.TheBlackHand,
        FactionName.ECorp,
        FactionName.MegaCorp,
        FactionName.FulcrumSecretTechnologies,
        FactionName.NWO,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.ENMCoreV2]: {
      repCost: 1e6,
      moneyCost: 4.5e9,
      info:
        "Core V2 库是一种为嵌入式 Netburner 模块升级固件的植入体。" +
        "升级后的固件使嵌入式 Netburner 模块能够通过重新路由流量、伪造 IP 地址以及篡改网络" +
        "数据包中的数据来控制网络上的信息。",
      prereqs: [AugmentationName.ENMCore, AugmentationName.ENM],
      hacking_speed: 1.05,
      hacking_money: 1.3,
      hacking_chance: 1.05,
      hacking_exp: 1.15,
      hacking: 1.08,
      factions: [
        FactionName.BitRunners,
        FactionName.ECorp,
        FactionName.MegaCorp,
        FactionName.FulcrumSecretTechnologies,
        FactionName.NWO,
        FactionName.BladeIndustries,
        FactionName.OmniTekIncorporated,
        FactionName.KuaiGongInternational,
      ],
    },
    [AugmentationName.ENMCoreV3]: {
      repCost: 1.75e6,
      moneyCost: 7.5e9,
      info:
        "Core V3 库是一种为嵌入式 Netburner 模块升级固件的植入体。" +
        "升级后的固件使嵌入式 Netburner 模块能够无缝地向网络上的任何设备注入代码。",
      prereqs: [AugmentationName.ENMCoreV2, AugmentationName.ENMCore, AugmentationName.ENM],
      hacking_speed: 1.05,
      hacking_money: 1.4,
      hacking_chance: 1.1,
      hacking_exp: 1.25,
      hacking: 1.1,
      factions: [
        FactionName.ECorp,
        FactionName.MegaCorp,
        FactionName.FulcrumSecretTechnologies,
        FactionName.NWO,
        FactionName.Daedalus,
        FactionName.TheCovenant,
        FactionName.Illuminati,
      ],
    },
    [AugmentationName.ENMDMA]: {
      repCost: 1e6,
      moneyCost: 7e9,
      info:
        "该植入体在嵌入式 Netburner 模块中安装了直接内存访问（DMA）控制器。" +
        "这使模块可以直接向网络上设备的主存发送数据并从中接收数据。",
      prereqs: [AugmentationName.ENM],
      hacking_money: 1.4,
      hacking_chance: 1.2,
      factions: [
        FactionName.ECorp,
        FactionName.MegaCorp,
        FactionName.FulcrumSecretTechnologies,
        FactionName.NWO,
        FactionName.Daedalus,
        FactionName.TheCovenant,
        FactionName.Illuminati,
      ],
    },
    [AugmentationName.EnhancedMyelinSheathing]: {
      repCost: 1e5,
      moneyCost: 1.375e9,
      info:
        "利用电信号在人体内诱导出一种全新的人工髓鞘形成过程。" +
        "这一过程使神经系统中增殖出新的合成髓鞘。" +
        "这些髓鞘传导神经信号的速度远超有机髓鞘，" +
        "带来更快的处理速度和更好的大脑功能。",
      hacking_speed: 1.03,
      hacking_exp: 1.1,
      hacking: 1.08,
      factions: [FactionName.FulcrumSecretTechnologies, FactionName.BitRunners, FactionName.TheBlackHand],
    },
    [AugmentationName.EnhancedSocialInteractionImplant]: {
      repCost: 3.75e5,
      moneyCost: 1.375e9,
      info:
        "一种颅部植入体，极大帮助使用者分析社交情境与互动。" +
        "该系统利用面部表情、肢体语言、语调和抑扬顿挫等各种各样的因素来确定社交" +
        "情境中的最佳行动方案。植入体还使用深度学习软件持续学习新的行为" +
        "模式以及如何做出最佳回应。",
      charisma: 1.6,
      charisma_exp: 1.6,
      factions: [
        FactionName.BachmanAndAssociates,
        FactionName.NWO,
        FactionName.ClarkeIncorporated,
        FactionName.OmniTekIncorporated,
        FactionName.FourSigma,
      ],
    },
    [AugmentationName.EsperEyewear]: {
      repCost: 1.25e3,
      moneyCost: 1.65e8,
      info:
        "专为 Bladeburner 部队设计的防弹级可伸缩护目镜。" +
        "通过在颅骨眼眶中安装机械框架来植入。" +
        "该框架与大脑交互，允许使用者自动伸出和收回护目镜。护目镜可防护" +
        "碎片、弹片、激光、致盲闪光和毒气。它还" +
        "嵌入了一颗数据处理芯片，可以编程显示 AR HUD，" +
        "在外勤任务中辅助使用者。",
      bladeburner_success_chance: 1.03,
      dexterity: 1.05,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    // === F === //
    [AugmentationName.FloodOfPoseidon]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info: "用于视觉-转向识别的 Transtinatium VVD 网格校正器。",
      stats: "该强化会标示出正确选项，使符号配对小游戏更容易。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    [AugmentationName.FocusWire]: {
      repCost: 7.5e4,
      moneyCost: 9e8,
      info: "一种颅部植入体，通过阻断大脑中的特定神经通路来杜绝拖延。",
      hacking_exp: 1.05,
      strength_exp: 1.05,
      defense_exp: 1.05,
      dexterity_exp: 1.05,
      agility_exp: 1.05,
      charisma_exp: 1.05,
      company_rep: 1.1,
      work_money: 1.2,
      factions: [
        FactionName.BachmanAndAssociates,
        FactionName.ClarkeIncorporated,
        FactionName.FourSigma,
        FactionName.KuaiGongInternational,
      ],
    },
    // === G === //
    [AugmentationName.Glib]: {
      repCost: 4.05e4,
      moneyCost: 2.5e9,
      info:
        "一种植入体，激活后能让说话者在接下来的一小时内听起来令人难以置信地合情合理、无懈可击。" +
        "它不需要使用者集中注意力，只需要一个语音激活组件。它甚至能影响" +
        "大多数电子检测手段。",
      charisma_exp: 1.2,
      company_rep: 1.1,
      factions: [FactionName.Tetrads, FactionName.Bladeburners],
    },
    [AugmentationName.GoldenTongue]: {
      repCost: 1.25e5,
      moneyCost: 1.25e8,
      info:
        "一种听觉植入体，增强使用者沟通与说服他人的能力。" +
        "植入体使用一个预测模型，让使用者精确说出听众" +
        "想听的话。这种植入体被许多高层管理人员和政府官员广泛使用。",
      charisma: 1.1,
      charisma_exp: 1.3,
      factions: [FactionName.SpeakersForTheDead],
    },
    [AugmentationName.GolemSerum]: {
      repCost: 3.125e4,
      moneyCost: 1.1e10,
      info:
        "一种能够永久增强人体多方面能力的血清，" +
        "包括力量、速度、免疫系统增强以及线粒体效率。这种" +
        "血清最初由中国军方为打造超级士兵而研发。",
      strength: 1.07,
      defense: 1.07,
      dexterity: 1.07,
      agility: 1.07,
      bladeburner_stamina_gain: 1.05,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.GrapheneBionicArms]: {
      repCost: 5e5,
      moneyCost: 3.75e9,
      info:
        "“仿生手臂”强化的升级版。它将先进的石墨烯材料" +
        "注入义肢手臂，使其更强、更轻。",
      prereqs: [AugmentationName.BionicArms],
      strength: 1.85,
      dexterity: 1.85,
      factions: [FactionName.TheDarkArmy],
    },
    [AugmentationName.GrapheneBionicLegs]: {
      repCost: 7.5e5,
      moneyCost: 4.5e9,
      info:
        "“仿生双腿”强化的升级版。双腿与石墨烯融合，" +
        "大幅提升跳跃能力。",
      prereqs: [AugmentationName.BionicLegs],
      agility: 2.5,
      factions: [FactionName.MegaCorp, FactionName.ECorp, FactionName.FulcrumSecretTechnologies],
    },
    [AugmentationName.GrapheneBionicSpine]: {
      repCost: 1.625e6,
      moneyCost: 6e9,
      info:
        "“仿生脊柱”强化的升级版。脊柱与石墨烯融合，" +
        "增强耐久性并全面激发身体机能。",
      prereqs: [AugmentationName.BionicSpine],
      strength: 1.6,
      defense: 1.6,
      agility: 1.6,
      dexterity: 1.6,
      factions: [FactionName.FulcrumSecretTechnologies, FactionName.ECorp],
    },
    [AugmentationName.GrapheneBoneLacings]: {
      repCost: 1.125e6,
      moneyCost: 4.25e9,
      info: "石墨烯被移植并融合进骨骼结构，提升骨密度和抗拉强度。",
      strength: 1.7,
      defense: 1.7,
      factions: [FactionName.FulcrumSecretTechnologies, FactionName.TheCovenant],
    },
    [AugmentationName.GrapheneBrachiBlades]: {
      repCost: 2.25e5,
      moneyCost: 2.5e9,
      info:
        "臂刃（BrachiBlades）强化的升级版。它为可伸缩刀刃" +
        "注入先进的石墨烯材料，" +
        "使其更坚固、更轻便。",
      prereqs: [AugmentationName.BrachiBlades],
      strength: 1.4,
      defense: 1.4,
      crime_success: 1.1,
      crime_money: 1.3,
      factions: [FactionName.SpeakersForTheDead],
    },
    // === H === //
    [AugmentationName.HacknetNodeCPUUpload]: {
      repCost: 3.75e3,
      moneyCost: 1.1e7,
      info:
        "将 Hacknet 节点 CPU 的架构与设计细节上传" +
        "到大脑中。这使使用者能够为 Hacknet 节点设计性能更佳的定制硬件和软件。",
      hacknet_node_money: 1.15,
      hacknet_node_purchase_cost: 0.85,
      factions: [FactionName.Netburners],
    },
    [AugmentationName.HacknetNodeCacheUpload]: {
      repCost: 2.5e3,
      moneyCost: 5.5e6,
      info:
        "将 Hacknet 节点主存缓存的架构与设计细节上传" +
        "到大脑中。这使使用者能够为 Hacknet 节点设计性能更佳的定制缓存硬件。",
      hacknet_node_money: 1.1,
      hacknet_node_level_cost: 0.85,
      factions: [FactionName.Netburners],
    },
    [AugmentationName.HacknetNodeCoreDNI]: {
      repCost: 1.25e4,
      moneyCost: 6e7,
      info:
        "在手臂中安装可连接 Hacknet 节点的直接神经接口插口。" +
        "这让使用者能够用电化学信号访问和操纵节点的处理逻辑。",
      hacknet_node_money: 1.45,
      factions: [FactionName.Netburners],
    },
    [AugmentationName.HacknetNodeKernelDNI]: {
      repCost: 7.5e3,
      moneyCost: 4e7,
      info:
        "在手臂中安装可连接 Hacknet 节点的直接神经接口插口。" +
        "这让使用者能够用电化学信号访问和操纵节点的内核。",
      hacknet_node_money: 1.25,
      factions: [FactionName.Netburners],
    },
    [AugmentationName.HacknetNodeNICUpload]: {
      repCost: 1.875e3,
      moneyCost: 4.5e6,
      info:
        "将 Hacknet 节点的网卡（NIC）架构与设计细节上传" +
        "到大脑中。这使使用者能够为 Hacknet 节点设计性能更佳的定制网卡。",
      hacknet_node_money: 1.1,
      hacknet_node_purchase_cost: 0.9,
      factions: [FactionName.Netburners],
    },
    [AugmentationName.HemoRecirculator]: {
      moneyCost: 4.5e7,
      repCost: 1e4,
      info: "一种心脏植入体，大幅提升身体高效利用血液和泵送血液的能力。",
      strength: 1.08,
      defense: 1.08,
      agility: 1.08,
      dexterity: 1.08,
      charisma: 1.08,
      factions: [FactionName.Tetrads, FactionName.TheDarkArmy, FactionName.TheSyndicate],
    },
    [AugmentationName.HiveMind]: {
      repCost: 1.5e6,
      moneyCost: 5.5e9,
      info:
        `由${FactionName.ECorp}开发的脑部植入体。他们没有透露` +
        "这个植入体究竟做什么，但承诺它会大幅" +
        "增强你的能力。",
      hacking_grow: 3,
      stats:
        `许多黑客说安装这个强化后，他们伪造资金的效果比平常好得多。` +
        `一份从${FactionName.ECorp}泄露的文件里包含这样一条奇怪的消息："vnmehidi's gorw oprwe si ebesaccisl aiv sliguntayir"。`,
      factions: [FactionName.ECorp],
    },
    [AugmentationName.HuntOfArtemis]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info: "基于 Micha Eike Siemon 技术的磁力涡轮增压机，提高使用者的电磁敏感度。",
      stats:
        "该强化会显示所有地雷的位置并保持其方位，使扫雷小游戏更容易。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    [AugmentationName.HydroflameLeftArm]: {
      repCost: 1.25e6,
      moneyCost: 2.5e12,
      info:
        "一位超脱此界的传奇 BitRunner 的左臂。" +
        "它会投射出淡蓝色的能量护盾，保护裸露的内部结构。" +
        "尽管它不含任何武器，但先进的钨钛" +
        "合金能将使用者的力量提升到难以置信的水平。",
      strength: 2.8,
      factions: [FactionName.NWO],
    },
    [AugmentationName.HyperionV1]: {
      repCost: 1.25e4,
      moneyCost: 2.75e9,
      info:
        "一对嵌入双手的小型等离子炮。Hyperion 能够" +
        "快速发射高密度等离子体弹。这种武器旨在用于对付经过强化的敌人，因为等离子体的电离特性会干扰强化的电气系统。不过，" +
        "凭借其高温与冲击力，它对付未经强化的敌人同样有效。",
      bladeburner_success_chance: 1.06,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.HyperionV2]: {
      repCost: 2.5e4,
      moneyCost: 5.5e9,
      info:
        "一对嵌入双手的小型等离子炮。该强化比最初的 V1 型号更先进、更强大。" +
        "V2 型号更加节能、更加精准，且发射等离子弹的速度远高于 V1 型号。",
      prereqs: [AugmentationName.HyperionV1],
      bladeburner_success_chance: 1.08,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.Hypersight]: {
      repCost: 1.5e5,
      moneyCost: 2.75e9,
      info:
        "一种仿生眼植入体，让使用者的视力远超自然人类。" +
        "植入体内嵌的电路使其能够透过墙壁等实体障碍物探测热量和移动，从而提供类似“透视眼”的能力。",
      dexterity: 1.4,
      hacking_speed: 1.03,
      hacking_money: 1.1,
      charisma: 1.03,
      factions: [FactionName.BladeIndustries, FactionName.KuaiGongInternational],
    },
    // === I === //
    [AugmentationName.INFRARet]: {
      repCost: 7.5e3,
      moneyCost: 3e7,
      info: "一枚位于视网膜后方的微型芯片。该植入体让使用者能够以视觉探测红外辐射。",
      crime_success: 1.25,
      crime_money: 1.1,
      dexterity: 1.1,
      factions: [FactionName.Ishima],
    },
    [AugmentationName.INTERLINKED]: {
      repCost: 2.5e4,
      moneyCost: 5.5e9,
      info:
        "一种药物，会诱使身体的细胞外基质（ECM）发生 DNA 改性。" +
        "这改善了 ECM 在结构上支撑身体的能力，带来更高的力量" +
        "与耐久性。",
      strength_exp: 1.05,
      defense_exp: 1.05,
      dexterity_exp: 1.05,
      agility_exp: 1.05,
      bladeburner_max_stamina: 1.1,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    // === J === //
    // === K === //
    [AugmentationName.KnowledgeOfApollo]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info: "采用 -φ 卡米恩（karmion）的钕系保持式欺骗器（fjengeln spoofer），对被植入者的δ波有净正向影响。",
      stats: "该强化会标示出错误的导线，使剪线小游戏更容易。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    // === L === //
    [AugmentationName.LuminCloaking1]: {
      repCost: 1.5e3,
      moneyCost: 5e6,
      info:
        "一种皮肤植入体，用高度先进的合成细胞强化皮肤。" +
        "这些细胞在通电时具有负折射率。因此，它们能让光线" +
        "绕过皮肤，使肉眼很难看到使用者。",
      agility: 1.05,
      charisma: 1.03,
      crime_money: 1.1,
      factions: [FactionName.SlumSnakes, FactionName.Tetrads],
    },
    [AugmentationName.LuminCloaking2]: {
      repCost: 5e3,
      moneyCost: 3e7,
      info:
        "LuminCloaking-V1 强化的更高级版本。这种皮肤植入体" +
        "用高度先进的合成细胞强化皮肤。这些细胞在通电时不仅能折射光线，还能折射热量，" +
        "让使用者更具隐蔽性的同时也更有韧性。",
      prereqs: [AugmentationName.LuminCloaking1],
      agility: 1.1,
      defense: 1.1,
      charisma_exp: 1.1,
      crime_money: 1.25,
      factions: [FactionName.SlumSnakes, FactionName.Tetrads],
    },
    // === M === //
    [AugmentationName.Magnetism]: {
      repCost: 1.5e4,
      moneyCost: 2.5e8,
      info: "一种颅部植入体，能增强佩戴者的吸引力。（连它的发明者也不太清楚它的原理）。",
      charisma: 1.05,
      company_rep: 1.1,
      factions: [FactionName.TheBlackHand, FactionName.TheDarkArmy],
    },
    [AugmentationName.MightOfAres]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "取自年迈武术宗师的额外眼神经元。将它们注入体内后，使用者将获得" +
        "预判敌人动作的能力。",
      stats:
        "该强化会通过指示器提示哨兵何时分心，使劈砍小游戏更容易。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    // === N === //
    [AugmentationName.NanofiberWeave]: {
      repCost: 3.75e4,
      moneyCost: 1.25e8,
      info:
        "利用静电纺丝技术将合成纳米纤维织入皮肤的细胞外基质，" +
        "从而改善其再生与细胞外稳态能力。",
      strength: 1.2,
      defense: 1.2,
      charisma: 1.05,
      factions: [
        FactionName.TheDarkArmy,
        FactionName.TheSyndicate,
        FactionName.OmniTekIncorporated,
        FactionName.BladeIndustries,
        FactionName.TianDiHui,
        FactionName.SpeakersForTheDead,
        FactionName.FulcrumSecretTechnologies,
      ],
    },
    [AugmentationName.Neotra]: {
      repCost: 5.625e5,
      moneyCost: 2.875e9,
      info:
        "一种注射到骨骼系统与皮肤系统中的高度先进的有机技术药物。" +
        "这种药物会永久改变身体皮肤和骨骼细胞的 DNA，赋予它们自我修复" +
        "与重构的能力。",
      strength: 1.55,
      defense: 1.55,
      charisma: 1.55,
      factions: [FactionName.BladeIndustries],
    },
    [AugmentationName.NeuralAccelerator]: {
      repCost: 2e5,
      moneyCost: 1.75e9,
      info:
        "一种加速生物神经网络处理速度的微处理器。" +
        "这是一种嵌入大脑内部的颅部植入体。",
      hacking: 1.1,
      hacking_exp: 1.15,
      hacking_money: 1.2,
      factions: [FactionName.BitRunners],
    },
    [AugmentationName.NeuralRetentionEnhancement]: {
      repCost: 2e4,
      moneyCost: 2.5e8,
      info:
        "使用化学注射永久性地改造并强化大脑的神经元回路，" +
        "增强记忆信息的能力。",
      hacking_exp: 1.25,
      factions: [FactionName.NiteSec],
    },
    [AugmentationName.Neuralstimulator]: {
      repCost: 5e4,
      moneyCost: 3e9,
      info:
        "一种颅部植入体，智能刺激大脑的特定区域，" +
        "以提升认知功能。",
      hacking_speed: 1.02,
      hacking_chance: 1.1,
      hacking_exp: 1.12,
      factions: [
        FactionName.TheBlackHand,
        FactionName.Chongqing,
        FactionName.Sector12,
        FactionName.NewTokyo,
        FactionName.Aevum,
        FactionName.Ishima,
        FactionName.Volhaven,
        FactionName.BachmanAndAssociates,
        FactionName.ClarkeIncorporated,
        FactionName.FourSigma,
      ],
    },
    [AugmentationName.Neuregen]: {
      repCost: 3.75e4,
      moneyCost: 3.75e8,
      info:
        "一种对大脑神经元进行基因改造的药物，" +
        "使神经元能够持续" +
        "再生并自我强化。",
      hacking_exp: 1.4,
      factions: [FactionName.Chongqing],
    },
    [AugmentationName.NeuroFluxGovernor]: {
      repCost: 500,
      moneyCost: 750e3,
      info:
        "注入使用者血液的隐形纳米机器人。神经通量统治者（NeuroFlux Governor）" +
        "监测并调节人体的方方面面，实际上是在“统治”身体。" +
        "借此，它提升使用者大多数行动的表现。",
      stats: `这个特殊强化可以无限升级。每一级都会以乘法叠加的方式，将大多数乘数提高 1%（+${(
        donationBonus * 100
      ).toFixed(6)}%）。`,
      isSpecial: true,
      hacking_chance: 1.01 + donationBonus,
      hacking_speed: 1.01 + donationBonus,
      hacking_money: 1.01 + donationBonus,
      hacking_grow: 1.01 + donationBonus,
      hacking: 1.01 + donationBonus,
      strength: 1.01 + donationBonus,
      defense: 1.01 + donationBonus,
      dexterity: 1.01 + donationBonus,
      agility: 1.01 + donationBonus,
      charisma: 1.01 + donationBonus,
      hacking_exp: 1.01 + donationBonus,
      strength_exp: 1.01 + donationBonus,
      defense_exp: 1.01 + donationBonus,
      dexterity_exp: 1.01 + donationBonus,
      agility_exp: 1.01 + donationBonus,
      charisma_exp: 1.01 + donationBonus,
      company_rep: 1.01 + donationBonus,
      faction_rep: 1.01 + donationBonus,
      crime_money: 1.01 + donationBonus,
      crime_success: 1.01 + donationBonus,
      dnet_money: 1.01 + donationBonus,
      hacknet_node_money: 1.01 + donationBonus,
      hacknet_node_purchase_cost: 1 / (1.01 + donationBonus),
      hacknet_node_ram_cost: 1 / (1.01 + donationBonus),
      hacknet_node_core_cost: 1 / (1.01 + donationBonus),
      hacknet_node_level_cost: 1 / (1.01 + donationBonus),
      work_money: 1.01 + donationBonus,
      factions: Object.values(FactionName).filter(
        (factionName) =>
          ![FactionName.ShadowsOfAnarchy, FactionName.Bladeburners, FactionName.ChurchOfTheMachineGod].includes(
            factionName,
          ),
      ),
    },
    [AugmentationName.Neurolink]: {
      repCost: 8.75e5,
      moneyCost: 4.375e9,
      info:
        "一种脑部植入体，在你的思维与" +
        `${FactionName.BitRunners} 的数据服务器之间提供高带宽的直接神经链接。据说那里保存着` +
        "世界上最大的黑客工具与情报数据库。",
      hacking: 1.15,
      hacking_exp: 1.2,
      hacking_chance: 1.1,
      hacking_speed: 1.05,
      programs: [CompletedProgramName.ftpCrack, CompletedProgramName.relaySmtp],
      factions: [FactionName.BitRunners],
    },
    [AugmentationName.NeuronalDensification]: {
      repCost: 1.875e5,
      moneyCost: 1.375e9,
      info:
        "通过缩小神经元间隙连接，以手术方式改造大脑，提高神经元密度。" +
        "随后，再对身体进行基因改造，增强其神经干细胞的生产与能力。",
      hacking: 1.15,
      hacking_exp: 1.1,
      hacking_speed: 1.03,
      factions: [FactionName.ClarkeIncorporated],
    },
    [AugmentationName.NeuroreceptorManager]: {
      repCost: 0.75e5,
      moneyCost: 5.5e8,
      info:
        "围绕突触精心组装的脑部植入体，它" +
        "精细管理各种神经受体化学物质的活动与水平，并调节电活动以优化专注力，" +
        "让使用者能够更有效地多任务处理。",
      stats:
        "该强化移除了在工作、为派系效力等行动中未专注时的惩罚。",
      factions: [FactionName.TianDiHui],
    },
    [AugmentationName.Neurotrainer1]: {
      repCost: 1e3,
      moneyCost: 4e6,
      info:
        "一种分散式颅部植入体，提升大脑的学习能力。它的安装方式是向人脑释放数百万个纳米机器人，每个纳米机器人都会附着到不同的神经通路上，增强大脑记忆" +
        "和提取信息的能力。",
      hacking_exp: 1.1,
      strength_exp: 1.1,
      defense_exp: 1.1,
      dexterity_exp: 1.1,
      agility_exp: 1.1,
      charisma_exp: 1.1,
      factions: [FactionName.CyberSec, FactionName.Aevum],
    },
    [AugmentationName.Neurotrainer2]: {
      repCost: 1e4,
      moneyCost: 4.5e7,
      info:
        "一种分散式颅部植入体，提升大脑的学习能力。这是" +
        "神经训练器 I（Neurotrainer I）强化的更强版本，但它不" +
        "要求先安装神经训练器 I 作为前置条件。",
      hacking_exp: 1.15,
      strength_exp: 1.15,
      defense_exp: 1.15,
      dexterity_exp: 1.15,
      agility_exp: 1.15,
      charisma_exp: 1.15,
      factions: [FactionName.BitRunners, FactionName.NiteSec],
    },
    [AugmentationName.Neurotrainer3]: {
      repCost: 2.5e4,
      moneyCost: 1.3e8,
      info:
        "一种分散式颅部植入体，提升大脑的学习能力。这是" +
        "神经训练器 I 和神经训练器 II 强化的更强版本，" +
        "但不要求先安装其中任何一个作为前置条件。",
      hacking_exp: 1.2,
      strength_exp: 1.2,
      defense_exp: 1.2,
      dexterity_exp: 1.2,
      agility_exp: 1.2,
      charisma_exp: 1.2,
      factions: [FactionName.NWO, FactionName.FourSigma],
    },
    [AugmentationName.NuoptimalInjectorImplant]: {
      repCost: 5e3,
      moneyCost: 2e7,
      info:
        "这种躯干植入体会自动向血液中注射益智补剂，" +
        "以改善记忆、提高专注力并提供其他" +
        "认知增强。",
      company_rep: 1.2,
      charisma: 1.03,
      factions: [
        FactionName.TianDiHui,
        FactionName.Volhaven,
        FactionName.NewTokyo,
        FactionName.Chongqing,
        FactionName.ClarkeIncorporated,
        FactionName.FourSigma,
        FactionName.BachmanAndAssociates,
      ],
    },
    [AugmentationName.NutriGen]: {
      repCost: 6.25e3,
      moneyCost: 2.5e6,
      info:
        "一种热动力人工营养发生器。它在体内" +
        "合成葡萄糖、氨基酸和维生素，并将它们重新分配到" +
        "全身。该设备由身体以热量形式自然浪费的能量驱动。",
      strength_exp: 1.2,
      defense_exp: 1.2,
      dexterity_exp: 1.2,
      agility_exp: 1.2,
      factions: [FactionName.NewTokyo],
    },
    [AugmentationName.nextSENS]: {
      repCost: 4.375e5,
      moneyCost: 1.925e9,
      info:
        "身体经过基因改造，维持在可忽略衰老的状态，" +
        "防止身体随年龄增长而退化。",
      hacking: 1.2,
      strength: 1.2,
      defense: 1.2,
      dexterity: 1.2,
      agility: 1.2,
      charisma: 1.2,
      factions: [FactionName.ClarkeIncorporated],
    },
    // === O === //
    [AugmentationName.OmniTekInfoLoad]: {
      repCost: 6.25e5,
      moneyCost: 2.875e9,
      info:
        "OmniTek 的数据与情报库被上传" +
        "到你的大脑中，增强你的编程与" +
        "入侵能力。",
      hacking: 1.2,
      hacking_exp: 1.25,
      factions: [FactionName.OmniTekIncorporated],
    },
    [AugmentationName.OrionShoulder]: {
      repCost: 6.25e3,
      moneyCost: 5.5e8,
      info:
        "右肩的仿生肩部强化。ORION-MKIV 肩部植入体利用控制论技术，" +
        "增强使用者右臂的力量与灵巧度。" +
        "其结晶石墨烯镀层还能提供防护。",
      defense: 1.05,
      strength: 1.05,
      dexterity: 1.05,
      bladeburner_success_chance: 1.04,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    // === P === //
    [AugmentationName.PCDNI]: {
      repCost: 3.75e5,
      moneyCost: 3.75e9,
      info:
        "在手臂中安装一个与大多数计算机兼容的直接神经接口插口。" +
        "通过这个插口连接计算机后，你可以利用大脑的电化学信号与它交互。",
      company_rep: 1.3,
      hacking: 1.08,
      factions: [
        FactionName.FourSigma,
        FactionName.OmniTekIncorporated,
        FactionName.ECorp,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.PCDNINeuralNetwork]: {
      repCost: 1.5e6,
      moneyCost: 7.5e9,
      info:
        "这是一项额外安装，用于升级 PC 直接神经接口强化的功能。" +
        "连接到计算机时，神经网络升级允许使用者借助自己大脑的" +
        "算力来辅助计算机完成计算任务。",
      prereqs: [AugmentationName.PCDNI],
      company_rep: 2,
      hacking: 1.1,
      hacking_speed: 1.05,
      factions: [FactionName.FulcrumSecretTechnologies],
    },
    [AugmentationName.PCDNIOptimizer]: {
      repCost: 5e5,
      moneyCost: 4.5e9,
      info:
        "这是 PC 直接神经接口强化的子模块升级。它" +
        "提升了接口的性能，并为使用者提供更多对所连计算机的控制选项。",
      prereqs: [AugmentationName.PCDNI],
      company_rep: 1.75,
      hacking: 1.1,
      factions: [FactionName.FulcrumSecretTechnologies, FactionName.ECorp, FactionName.BladeIndustries],
    },
    [AugmentationName.PCMatrix]: {
      repCost: 100e3,
      moneyCost: 2e9,
      info:
        "额叶皮层中安装了一个“概率计算矩阵”。该植入体" +
        "使用先进的数学算法来快速识别并计算几乎所有情境的统计结果。",
      charisma: 1.0777,
      charisma_exp: 1.0777,
      work_money: 1.777,
      faction_rep: 1.0777,
      company_rep: 1.0777,
      crime_success: 1.0777,
      crime_money: 1.0777,
      programs: [CompletedProgramName.deepScan1, CompletedProgramName.autoLink],
      factions: [FactionName.Aevum],
    },
    [AugmentationName.PhotosyntheticCells]: {
      repCost: 5.625e5,
      moneyCost: 2.75e9,
      info:
        "将叶绿体添加到表皮干细胞中，并通过皮肤移植应用到身体上。" +
        "结果便是具备光合作用的皮肤细胞，使用者能够利用太阳能自己生成能量" +
        "和营养。",
      strength: 1.4,
      defense: 1.4,
      agility: 1.4,
      charisma: 1.2,
      factions: [FactionName.KuaiGongInternational],
    },
    [AugmentationName.PowerRecirculator]: {
      repCost: 2.5e4,
      moneyCost: 1.8e8,
      info:
        "身体的神经上附着了聚吡咯纳米电路，" +
        "能够捕获以热量形式浪费的能量，" +
        "并将其转化回可用电力。",
      hacking: 1.05,
      strength: 1.05,
      defense: 1.05,
      dexterity: 1.05,
      agility: 1.05,
      charisma: 1.05,
      hacking_exp: 1.1,
      strength_exp: 1.1,
      defense_exp: 1.1,
      dexterity_exp: 1.1,
      agility_exp: 1.1,
      charisma_exp: 1.1,
      factions: [FactionName.Tetrads, FactionName.TheDarkArmy, FactionName.TheSyndicate, FactionName.NWO],
    },
    [AugmentationName.Primer]: {
      repCost: 1.875e5,
      moneyCost: 3.375e9,
      info:
        "一套完全基于纳米技术杆式逻辑构建的前沿知识库，用于训练使用者进行社会工程。" +
        "据信是被盗的技术，直到最近其存在才为人所知。",
      charisma: 1.05,
      charisma_exp: 1.2,
      factions: [FactionName.TheDarkArmy, FactionName.TheSyndicate],
    },
    // === Q === //
    [AugmentationName.QLink]: {
      repCost: 1.875e6,
      moneyCost: 2.5e13,
      info:
        `一种脑部植入体，将你无线连接到${FactionName.Illuminati}的` +
        "量子超级计算机，让你能够访问并使用它惊人的" +
        "算力。",
      hacking: 1.75,
      hacking_speed: 2,
      hacking_chance: 2.5,
      hacking_money: 4,
      factions: [FactionName.Illuminati],
    },
    // === R === //
    // === S === //
    [AugmentationName.SNA]: {
      repCost: 6.25e3,
      moneyCost: 3e7,
      info:
        "一种颅部植入体，会影响使用者的性格，使其在社交场合中更擅长谈判。",
      charisma_exp: 1.15,
      work_money: 1.1,
      company_rep: 1.15,
      faction_rep: 1.15,
      factions: [FactionName.TianDiHui],
    },
    [AugmentationName.SocialDynamo]: {
      repCost: 2.25e5,
      moneyCost: 1.2e9,
      info:
        "通过大幅提升佩戴者对社会动态的感知力，使其成为更好的领导者和导师。" +
        "这其实并不是标准的植入体，而是一系列由著名演说家 Denis 主持的培训课程和研讨会。",
      charisma: 1.1,
      company_rep: 1.3,
      factions: [FactionName.MegaCorp, FactionName.ECorp, FactionName.OmniTekIncorporated],
    },
    [AugmentationName.SPTN97]: {
      repCost: 1.25e6,
      moneyCost: 4.875e9,
      info:
        "SPTN-97 基因被注入基因组。SPTN-97 基因是一种" +
        "人工合成基因，由 DARPA 开发，旨在通过基因改造打造" +
        "超级士兵。该基因于 2056 年被列为非法。",
      strength: 1.75,
      defense: 1.75,
      dexterity: 1.75,
      agility: 1.75,
      hacking: 1.15,
      factions: [FactionName.TheCovenant],
    },
    [AugmentationName.ShadowsSimulacrum]: {
      repCost: 3.75e4,
      moneyCost: 4e8,
      info:
        "一个粗糙但可用的物质相位移模块，嵌入" +
        "脑干和小脑。该强化由犯罪组织开发，允许使用者在较大半径内投射并控制全息" +
        "拟像。这些拟像常被用于" +
        "间谍与监视工作。",
      company_rep: 1.15,
      faction_rep: 1.15,
      factions: [FactionName.TheSyndicate, FactionName.TheDarkArmy, FactionName.SpeakersForTheDead],
    },
    [AugmentationName.SmartJaw]: {
      repCost: 3.75e5,
      moneyCost: 2.75e9,
      info:
        "一种仿生下颚，包含先进的硬件和软件，" +
        "能够利用光学成像软件对他人进行心理分析和人格侧写。",
      charisma: 1.5,
      charisma_exp: 1.5,
      company_rep: 1.25,
      faction_rep: 1.25,
      factions: [FactionName.BachmanAndAssociates],
    },
    [AugmentationName.SmartSonar]: {
      repCost: 2.25e4,
      moneyCost: 7.5e7,
      info: "一种耳蜗植入体，帮助玩家利用声波传播探测并定位敌人。",
      dexterity: 1.1,
      dexterity_exp: 1.15,
      crime_money: 1.25,
      factions: [FactionName.SlumSnakes],
    },
    [AugmentationName.SpeechEnhancement]: {
      repCost: 2.5e3,
      moneyCost: 1.25e7,
      info:
        "一种先进的神经植入体，改善你的说话能力，使你" +
        "在对话中更有说服力和亲和力，并整体提升你的" +
        "社交互动水平。",
      company_rep: 1.1,
      charisma: 1.05,
      factions: [
        FactionName.TianDiHui,
        FactionName.SpeakersForTheDead,
        FactionName.FourSigma,
        FactionName.KuaiGongInternational,
        FactionName.ClarkeIncorporated,
        FactionName.BachmanAndAssociates,
      ],
    },
    [AugmentationName.SpeechProcessor]: {
      repCost: 7.5e3,
      moneyCost: 5e7,
      info:
        "一种带有嵌入式计算机的耳蜗植入体，可以分析传入的语音。" +
        "嵌入式计算机会处理语音的特征（如语调和抑扬顿挫），以捕捉细微线索并辅助社交互动。",
      charisma: 1.1,
      factions: [
        FactionName.TianDiHui,
        FactionName.Chongqing,
        FactionName.Sector12,
        FactionName.NewTokyo,
        FactionName.Aevum,
        FactionName.Ishima,
        FactionName.Volhaven,
        FactionName.Silhouette,
      ],
    },
    [AugmentationName.StaneksGift1]: {
      repCost: 0,
      moneyCost: 0,
      info:
        'Allison "Mother" Stanek 将她的礼物传授给你。一个' +
        "植入颈根部的实验性强化。" +
        "它允许你通过谨慎修改配置来超频你的整个系统。",
      isSpecial: true,
      hacking_chance: 0.9,
      hacking_speed: 0.9,
      hacking_money: 0.9,
      hacking_grow: 0.9,
      hacking: 0.9,
      strength: 0.9,
      defense: 0.9,
      dexterity: 0.9,
      agility: 0.9,
      charisma: 0.9,
      hacking_exp: 0.9,
      strength_exp: 0.9,
      defense_exp: 0.9,
      dexterity_exp: 0.9,
      agility_exp: 0.9,
      charisma_exp: 0.9,
      company_rep: 0.9,
      faction_rep: 0.9,
      crime_money: 0.9,
      crime_success: 0.9,
      hacknet_node_money: 0.9,
      hacknet_node_purchase_cost: 1.1,
      hacknet_node_ram_cost: 1.1,
      hacknet_node_core_cost: 1.1,
      hacknet_node_level_cost: 1.1,
      work_money: 0.9,
      stats: "它的不稳定性会使你的所有属性降低 10%。",
      factions: [FactionName.ChurchOfTheMachineGod],
    },
    [AugmentationName.StaneksGift2]: {
      repCost: 1e6,
      moneyCost: 0,
      info:
        "下一次进化近在眼前——人与机器的结合。一场比人类有机体的诞生更伟大的融合。" +
        "与礼物共度的时光让你逐渐适应了这种侵入式强化及其对" +
        "身体的损耗，使所有属性的惩罚降低 5%。",
      prereqs: [AugmentationName.StaneksGift1],
      isSpecial: true,
      hacking_chance: 0.95 / 0.9,
      hacking_speed: 0.95 / 0.9,
      hacking_money: 0.95 / 0.9,
      hacking_grow: 0.95 / 0.9,
      hacking: 0.95 / 0.9,
      strength: 0.95 / 0.9,
      defense: 0.95 / 0.9,
      dexterity: 0.95 / 0.9,
      agility: 0.95 / 0.9,
      charisma: 0.95 / 0.9,
      hacking_exp: 0.95 / 0.9,
      strength_exp: 0.95 / 0.9,
      defense_exp: 0.95 / 0.9,
      dexterity_exp: 0.95 / 0.9,
      agility_exp: 0.95 / 0.9,
      charisma_exp: 0.95 / 0.9,
      company_rep: 0.95 / 0.9,
      faction_rep: 0.95 / 0.9,
      crime_money: 0.95 / 0.9,
      crime_success: 0.95 / 0.9,
      hacknet_node_money: 0.95 / 0.9,
      hacknet_node_purchase_cost: 1.05 / 1.1,
      hacknet_node_ram_cost: 1.05 / 1.1,
      hacknet_node_core_cost: 1.05 / 1.1,
      hacknet_node_level_cost: 1.05 / 1.1,
      work_money: 0.95 / 0.9,
      stats: "礼物的惩罚降低至 5%。",
      factions: [FactionName.ChurchOfTheMachineGod],
    },
    [AugmentationName.StaneksGift3]: {
      repCost: 1e8,
      moneyCost: 0,
      info:
        "人与机器的融合并不可怕。这是我们的宿命。" +
        "你将变得超越我们各部分之和。合而为一。完全地、彻底地拥抱你的礼物，" +
        "摆脱它那可诅咒的代价。宁静将以不再承受属性惩罚的形式带来安详。 ",
      prereqs: [AugmentationName.StaneksGift2, AugmentationName.StaneksGift1],
      isSpecial: true,
      hacking_chance: 1 / 0.95,
      hacking_speed: 1 / 0.95,
      hacking_money: 1 / 0.95,
      hacking_grow: 1 / 0.95,
      hacking: 1 / 0.95,
      strength: 1 / 0.95,
      defense: 1 / 0.95,
      dexterity: 1 / 0.95,
      agility: 1 / 0.95,
      charisma: 1 / 0.95,
      hacking_exp: 1 / 0.95,
      strength_exp: 1 / 0.95,
      defense_exp: 1 / 0.95,
      dexterity_exp: 1 / 0.95,
      agility_exp: 1 / 0.95,
      charisma_exp: 1 / 0.95,
      company_rep: 1 / 0.95,
      faction_rep: 1 / 0.95,
      crime_money: 1 / 0.95,
      crime_success: 1 / 0.95,
      hacknet_node_money: 1 / 0.95,
      hacknet_node_purchase_cost: 1 / 1.05,
      hacknet_node_ram_cost: 1 / 1.05,
      hacknet_node_core_cost: 1 / 1.05,
      hacknet_node_level_cost: 1 / 1.05,
      work_money: 1 / 0.95,
      stats: "Stanek 的礼物已无任何惩罚。",
      factions: [FactionName.ChurchOfTheMachineGod],
    },
    [AugmentationName.SubdermalArmor]: {
      repCost: 8.75e5,
      moneyCost: 3.25e9,
      info:
        "NEMEAN 皮下织物是一种轻薄、轻量的石墨烯镀层，其中容纳着一种剪切增稠流体。" +
        "这种材料被植入皮肤下方，是有史以来最先进的防御增强形式。尽管又薄又轻，这种剪切增稠流体在" +
        "阻挡穿刺打击和减轻钝击创伤方面极其有效。石墨烯的特性使镀层能够" +
        "减轻任何火焰或电击创伤造成的伤害。",
      defense: 2.2,
      factions: [
        FactionName.TheSyndicate,
        FactionName.FulcrumSecretTechnologies,
        FactionName.Illuminati,
        FactionName.Daedalus,
        FactionName.TheCovenant,
      ],
    },
    [AugmentationName.SynapticEnhancement]: {
      repCost: 2e3,
      moneyCost: 7.5e6,
      info:
        "一种小型颅部植入体，持续使用微弱电信号刺激大脑并" +
        "诱发更强的突触活动。这能提升使用者的认知能力。",
      hacking_speed: 1.03,
      factions: [FactionName.CyberSec, FactionName.Aevum],
    },
    [AugmentationName.SynfibrilMuscle]: {
      repCost: 4.375e5,
      moneyCost: 1.125e9,
      info:
        "向人体肌肉的肌原纤维中注射特殊化学物质，它们会与肌原纤维内的蛋白质发生反应，改变其底层结构。最终得到的肌肉更强大、更有弹性。" +
        "科学家将这些人工强化的单元命名为“合成肌原纤维”（synfibrils）。",
      strength: 1.3,
      defense: 1.3,
      factions: [
        FactionName.KuaiGongInternational,
        FactionName.FulcrumSecretTechnologies,
        FactionName.SpeakersForTheDead,
        FactionName.NWO,
        FactionName.TheCovenant,
        FactionName.Daedalus,
        FactionName.Illuminati,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.SyntheticHeart]: {
      moneyCost: 2.875e9,
      repCost: 7.5e5,
      info:
        "这颗由塑钢和石墨烯打造的先进人造心脏，泵送血液" +
        "的效率比有机心脏更高。",
      agility: 1.5,
      strength: 1.5,
      charisma: 1.15,
      factions: [
        FactionName.KuaiGongInternational,
        FactionName.FulcrumSecretTechnologies,
        FactionName.SpeakersForTheDead,
        FactionName.NWO,
        FactionName.TheCovenant,
        FactionName.Daedalus,
        FactionName.Illuminati,
      ],
    },
    // === T === //
    [AugmentationName.TITN41Injection]: {
      repCost: 2.5e4,
      moneyCost: 1.9e8,
      info:
        "TITN 是一系列病毒，靶向并改写控制人格的基因中的人类 DNA 序列。" +
        "TITN-41 毒株会改造这些基因，使受试者变得更加外向、善于交际。",
      charisma: 1.15,
      charisma_exp: 1.15,
      factions: [FactionName.Silhouette],
    },
    [AugmentationName.Targeting1]: {
      moneyCost: 1.5e7,
      repCost: 5e3,
      info:
        "一种嵌入内耳结构和视神经中的颅部植入体。" +
        "它调节并增强平衡感和手眼协调能力。",
      dexterity: 1.1,
      factions: [
        FactionName.SlumSnakes,
        FactionName.TheDarkArmy,
        FactionName.TheSyndicate,
        FactionName.Sector12,
        FactionName.Ishima,
        FactionName.OmniTekIncorporated,
        FactionName.KuaiGongInternational,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.Targeting2]: {
      moneyCost: 4.25e7,
      repCost: 8.75e3,
      info:
        "“强化瞄准”植入体的升级版，能够通过数字化显示威胁的弱点与生命体征来增强现实。",
      prereqs: [AugmentationName.Targeting1],
      dexterity: 1.2,
      factions: [
        FactionName.TheDarkArmy,
        FactionName.TheSyndicate,
        FactionName.Sector12,
        FactionName.OmniTekIncorporated,
        FactionName.KuaiGongInternational,
        FactionName.BladeIndustries,
      ],
    },
    [AugmentationName.Targeting3]: {
      moneyCost: 1.15e8,
      repCost: 2.75e4,
      info: "“强化瞄准”植入体的最新版本增加了锁定和追踪威胁的能力。",
      prereqs: [AugmentationName.Targeting2, AugmentationName.Targeting1],
      dexterity: 1.3,
      factions: [
        FactionName.TheDarkArmy,
        FactionName.TheSyndicate,
        FactionName.OmniTekIncorporated,
        FactionName.KuaiGongInternational,
        FactionName.BladeIndustries,
        FactionName.TheCovenant,
      ],
    },
    [AugmentationName.TheBlackHand]: {
      repCost: 1e5,
      moneyCost: 5.5e8,
      info:
        "一只高度先进的仿生手。这只义肢不仅" +
        "增强使用者的力量与灵巧度，还嵌入了硬件和固件，让他们只需触碰设备与机器就能连接、访问并入侵" +
        "它们。",
      strength: 1.15,
      dexterity: 1.15,
      hacking: 1.1,
      hacking_speed: 1.02,
      hacking_money: 1.1,
      factions: [FactionName.TheBlackHand],
    },
    [AugmentationName.TheBrokenWings]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "一种实验性强化，让使用者获得惊人的洞察飞跃与想象翱翔。" +
        "它由一位只被称为“雕塑家”的神秘人物创造，在使用者的上背部和肩膀上呈现为一组银色" +
        "金属图案。" +
        "授予那些发现迷宫秘密的人。" +
        "\n\n安装这个强化将加深黑暗……",
      stats:
        "该强化使滞留链路上限增加一，魅力提高 5%，敏捷提高 10%，暗网收入提高 30%。",
      charisma: 1.05,
      agility: 1.1,
      dnet_money: 1.3,
      isSpecial: true,
      factions: [],
    },
    [AugmentationName.TheBoots]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "以神话中带翼的神行靴为原型，这个植入体不知为何能为使用者提供无穷无尽的社交精力。" +
        "它的创造者、神秘的雕塑家拒绝透露其工作原理，只是喃喃念叨着‘liveware API’。" +
        "授予那些发现迷宫秘密的人。" +
        "\n\n安装这个强化将加深黑暗……",
      stats:
        "该强化使魅力和灵巧各提高 6%，认证与 heartbleed 的速度提高 20%。",
      charisma: 1.06,
      dexterity: 1.06,
      isSpecial: true,
      prereqs: [AugmentationName.TheBrokenWings],
      factions: [],
    },
    [AugmentationName.TheHammer]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "这个独特的强化让使用者能够直击问题核心，扫清通往目标道路上的障碍。" +
        "它在使用者前臂上呈现为一个简单的徽记，其真正功能无人知晓。据说它是雕塑家的工具之一。" +
        "授予那些发现迷宫秘密的人。" +
        "\n\n安装这个强化将加深黑暗……",
      stats:
        "该强化使滞留链路上限增加一，魅力提高 7%，力量提高 10%，暗网收入提高 10%。",
      charisma: 1.07,
      strength: 1.1,
      dnet_money: 1.1,
      isSpecial: true,
      prereqs: [AugmentationName.TheBoots],
      factions: [],
    },
    [AugmentationName.TheStaff]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "这种骨骼强化极大增强了使用者的耐久性与健康。其灵感源自传说中的医药之杖——据说是 Daedalus 完成迷宫后获得的奖励，如今所有现代强化都是它的后裔。" +
        "授予那些发现迷宫秘密的人。" +
        "\n\n安装这个强化将加深黑暗……",
      stats:
        "该强化使滞留链路上限增加一，魅力经验、防御和暗网收入各提高 10%。",
      charisma_exp: 1.1,
      defense: 1.1,
      dnet_money: 1.1,
      isSpecial: true,
      prereqs: [AugmentationName.TheHammer],
      factions: [],
    },
    [AugmentationName.TheLaw]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "一种先进的神经植入体，将贝叶斯推断算法整合进大脑的决策过程。" +
        "该强化提升了使用者评估概率、预测结果和实时调整策略的能力，" +
        "使他们在谈判和社交互动中极具说服力和自信。" +
        "授予那些发现迷宫秘密的人。" +
        "\n\n安装这个强化将加深黑暗……",
      stats: "该强化使魅力提高 9%，公司声望提高 5%，暗网收入提高 15%。",
      charisma: 1.09,
      company_rep: 1.05,
      dnet_money: 1.15,
      isSpecial: true,
      prereqs: [AugmentationName.TheStaff],
      factions: [],
    },
    [AugmentationName.TheSword]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        "一种前沿神经植入体，利用所罗门诺夫归纳法以无与伦比的精度分析和预测模式。" +
        "该强化提升了使用者推导最优策略和提出有力论证的能力，" +
        "让每一次互动都成为精心计算的成功。这项技术有时被称为“所罗门诺夫的光剑”，因为它是" +
        "奥卡姆剃刀的更强大版本。" +
        "这是授予那些发现迷宫秘密之人的最后一件强化。",
      stats: "该强化使魅力、黑客、暗网收入和公司声望各提高 10%。",
      charisma: 1.1,
      hacking: 1.1,
      company_rep: 1.1,
      dnet_money: 1.1,
      isSpecial: true,
      prereqs: [AugmentationName.TheLaw],
      factions: [],
    },
    [AugmentationName.TheRedPill]: {
      repCost: 2.5e6,
      moneyCost: 0,
      info: "是时候离开洞穴了。",
      stats: "",
      isSpecial: true,
      factions: [FactionName.Daedalus],
    },
    [AugmentationName.TrickeryOfHermes]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info: "植入手腕韧带的五重动力-神经-血管阀，提升灵巧度。",
      stats: "该强化会显示下一个出现的字符，使作弊码小游戏更容易。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    // === U === //
    [AugmentationName.UnstableCircadianModulator]: getUnstableCircadianModulatorParams(),
    // === V === //
    [AugmentationName.VangelisVirus]: {
      repCost: 1.875e4,
      moneyCost: 2.75e9,
      info:
        "一种注射到人脑组织中的合成共生病毒。Vangelis 病毒" +
        "能增强宿主的感官与专注力，同时提升其直觉。",
      dexterity_exp: 1.1,
      charisma_exp: 1.1,
      bladeburner_analysis: 1.1,
      bladeburner_success_chance: 1.04,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    [AugmentationName.VangelisVirus3]: {
      repCost: 3.75e4,
      moneyCost: 1.1e10,
      info:
        "Vangelis 的改进版，一种注射到人脑组织中的" +
        "合成共生病毒。在原有病毒的好处之上，它还赋予加速愈合和增强的" +
        "反应能力。",
      prereqs: [AugmentationName.VangelisVirus],
      defense_exp: 1.1,
      dexterity_exp: 1.1,
      charisma_exp: 1.1,
      bladeburner_analysis: 1.15,
      bladeburner_success_chance: 1.05,
      isSpecial: true,
      factions: [FactionName.Bladeburners],
    },
    // === W === //
    [AugmentationName.WKSharmonizer]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info:
        `一份来自${FactionName.ShadowsOfAnarchy}下落不明的领袖的 WKS 谐波器拷贝，` +
        "注入 *Γ 基细胞，为身体提供全面增强。",
      stats:
        "该强化通过延长计时器与提高奖励、减少受到的伤害等，使潜入的许多方面更容易且收益更高。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    [AugmentationName.WiredReflexes]: {
      repCost: 1.25e3,
      moneyCost: 2.5e6,
      info:
        "向躯体神经系统的所有主要部位注射合成神经增强剂，" +
        "大幅加快神经信号的传导并提升反射速度。",
      agility: 1.05,
      dexterity: 1.05,
      factions: [
        FactionName.TianDiHui,
        FactionName.SlumSnakes,
        FactionName.Sector12,
        FactionName.Volhaven,
        FactionName.Aevum,
        FactionName.Ishima,
        FactionName.TheSyndicate,
        FactionName.TheDarkArmy,
        FactionName.SpeakersForTheDead,
      ],
    },
    [AugmentationName.WisdomOfAthena]: {
      repCost: 1e4,
      moneyCost: 1e6,
      info: "一个连接 SASHA 的脑部植入体，专注于模式识别和预测模板。",
      stats: "该强化会移除所有 '[' ']'，使括号小游戏更容易。",
      isSpecial: true,
      factions: [FactionName.ShadowsOfAnarchy],
    },
    [AugmentationName.Wit]: {
      repCost: 5e3,
      moneyCost: 1e7,
      info:
        "一种连接式脑部植入体，大幅缩短使用者的言语反应时间。" +
        "这使使用者在谈判中思考更快、回应更迅速，并且总能说到最后一句。",
      charisma: 1.03,
      charisma_exp: 1.05,
      company_rep: 1.05,
      factions: [FactionName.SlumSnakes, FactionName.BitRunners],
    },
    // === X === //
    [AugmentationName.Xanipher]: {
      repCost: 8.75e5,
      moneyCost: 4.25e9,
      info:
        "口服摄入体内的高级纳米机器人混合制剂。" +
        "这些纳米机器人会诱发生理变化，显著" +
        "改善身体各方面的机能。",
      hacking: 1.2,
      strength: 1.2,
      defense: 1.2,
      dexterity: 1.2,
      agility: 1.2,
      charisma: 1.2,
      hacking_exp: 1.15,
      strength_exp: 1.15,
      defense_exp: 1.15,
      dexterity_exp: 1.15,
      agility_exp: 1.15,
      charisma_exp: 1.15,
      factions: [FactionName.NWO],
    },
    // === Y === //
    // === Z === //
    [AugmentationName.ZOE]: {
      isSpecial: true,
      repCost: Infinity,
      moneyCost: 1e12,
      info:
        "Zoë 的分身全能大脑增强器（Omnicerebrum Enhancer）会为你的分身插入一个全能大脑（omnicerebrum）。" +
        "全能大脑是对人脑近乎完美的模拟，使分身能够利用更多种类的强化物。" +
        "不过你应该很清楚这一点，BitRunner，因为你自己就有一个！",
      stats: "允许分身从 Stanek 的礼物中获益，但如果安装了多个则效果较弱。",
      factions: [
        /*Technically in FactionNames.ChurchOfTheMachineGod but not really for display reasons */
      ],
    },
  };
  return createEnumKeyedRecord(AugmentationName, (name) => {
    const params = metadata[name] as AugmentationCtorParams;
    params.name = name;
    return new Augmentation(params);
  });
})();

export function initCircadianModulator() {
  const params = getUnstableCircadianModulatorParams() as AugmentationCtorParams;
  params.name = AugmentationName.UnstableCircadianModulator;
  Augmentations[AugmentationName.UnstableCircadianModulator] = new Augmentation(params);
}

// new Augmentation({
//   name: AugmentationNames.UnnamedAug2,
//   repCost: 500e3,
//   moneyCost: 5e9,
//   info: "Undecided description",
//   startingMoney: 100e6,
//   programs: [Programs.HTTPWormProgram.name, Programs.SQLInjectProgram.name],
//   factions: [FactionNames.OmniTekIncorporated],
// }),
