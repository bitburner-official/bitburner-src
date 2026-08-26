import { assertLoadingType } from "../../utils/TypeAssertion";
import { BlackOperation } from "../Actions/BlackOperation";
import { BladeburnerBlackOpName, CityName, FactionName, LocationName } from "@enums";

export function createBlackOperations(): Record<BladeburnerBlackOpName, BlackOperation> {
  return {
    [BladeburnerBlackOpName.OperationTyphoon]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationTyphoon,
      n: 0,
      baseDifficulty: 2000,
      reqdRank: 2.5e3,
      rankGain: 50,
      rankLoss: 10,
      hpLoss: 100,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        "奥巴迪亚·泽尼亚塔是一家名为RedWater的私人军事公司的领导人。情报界早就知道，泽尼亚塔以及该公司上下都是合成人。\n\n" +
        `${BladeburnerBlackOpName.OperationTyphoon}的目标是不惜一切代价找出并消灭泽尼亚塔和RedWater。任务完成后，相关行动必须向公众隐瞒。`,
    }),
    [BladeburnerBlackOpName.OperationZero]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationZero,
      n: 1,
      baseDifficulty: 2500,
      reqdRank: 5e3,
      rankGain: 60,
      rankLoss: 15,
      hpLoss: 50,
      weights: {
        hacking: 0.2,
        strength: 0.15,
        defense: 0.15,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isStealth: true,
      desc:
        "AeroCorp是全球最大的国防承包商之一。其领导人史蒂夫·瓦塔塔基被认为是合成人权益的支持者，必须将他扳倒。\n\n" +
        `${BladeburnerBlackOpName.OperationZero}的目标是秘密潜入${LocationName.AevumAeroCorp}，找出任何能将瓦塔塔基从${LocationName.AevumAeroCorp}的职位上拉下马的罪证或情报。` +
        `走投无路时也可以伪造罪证。但要注意，${LocationName.AevumAeroCorp}拥有世界上最先进的安全措施。`,
    }),
    [BladeburnerBlackOpName.OperationX]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationX,
      n: 2,
      baseDifficulty: 3000,
      reqdRank: 7.5e3,
      rankGain: 75,
      rankLoss: 15,
      hpLoss: 100,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        "我们最近发现了一个名为Samizdat的地下出版团体。尽管他们的出版物大多是无稽的阴谋论，但普通人就是容易轻信。许多" +
        "作品都在讨论合成人，对社会构成威胁，并且正在中国和其他东方国家迅速传播。\n\n" +
        "Samizdat一直隐藏得很好、保持匿名。但我们刚刚收到情报：" +
        `他们的行动基地位于${CityName.Ishima}的地下下水道系统中。你的任务是调查` +
        "下水道系统并消灭Samizdat。绝不能让他们再发表任何东西。",
    }),
    [BladeburnerBlackOpName.OperationTitan]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationTitan,
      n: 3,
      baseDifficulty: 4000,
      reqdRank: 10e3,
      rankGain: 100,
      rankLoss: 20,
      hpLoss: 100,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `几个月前，${LocationName.AevumNetLinkTechnologies}的生物工程部被合成人渗透。据我们所知，${LocationName.AevumNetLinkTechnologies}的管理层对此并不知情。我们不知道这些合成人在密谋什么，` +
        `但他们利用${LocationName.AevumNetLinkTechnologies}庞大资源所进行的研究可能非常危险。\n\n` +
        `你的目标是进入并摧毁生物工程部位于${CityName.Aevum}的设施。这项任务不仅是清除那里的合成人，还要销毁设施内任何与合成人及其目的相关的信息和研究。`,
    }),
    [BladeburnerBlackOpName.OperationAres]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationAres,
      n: 4,
      baseDifficulty: 5000,
      reqdRank: 12.5e3,
      rankGain: 125,
      rankLoss: 20,
      hpLoss: 200,
      weights: {
        hacking: 0,
        strength: 0.25,
        defense: 0.25,
        dexterity: 0.25,
        agility: 0.25,
        charisma: 0,
        intelligence: 0,
      },
      decays: {
        hacking: 0,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `我们的卧底特工卡特特工向我们通报：${CityName.Volhaven}正在进行一笔大规模军火交易，交易双方是失控的当地武装分子和一个激进的合成人社区。` +
        "这些武器是新一代等离子与能量武器。为了人类的安全，这笔交易绝不能达成。\n\n" +
        "你的任务是拦截这场交易。不留活口。",
    }),
    [BladeburnerBlackOpName.OperationArchangel]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationArchangel,
      n: 5,
      baseDifficulty: 7500,
      reqdRank: 15e3,
      rankGain: 200,
      rankLoss: 20,
      hpLoss: 25,
      weights: {
        hacking: 0,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.3,
        agility: 0.3,
        charisma: 0,
        intelligence: 0,
      },
      decays: {
        hacking: 0,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `我们的分析人员发现，${CityName.Chongqing}有名的Red Rabbit妓院由MK-VI合成人运营并充当"员工"。情报显示，这家妓院的利润被用于资助一个庞大的黑市军火` +
        "贩运网络。\n\n" +
        "本次行动的目标是除掉经营Red Rabbit妓院的头目。尽量减少其他伤亡，但为完成任务可采取一切必要手段。",
    }),
    [BladeburnerBlackOpName.OperationJuggernaut]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationJuggernaut,
      n: 6,
      baseDifficulty: 10e3,
      reqdRank: 20e3,
      rankGain: 300,
      rankLoss: 40,
      hpLoss: 300,
      weights: {
        hacking: 0,
        strength: 0.25,
        defense: 0.25,
        dexterity: 0.25,
        agility: 0.25,
        charisma: 0,
        intelligence: 0,
      },
      decays: {
        hacking: 0,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        "CIA刚刚遭遇了一个新的安全威胁。一个新犯罪团伙的头目是一名自称Juggernaut的神秘特工，该团伙一直在向" +
        `${CityName.Sector12}走私毒品和武器（包括疑似生化武器）。我们还有理由相信，他们曾试图闯入${LocationName.Sector12UniversalEnergy}的一处` +
        "设施以制造全城停电。CIA怀疑Juggernaut是一个经过重度强化的合成人，因此请求我们协助。\n\n" +
        "你的任务是铲除Juggernaut及其党羽。",
    }),
    [BladeburnerBlackOpName.OperationRedDragon]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationRedDragon,
      n: 7,
      baseDifficulty: 12.5e3,
      reqdRank: 25e3,
      rankGain: 500,
      rankLoss: 50,
      hpLoss: 500,
      weights: {
        hacking: 0.05,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.25,
        agility: 0.25,
        charisma: 0,
        intelligence: 0.05,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `${FactionName.Tetrads}犯罪组织涉嫌对MK-VI合成人的设计进行逆向工程。` +
        "我们相信他们改动并可能改进了设计，开始制造自己的合成人型号，以此支撑其犯罪活动。\n\n" +
        `你的任务是潜入并摧毁${FactionName.Tetrads}位于${CityName.NewTokyo}的行动基地。` +
        "情报显示，他们的基地里设有合成人制造装置之一。",
    }),
    [BladeburnerBlackOpName.OperationK]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationK,
      n: 8,
      baseDifficulty: 15e3,
      reqdRank: 30e3,
      rankGain: 750,
      rankLoss: 60,
      hpLoss: 1000,
      weights: {
        hacking: 0.05,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.25,
        agility: 0.25,
        charisma: 0,
        intelligence: 0.05,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `红色警报。据情报，${LocationName.NewTokyoVitaLife}发现了一种新的仿生人克隆技术。` +
        `据说该技术不仅能克隆合成人的躯体，还能克隆其先进的AI模块。我们不认为${LocationName.NewTokyoVitaLife}打算非法或恶意使用这项技术，但一旦有` +
        "合成人渗透进该公司并利用这项技术，后果将是灾难性的。\n\n" +
        "我们没有权力也没有司法管辖权通过法律或政治手段叫停此事，因此只能采取秘密行动。你的目标是摧毁这项技术，并消灭所有参与研发的人员。",
    }),
    [BladeburnerBlackOpName.OperationDeckard]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationDeckard,
      n: 9,
      baseDifficulty: 20e3,
      reqdRank: 40e3,
      rankGain: 1e3,
      rankLoss: 75,
      hpLoss: 200,
      weights: {
        hacking: 0,
        strength: 0.24,
        defense: 0.24,
        dexterity: 0.24,
        agility: 0.24,
        charisma: 0,
        intelligence: 0.04,
      },
      decays: {
        hacking: 0,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        "尽管你在" +
        `${BladeburnerBlackOpName.OperationK}中成功摧毁了VitaLife的新仿生人复制技术，但我们发现一小队MK-VI合成人在行动前带走了` +
        "该技术的图纸与设计。几乎可以肯定，这些合成人正是合成人起义中失控的MK-VI合成人。\n\n" +
        `${BladeburnerBlackOpName.OperationDeckard}的目标是找到这些合成人并将他们清除。无需多言，此次任务何等关键。`,
    }),
    [BladeburnerBlackOpName.OperationTyrell]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationTyrell,
      n: 10,
      baseDifficulty: 25e3,
      reqdRank: 50e3,
      rankGain: 1.5e3,
      rankLoss: 100,
      hpLoss: 500,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `一周前，${FactionName.BladeIndustries}报告其在${CityName.Aevum}的一处` +
        `强化存储设施遭到小规模入侵。我们查明${FactionName.TheDarkArmy}是这次盗窃的幕后黑手，但并未深究。然而我们刚刚发现，几名已知的MK-VI合成人参与了那次入侵。\n\n` +
        "绝不能让合成人用强化技术进一步提升它们本已强化的能力。你的任务是追查" +
        `${FactionName.TheDarkArmy}的相关成员并消灭他们。`,
    }),
    [BladeburnerBlackOpName.OperationWallace]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationWallace,
      n: 11,
      baseDifficulty: 30e3,
      reqdRank: 75e3,
      rankGain: 2e3,
      rankLoss: 150,
      hpLoss: 1500,
      weights: {
        hacking: 0,
        strength: 0.24,
        defense: 0.24,
        dexterity: 0.24,
        agility: 0.24,
        charisma: 0,
        intelligence: 0.04,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `根据从${BladeburnerBlackOpName.OperationTyrell}收集到的情报，我们发现` +
        `${FactionName.TheDarkArmy}早就知道自己的队伍中混有合成人。更糟的是，我们认为` +
        `${FactionName.TheDarkArmy}正在与` +
        `${FactionName.TheSyndicate}等其他犯罪组织合作，策划对多座大城市发动某种大规模接管，其中首当其冲的是` +
        `${CityName.Aevum}。我们怀疑合成人已经渗入这些犯罪派系的队伍，正企图再次策动合成人起义。\n\n` +
        "应对之道就是防患于未然。" +
        `${BladeburnerBlackOpName.OperationWallace}的目标是立即摧毁${CityName.Aevum}的${FactionName.TheDarkArmy}和${FactionName.TheSyndicate}派系。` +
        "不留活口。",
    }),
    [BladeburnerBlackOpName.OperationShoulderOfOrion]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationShoulderOfOrion,
      n: 12,
      baseDifficulty: 35e3,
      reqdRank: 100e3,
      rankGain: 2.5e3,
      rankLoss: 500,
      hpLoss: 1500,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isStealth: true,
      desc:
        `${CityName.Chongqing}的${LocationName.ChongqingSolarisSpaceSystems}正在利用合成人秘密发射十多年来的首艘载人飞船。我们相信${CityName.Chongqing}试图建立首批地外殖民地。\n\n` +
        "任务是阻止这次发射，同时避免引发国际冲突。接受此任务后，在你成功归来之前，NSA和国家政府将正式与你撇清关系。" +
        "一旦任务失败，行动队的所有成员都决不能被活捉。",
    }),
    [BladeburnerBlackOpName.OperationHyron]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationHyron,
      n: 13,
      baseDifficulty: 40e3,
      reqdRank: 125e3,
      rankGain: 3e3,
      rankLoss: 1e3,
      hpLoss: 500,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `据情报，${FactionName.FulcrumSecretTechnologies}正在开发一台以人脑为核心处理器的量子超级计算机。` +
        "传闻这台超算能存储海量数据，其运算能力举世无双。更重要的是，使用有机人脑意味着这台超算或许能够进行抽象推理并获得自我意识。\n\n" +
        "拥有自我意识的AI为何会对全人类构成严重威胁，无须我们赘述。\n\n" +
        `该项目的研究正在${FactionName.FulcrumSecretTechnologies}位于${CityName.Aevum}的一处秘密设施中进行，代号'Alpha Ranch'。潜入建筑群，删除并销毁全部研究成果，` +
        "然后找到并杀死项目负责人。",
    }),
    [BladeburnerBlackOpName.OperationMorpheus]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationMorpheus,
      n: 14,
      baseDifficulty: 45e3,
      reqdRank: 150e3,
      rankGain: 4e3,
      rankLoss: 1e3,
      hpLoss: 100,
      weights: {
        hacking: 0.05,
        strength: 0.15,
        defense: 0.15,
        dexterity: 0.3,
        agility: 0.3,
        charisma: 0,
        intelligence: 0.05,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isStealth: true,
      desc:
        "DreamSense Technologies是一家广告公司，它利用特殊技术把广告植入人们的梦境与潜意识中，靠广播发射塔实现。根据我们在" +
        `${CityName.Chongqing}的特工和线人提供的情报，我们有理由相信当地一座发射塔已被合成人控制，正被用来散布支持合成人的宣传。\n\n` +
        "任务是摧毁这座发射塔。此行速度与隐蔽缺一不可。",
    }),
    [BladeburnerBlackOpName.OperationIonStorm]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationIonStorm,
      n: 15,
      baseDifficulty: 50e3,
      reqdRank: 175e3,
      rankGain: 5e3,
      rankLoss: 1e3,
      hpLoss: 5000,
      weights: {
        hacking: 0,
        strength: 0.24,
        defense: 0.24,
        dexterity: 0.24,
        agility: 0.24,
        charisma: 0,
        intelligence: 0.04,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        "我们的分析人员发现一批MK-VI合成人聚集盘踞在" +
        `${CityName.Sector12}贫民窟。尚不确定他们是否是起义中失控的合成人，但可以确定的是，他们一直在囤积武器、资金和其他资源。这使得他们极具威胁。\n\n` +
        `这是一次全面突击行动，目标是找到并清除${CityName.Sector12}贫民窟中的所有合成人。`,
    }),
    [BladeburnerBlackOpName.OperationAnnihilus]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationAnnihilus,
      n: 16,
      baseDifficulty: 55e3,
      reqdRank: 200e3,
      rankGain: 7.5e3,
      rankLoss: 1e3,
      hpLoss: 10e3,
      weights: {
        hacking: 0,
        strength: 0.24,
        defense: 0.24,
        dexterity: 0.24,
        agility: 0.24,
        charisma: 0,
        intelligence: 0.04,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        "上级命令我们清剿" +
        `${CityName.Aevum}一处地下设施内的一切人员与物资。据称，该设施内藏匿着许多危险的合成人，属于一个名为'${FactionName.TheCovenant}'的恐怖组织。我们此前没有关于该组织的任何情报，` +
        "因此你只能在毫无准备的情况下深入虎穴。",
    }),
    [BladeburnerBlackOpName.OperationUltron]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationUltron,
      n: 17,
      baseDifficulty: 60e3,
      reqdRank: 250e3,
      rankGain: 10e3,
      rankLoss: 2e3,
      hpLoss: 10e3,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      isKill: true,
      desc:
        `${FactionName.OmniTekIncorporated}是合成人的原始设计与制造商，它通知我们其AI设计存在一处缺陷。该缺陷一旦触发，会导致MK-VI合成人走向激进并企图毁灭人类。他们表示这个漏洞影响所有MK-VI合成人，而不仅仅是起义中失控的那批。\n\n` +
        `${FactionName.OmniTekIncorporated}还告诉我们，他们相信有人在一大批MK-VI合成人身上触发了该缺陷，而这些新近激进化的合成人正在` +
        `${CityName.Volhaven}集结，组建一个名为Ultron的恐怖组织。\n\n` +
        "情报显示Ultron装备精良，成员均经过强化。我们认为Ultron正图谋夺取并武器化DeltaOne的战术高能卫星激光阵列（THESLA）。\n\n" +
        "你的任务是找到并摧毁Ultron。",
    }),
    [BladeburnerBlackOpName.OperationCenturion]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationCenturion,
      n: 18,
      baseDifficulty: 70e3,
      reqdRank: 300e3,
      rankGain: 15e3,
      rankLoss: 5e3,
      hpLoss: 10e3,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      desc:
        "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)\n\n" +
        "纵观人类历史，我们依靠技术生存、征服与进步。技术的发展成为我们的首要目标。而在人类文明的巅峰，技术化作了权力——全球性的、绝对的权力。\n\n" +
        "宇宙似乎并非不懂讽刺。\n\n" +
        "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)",
    }),
    [BladeburnerBlackOpName.OperationVindictus]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationVindictus,
      n: 19,
      baseDifficulty: 75e3,
      reqdRank: 350e3,
      rankGain: 20e3,
      rankLoss: 20e3,
      hpLoss: 20e3,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      desc:
        "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)\n\n" +
        "比特无处不在。维系着节点的守护进程（daemons）会以多种不同的方式显现自身。\n\n" +
        "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)",
    }),
    [BladeburnerBlackOpName.OperationDaedalus]: new BlackOperation({
      name: BladeburnerBlackOpName.OperationDaedalus,
      n: 20,
      baseDifficulty: 80e3,
      reqdRank: 400e3,
      rankGain: 40e3,
      rankLoss: 10e3,
      hpLoss: 100e3,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.75,
      },
      desc: "昨日我们臣服于君王，向皇帝屈膝。今日我们只向真理低头。",
    }),
  };
}

export const numberOfBlackOperations = Object.keys(BladeburnerBlackOpName).length;

export function loadBlackOperationsData(
  data: unknown,
  blackOperations: Record<BladeburnerBlackOpName, BlackOperation>,
) {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return;
  }
  assertLoadingType<Record<BladeburnerBlackOpName, unknown>>(data);
  for (const blackOpName of Object.values(BladeburnerBlackOpName)) {
    const loadedBlackOp = data[blackOpName];
    if (!(loadedBlackOp instanceof BlackOperation)) {
      continue;
    }
    blackOperations[blackOpName].loadData(loadedBlackOp);
  }
}
