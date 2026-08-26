import React from "react";
import { FactionName, CompanyName, CityName, LiteratureName, MessageFilename, LocationName } from "@enums";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { Option } from "./ui/Option";
import { Typography } from "@mui/material";
import {
  PlayerCondition,
  CompoundPlayerCondition,
  haveBackdooredServer,
  employedBy,
  haveCompanyRep,
  executiveEmployee,
  notEmployedBy,
  haveAugmentations,
  haveMoney,
  haveSkill,
  haveCombatSkills,
  haveKarma,
  haveKilledPeople,
  locatedInCity,
  locatedInSomeCity,
  totalHacknetRam,
  totalHacknetCores,
  totalHacknetLevels,
  haveBladeburnerRank,
  haveSourceFile,
  haveSomeSourceFile,
  haveFile,
  someCondition,
  everyCondition,
  delayedCondition,
  unsatisfiable,
  notCondition,
  inBitNode,
} from "./FactionJoinCondition";
import { SpecialServers } from "../Server/data/SpecialServers";
import { CONSTANTS } from "../Constants";
import { BladeburnerConstants } from "../Bladeburner/data/Constants";
import type { PlayerObject } from "../PersonObjects/Player/PlayerObject";
import { CovenantCampaign } from "./ui/CovenantCampaign";
import { GangCampaign } from "./ui/GangCampaign";
import { GangConstants } from "../Gang/data/Constants";

interface FactionInfoParams {
  infoText?: JSX.Element;
  rumorText?: JSX.Element;
  inviteReqs?: PlayerCondition[];
  rumorReqs?: PlayerCondition[];
  enemies?: FactionName[];
  offerHackingWork?: boolean;
  offerFieldWork?: boolean;
  offerSecurityWork?: boolean;
  special?: boolean;
  keepOnInstall?: boolean;
  campaign?: () => React.ReactElement;
}

/** Contains the "information" property for all the Factions, which is just a description of each faction */
export class FactionInfo {
  /** The names of all other factions considered to be enemies to this faction. */
  enemies: FactionName[];

  /** The descriptive text to show on the faction's page. */
  infoText: JSX.Element;

  /** The hint to show about how to get invited to this faction. */
  rumorText: JSX.Element;

  /** Conditions for being automatically invited to this faction. */
  inviteReqs: CompoundPlayerCondition;

  /** Conditions for automatically hearing a rumor about this faction. */
  rumorReqs: CompoundPlayerCondition;

  /** A flag indicating if the faction supports field work to earn reputation. */
  offerFieldWork: boolean;

  /** A flag indicating if the faction supports hacking work to earn reputation. */
  offerHackingWork: boolean;

  /** A flag indicating if the faction supports security work to earn reputation. */
  offerSecurityWork: boolean;

  /** Keep faction on install. */
  keep: boolean;

  /** Special faction */
  special: boolean;

  /** The data to display on the faction screen. */
  campaign?: () => React.ReactElement;

  constructor(params: FactionInfoParams) {
    this.infoText = params.infoText ?? <></>;
    this.rumorText = params.rumorText ?? <></>;
    this.inviteReqs = everyCondition(params.inviteReqs ?? [unsatisfiable]);
    this.rumorReqs = everyCondition(params.rumorReqs ?? [unsatisfiable]);
    this.enemies = params.enemies ?? [];
    this.offerHackingWork = params.offerHackingWork ?? false;
    this.offerFieldWork = params.offerFieldWork ?? false;
    this.offerSecurityWork = params.offerSecurityWork ?? false;

    this.keep = params.keepOnInstall ?? false;
    this.special = params.special ?? false;
    this.campaign = params.campaign;
  }

  offersWork(): boolean {
    return this.offerFieldWork || this.offerHackingWork || this.offerSecurityWork;
  }
}

/** A map of all factions and associated info to them. */
export const FactionInfos: Record<FactionName, FactionInfo> = {
  // Endgame
  [FactionName.Illuminati]: new FactionInfo({
    infoText: (
      <>
        人类从未改变。无论社会变得多么文明，它最终都会重新陷入混乱。而在混乱之中，我们正是引导他们走向秩序的看不见之手。{" "}
      </>
    ),
    rumorText: (
      <>
        “...那个用无形之手从暗处掌控整个世界的古老秘密社团。凭借他们个人的财富与技能，他们已经渗透进每一个主要政府、金融机构和企业...”
      </>
    ),
    inviteReqs: [haveAugmentations(30), haveMoney(150e9), haveSkill("hacking", 1500), haveCombatSkills(1200)],
    rumorReqs: [haveFile(LiteratureName.TheHiddenWorld)],
    offerHackingWork: true,
    offerFieldWork: true,
  }),

  [FactionName.Daedalus]: new FactionInfo({
    infoText: <>昨日我们臣服于君王，向皇帝俯首。今日我们只向真理屈膝。</>,
    rumorText: <>跟随线索。搭乘 fl1ght。</>,
    inviteReqs: [
      delayedCondition(() => haveAugmentations(currentNodeMults.DaedalusAugsRequirement)),
      haveMoney(100e9),
      someCondition([haveSkill("hacking", 2500), haveCombatSkills(1500)]),
    ],
    rumorReqs: [haveFile(MessageFilename.TruthGazer)],
    offerHackingWork: true,
    offerFieldWork: true,
  }),

  [FactionName.TheCovenant]: new FactionInfo({
    infoText: (
      <>
        交出你自己。放弃空洞的自我，成为伟大而不朽之物的一部分。成为一个奴隶。献上你的思想、肉体与灵魂。唯有如此，你才能获得自由。
        <br />
        <br />
        唯有如此，你才能发现永生。
      </>
    ),
    rumorText: <>{FactionName.TheCovenant} 为那些已触及个人极限并希望更进一步的人提供专属服务。</>,
    inviteReqs: [haveAugmentations(20), haveMoney(75e9), haveSkill("hacking", 850), haveCombatSkills(850)],
    rumorReqs: [
      someCondition([
        inBitNode(10),
        everyCondition([haveAugmentations(10), haveMoney(35e9), haveSkill("hacking", 425), haveCombatSkills(425)]),
      ]),
    ],
    offerHackingWork: true,
    offerFieldWork: true,
    campaign: () => {
      return <CovenantCampaign />;
    },
  }),

  // Megacorporations, each forms its own faction
  [FactionName.ECorp]: new FactionInfo({
    infoText: (
      <>
        {FactionName.ECorp} 的使命很简单：用明日的科技连接今天的世界。凭借我们种类繁多的互联网相关软件和商用硬件，
        {FactionName.ECorp} 让全世界的信息触手可及。
      </>
    ),
    rumorText: <>{CompanyName.ECorp} 的高层员工可以获得专属的黑客类强化。</>,
    inviteReqs: [employedBy(CompanyName.ECorp), haveCompanyRep(CompanyName.ECorp, CONSTANTS.CorpFactionRepRequirement)],
    rumorReqs: [employedBy(CompanyName.ECorp)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.MegaCorp]: new FactionInfo({
    infoText: (
      <>
        {FactionName.MegaCorp}{" "}
        做着他人不敢做的事。我们想象。我们创造。我们发明。我们造出他人连做梦都想不到的东西。我们以前所未有的规模、以其他公司无法企及的方式，满足世界对食物、水、能源和交通的需求。
        <br />
        <br />
        无论是在实验室和工厂，还是在与客户打交道的最前线，{FactionName.MegaCorp}
        都在为世界开启一个新时代。
      </>
    ),
    rumorText: <>{CompanyName.MegaCorp} 的高层员工可以获得专属的生物科技类强化。</>,
    inviteReqs: [
      employedBy(CompanyName.MegaCorp),
      haveCompanyRep(CompanyName.MegaCorp, CONSTANTS.CorpFactionRepRequirement),
    ],
    rumorReqs: [employedBy(CompanyName.MegaCorp)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.BachmanAndAssociates]: new FactionInfo({
    infoText: (
      <>
        法律与商业交汇之处——正是我们所在之地。
        <br />
        <br />
        法律洞察——商业直觉——创新经验。
      </>
    ),
    rumorText: <>{CompanyName.BachmanAndAssociates} 的高层员工可以获得专属的谈判类强化。</>,
    inviteReqs: [
      employedBy(CompanyName.BachmanAndAssociates),
      haveCompanyRep(CompanyName.BachmanAndAssociates, CONSTANTS.CorpFactionRepRequirement),
    ],
    rumorReqs: [employedBy(CompanyName.BachmanAndAssociates)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.BladeIndustries]: new FactionInfo({
    infoText: <>强化即救赎。</>,
    rumorText: <>{CompanyName.BladeIndustries} 的高层员工可以获得专属的仿生类强化。</>,
    inviteReqs: [
      employedBy(CompanyName.BladeIndustries),
      haveCompanyRep(CompanyName.BladeIndustries, CONSTANTS.CorpFactionRepRequirement),
    ],
    rumorReqs: [employedBy(CompanyName.BladeIndustries)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.NWO]: new FactionInfo({
    infoText: (
      <>
        人类并非真正渴望自由。他们渴望被观察、被理解、被评判。他们渴望人生被赋予目标和方向。正因如此，他们创造了神。也正因如此，他们创造了文明——不是出于自愿，而是出于想要融入更高层次结构与意义的需要。
      </>
    ),
    rumorText: <>{CompanyName.NWO} 的高层员工可以获得专属的纳米科技类强化。</>,
    inviteReqs: [employedBy(CompanyName.NWO), haveCompanyRep(CompanyName.NWO, CONSTANTS.CorpFactionRepRequirement)],
    rumorReqs: [employedBy(CompanyName.NWO)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.ClarkeIncorporated]: new FactionInfo({
    infoText: <>基因组之力——已然解锁。</>,
    rumorText: <>{CompanyName.ClarkeIncorporated} 的高层员工可以获得专属的神经科技类强化。</>,
    inviteReqs: [
      employedBy(CompanyName.ClarkeIncorporated),
      haveCompanyRep(CompanyName.ClarkeIncorporated, CONSTANTS.CorpFactionRepRequirement),
    ],
    rumorReqs: [employedBy(CompanyName.ClarkeIncorporated)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.OmniTekIncorporated]: new FactionInfo({
    infoText: <>简而言之，我们的使命就是设计和制造能带来改变的机器人。</>,
    rumorText: <>{CompanyName.OmniTekIncorporated} 的高层员工可以获得专属的数据处理类强化。</>,
    inviteReqs: [
      employedBy(CompanyName.OmniTekIncorporated),
      haveCompanyRep(CompanyName.OmniTekIncorporated, CONSTANTS.CorpFactionRepRequirement),
    ],
    rumorReqs: [employedBy(CompanyName.OmniTekIncorporated)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.FourSigma]: new FactionInfo({
    infoText: (
      <>
        科学方法是投资的最佳途径。以大数据支撑宏大战略，由深度学习和创新理念驱动，并在迭代中不断完善。这就是
        {FactionName.FourSigma}。
      </>
    ),
    rumorText: <>{CompanyName.FourSigma} 的高层员工可以获得一系列用途广泛的强化。</>,
    inviteReqs: [
      employedBy(CompanyName.FourSigma),
      haveCompanyRep(CompanyName.FourSigma, CONSTANTS.CorpFactionRepRequirement),
    ],
    rumorReqs: [employedBy(CompanyName.FourSigma)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  [FactionName.KuaiGongInternational]: new FactionInfo({
    infoText: <>志存高远。勤奋工作。创造历史。</>,
    rumorText: <>{CompanyName.KuaiGongInternational} 的高层员工可以获得专属的皮肤科技类强化。</>,
    inviteReqs: [
      employedBy(CompanyName.KuaiGongInternational),
      haveCompanyRep(CompanyName.KuaiGongInternational, CONSTANTS.CorpFactionRepRequirement),
    ],
    rumorReqs: [employedBy(CompanyName.KuaiGongInternational)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  // Other Corporations
  [FactionName.FulcrumSecretTechnologies]: new FactionInfo({
    infoText: <>人类机体天生就有崇拜的欲望。正因如此，他们创造了神。如果没有神，那就必须创造神。而现在，我们做到了。</>,
    rumorText: <>{CompanyName.FulcrumTechnologies} 的高层员工可能会发现一个公司系统，其中含有专属的神经网络类强化。</>,
    inviteReqs: [
      employedBy(CompanyName.FulcrumTechnologies),
      haveCompanyRep(CompanyName.FulcrumTechnologies, CONSTANTS.CorpFactionRepRequirement),
      haveBackdooredServer(SpecialServers.FulcrumSecretTechnologies),
    ],
    rumorReqs: [employedBy(CompanyName.FulcrumTechnologies)],
    offerHackingWork: true,
    offerSecurityWork: true,
    keepOnInstall: true,
  }),

  // Hacker groups
  [FactionName.BitRunners]: new FactionInfo({
    infoText: (
      <>
        我们的一生都被比特操控。我们的一切行为、思想和个人信息，全都被转化成比特、存储于比特、通过比特传递。任何人若离开比特，就无法行动、无法生存、无法以任何层级运作。而当一个人行动、生活和运作时，他会留下自己的比特——那些看似毫无意义的信息碎片留下的痕迹。但这些比特可以被重构，被转化，被利用。
        <br />
        <br />
        驾驭比特者，驾驭世界。
      </>
    ),
    rumorText: <>逃往深山。</>,
    inviteReqs: [haveBackdooredServer(SpecialServers.BitRunnersServer)],
    rumorReqs: [haveFile(MessageFilename.BitRunnersTest)],
    offerHackingWork: true,
  }),

  [FactionName.TheBlackHand]: new FactionInfo({
    infoText: (
      <>
        这个世界如此惧怕强势政府，如今却根本没有政府。只剩下权力——数字权力。金融权力。科技权力。而身处顶层之人以无形之手统治。他们建立了一个富人愈富、其余所有人受苦的社会。
        <br />
        <br />
        如此多的痛苦。如此多的生命。他们的黑暗必须终结。
      </>
    ),
    rumorText: <>I.I.I.I</>,
    inviteReqs: [haveBackdooredServer(SpecialServers.TheBlackHandServer)],
    rumorReqs: [haveFile(MessageFilename.Jumper3)],
    offerHackingWork: true,
    offerFieldWork: true,
  }),

  // prettier-ignore
  [FactionName.NiteSec]: new FactionInfo({
    infoText:(<>
    {"                  __..__               "}<br />
    {"                _.nITESECNIt.            "}<br />
    {"             .-'NITESECNITESEc.          "}<br />
    {"           .'    NITESECNITESECn         "}<br />
    {"          /       NITESECNITESEC;        "}<br />
    {"         :        :NITESECNITESEC;       "}<br />
    {"         ;       $ NITESECNITESECN       "}<br />
    {"        :    _,   ,N'ITESECNITESEC       "}<br />
    {"        : .+^^`,  :    `NITESECNIT       "}<br />
    {"         ) /),     `-,-=,NITESECNI       "}<br />
    {"        /  ^         ,-;|NITESECN;       "}<br />
    {"       /     _.'     '-';NITESECN        "}<br />
    {"      (  ,           ,-''`^NITE'         "}<br />
    {"       )`            :`.    .'           "}<br />
    {"       )--           ;  `- /             "}<br />
    {"       '        _.-'     :              "}<br />
    {"       (     _.-'   .                  "}<br />
    {"        ------.                       "}<br />
    {"                .                     "}<br />
    {"                         _.nIt          "}<br />
    {"                    _.nITESECNi         "}<br />
    {"                   nITESECNIT^'         "}<br />
    {"                   NITE^' ___           "}<br />
    {"                  /    .gP''''Tp.       "}<br />
    {"                 :    d'     .  `b      "}<br />
    {"                 ;   d'       o  `b ;    "}<br />
    {"                /   d;            `b|    "}<br />
    {"               /,   $;          @  `:    "}<br />
    {"              /'    $/               ;   "}<br />
    {"            .'      $/b          o   |   "}<br />
    {"          .'       d$/$;             :   "}<br />
    {"         /       .d/$/$;          ,   ;  "}<br />
    {"        d      .dNITESEC          $   |  "}<br />
    {"       :bp.__.gNITESEC/$         :$   ;  "}<br />
    {"       NITESECNITESECNIT         /$b :   "}<br /></>),
    rumorText: (
      <>
        名为 {FactionName.NiteSec}
        的黑客组织可能会招募你——只要你用黑客技术给他们留下深刻印象。
      </>
    ),
    inviteReqs: [
      haveBackdooredServer(SpecialServers.NiteSecServer)
    ],
    rumorReqs: [haveFile(MessageFilename.NiteSecTest)],
    offerHackingWork: true,
    offerFieldWork: false,
    offerSecurityWork: false,
    special: false,
    keepOnInstall: false,
  }),

  [FactionName.CyberSec]: new FactionInfo({
    infoText: (
      <>
        互联网是我们建造的第一件我们并未完全理解的事物，是我们经历过的最大的一场无政府状态实验。随着世界日益被它主导，社会正走向全面混乱的边缘。我们只为守护而存在——守护社会，守护人类，守护这个世界免于迫近的崩塌。
      </>
    ),
    rumorText: (
      <>
        名为 {FactionName.CyberSec}
        的黑客组织会在你于他们的服务器上展示黑客技术后邀请你加入。
      </>
    ),
    inviteReqs: [haveBackdooredServer(SpecialServers.CyberSecServer)],
    rumorReqs: [haveFile(MessageFilename.CyberSecTest)],
    offerHackingWork: true,
  }),

  // City factions, essentially governments
  [FactionName.Aevum]: new FactionInfo({
    infoText: <>硅之城。</>,
    rumorText: <>{CityName.Aevum} 的富裕居民可能会受邀为硅之城工作。</>,
    enemies: [FactionName.Chongqing, FactionName.NewTokyo, FactionName.Ishima, FactionName.Volhaven],
    inviteReqs: [locatedInCity(CityName.Aevum), haveMoney(40e6)],
    rumorReqs: [locatedInCity(CityName.Aevum), haveMoney(20e6)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),
  [FactionName.Chongqing]: new FactionInfo({
    infoText: <>为人民服务。</>,
    rumorText: <>{CityName.Chongqing} 的富裕居民可能会受邀为人民服务。</>,
    enemies: [FactionName.Sector12, FactionName.Aevum, FactionName.Volhaven],
    inviteReqs: [locatedInCity(CityName.Chongqing), haveMoney(20e6)],
    rumorReqs: [locatedInCity(CityName.Chongqing), haveMoney(10e6)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),
  [FactionName.Ishima]: new FactionInfo({
    infoText: <>未来东亚秩序。</>,
    rumorText: <>{CityName.Ishima} 的富裕居民可能会受邀为未来东亚秩序效力。</>,
    enemies: [FactionName.Sector12, FactionName.Aevum, FactionName.Volhaven],
    inviteReqs: [locatedInCity(CityName.Ishima), haveMoney(30e6)],
    rumorReqs: [locatedInCity(CityName.Ishima), haveMoney(15e6)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),
  [FactionName.NewTokyo]: new FactionInfo({
    infoText: <>亚洲国际都会。</>,
    rumorText: <>{CityName.NewTokyo} 的富裕居民可能会受邀为这座亚洲国际都会效力。</>,
    enemies: [FactionName.Sector12, FactionName.Aevum, FactionName.Volhaven],
    inviteReqs: [locatedInCity(CityName.NewTokyo), haveMoney(20e6)],
    rumorReqs: [locatedInCity(CityName.NewTokyo), haveMoney(10e6)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),
  [FactionName.Sector12]: new FactionInfo({
    infoText: <>未来之城。</>,
    rumorText: <>{CityName.Sector12} 的富裕居民可能会受邀为未来之城工作。</>,
    enemies: [FactionName.Chongqing, FactionName.NewTokyo, FactionName.Ishima, FactionName.Volhaven],
    inviteReqs: [locatedInCity(CityName.Sector12), haveMoney(15e6)],
    rumorReqs: [locatedInCity(CityName.Sector12), haveMoney(7.5e6)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),
  [FactionName.Volhaven]: new FactionInfo({
    infoText: <>利益、荣誉与荣光。</>,
    rumorText: <>{CityName.Volhaven} 的富裕居民可能会受邀为这座城市的利益、荣誉与荣光而努力。</>,
    enemies: [FactionName.Chongqing, FactionName.Sector12, FactionName.NewTokyo, FactionName.Aevum, FactionName.Ishima],
    inviteReqs: [locatedInCity(CityName.Volhaven), haveMoney(50e6)],
    rumorReqs: [locatedInCity(CityName.Volhaven), haveMoney(25e6)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),

  // Criminal Organizations/Gangs
  [FactionName.SpeakersForTheDead]: new FactionInfo({
    infoText: <>宁在地狱称王，不在天堂为仆。</>,
    rumorText: <>“我们知道。”</>,
    inviteReqs: [
      notEmployedBy(CompanyName.CIA),
      notEmployedBy(CompanyName.NSA),
      haveSkill("hacking", 100),
      haveCombatSkills(300),
      haveKilledPeople(30),
      haveKarma(-45),
    ],
    rumorReqs: [haveKarma(-45), haveSkill("hacking", 50), haveCombatSkills(150), haveKilledPeople(5)],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),

  [FactionName.TheDarkArmy]: new FactionInfo({
    infoText: <>这个世界不在乎对与错，只在乎权力。</>,
    rumorText: <>一个盘踞在 {CityName.Chongqing} 的冷酷犯罪组织。</>,
    inviteReqs: [
      locatedInCity(CityName.Chongqing),
      notEmployedBy(CompanyName.CIA),
      notEmployedBy(CompanyName.NSA),
      haveSkill("hacking", 300),
      haveCombatSkills(300),
      haveKilledPeople(5),
      haveKarma(-45),
    ],
    rumorReqs: [
      locatedInCity(CityName.Chongqing),
      haveSkill("hacking", 150),
      haveCombatSkills(150),
      haveKilledPeople(1),
      haveKarma(-45),
    ],
    offerHackingWork: true,
    offerFieldWork: true,
  }),

  [FactionName.TheSyndicate]: new FactionInfo({
    infoText: <>荣誉只会拖住你的脚步。</>,
    rumorText: <>一个活跃于西半球的精英犯罪组织。</>,
    inviteReqs: [
      locatedInSomeCity(CityName.Aevum, CityName.Sector12),
      notEmployedBy(CompanyName.CIA),
      notEmployedBy(CompanyName.NSA),
      haveMoney(10e6),
      haveSkill("hacking", 200),
      haveCombatSkills(200),
      haveKarma(-90),
    ],
    rumorReqs: [
      locatedInSomeCity(CityName.Aevum, CityName.Sector12),
      haveCombatSkills(100),
      someCondition([haveKarma(-90), haveFile(LiteratureName.Sector12Crime)]),
    ],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  }),

  [FactionName.Silhouette]: new FactionInfo({
    infoText: (
      <>
        西方政府崩塌后留下的权力真空，已被企业填满。问题在于它们变得太过庞大，以至于你不知道它们在为谁效力。而如果你受雇于其中一家企业，你甚至不知道自己在为谁卖命。
        <br />
        <br />
        那就是恐怖。恐怖、恐惧与腐败。全都生于体制，也全都由体制传播。
      </>
    ),
    rumorText: <>拥有足够“道德灵活性”的企业高管可能会受邀去查清自己究竟在为谁工作。</>,
    inviteReqs: [executiveEmployee(), haveMoney(15e6), haveKarma(-22)],
    rumorReqs: [executiveEmployee()],
    offerHackingWork: true,
    offerFieldWork: true,
  }),

  [FactionName.Tetrads]: new FactionInfo({
    infoText: <>奉天承运，替天行道。</>,
    rumorText: <>一个臭名昭著的东亚犯罪组织</>,
    inviteReqs: [
      locatedInSomeCity(CityName.Chongqing, CityName.NewTokyo, CityName.Ishima),
      haveCombatSkills(75),
      haveKarma(-18),
    ],
    rumorReqs: [
      locatedInSomeCity(CityName.Chongqing, CityName.NewTokyo, CityName.Ishima),
      haveCombatSkills(50),
      someCondition([haveKarma(-18), haveFile(LiteratureName.NewTriads)]),
    ],
    offerFieldWork: true,
    offerSecurityWork: true,
  }),

  [FactionName.SlumSnakes]: new FactionInfo({
    infoText: <>{FactionName.SlumSnakes} 称霸！</>,
    rumorText: <>贫民窟里的涂鸦：“{FactionName.SlumSnakes} 称霸！”</>,
    inviteReqs: [haveCombatSkills(30), haveMoney(1e6), haveKarma(-9)],
    rumorReqs: [haveCombatSkills(10), someCondition([haveKarma(-1), haveFile(LiteratureName.Sector12Crime)])],
    offerFieldWork: true,
    offerSecurityWork: true,
  }),

  // Early game factions - factions the player will prestige with early on that don't belong in other categories.
  [FactionName.Netburners]: new FactionInfo({
    infoText: <>{"~~//*>H4CK|\\|3T 8URN3R5**>?>\\\\~~"}</>,
    rumorText: <>{"~~//*>H4CK|\\|3T 8URN3R5**>?>\\\\~~"}</>,
    inviteReqs: [haveSkill("hacking", 80), totalHacknetRam(8), totalHacknetCores(4), totalHacknetLevels(100)],
    rumorReqs: [totalHacknetLevels(50)],
    offerHackingWork: true,
  }),

  [FactionName.TianDiHui]: new FactionInfo({
    infoText: <>顺天行道，恪守正义。</>,
    rumorText: <>一个中国秘密会社，其格言是：“顺天行道，恪守正义。”</>,
    inviteReqs: [
      locatedInSomeCity(CityName.Chongqing, CityName.NewTokyo, CityName.Ishima),
      haveSkill("hacking", 50),
      haveMoney(1e6),
    ],
    rumorReqs: [
      locatedInSomeCity(CityName.Chongqing, CityName.NewTokyo, CityName.Ishima),
      haveSkill("hacking", 25),
      haveMoney(0.5e6),
    ],
    offerHackingWork: true,
    offerSecurityWork: true,
  }),

  // Special Factions
  [FactionName.Bladeburners]: new FactionInfo({
    infoText: (
      <>
        可惜他们活不长了。不过话说回来，谁又能呢？
        <br />
        <br />
        只有完成合约和行动，才能在 {FactionName.Bladeburners} 中获得声望。
      </>
    ),
    rumorText: <>等你准备好了，{CompanyName.NSA} 想和你谈谈。</>,
    inviteReqs: [haveSomeSourceFile(6, 7), haveBladeburnerRank(BladeburnerConstants.RankNeededForFaction)],
    rumorReqs: [haveSomeSourceFile(6, 7), notCondition(inBitNode(8))],
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
    special: true,
    campaign: (): React.ReactElement => {
      return (
        <Option
          buttonText={"前往 Bladeburner 总部"}
          infoText={"通过完成合约和行动来获得声望。"}
          onClick={() => Router.toPage(Page.Bladeburner)}
        />
      );
    },
  }),

  [FactionName.ChurchOfTheMachineGod]: new FactionInfo({
    // prettier-ignore
    infoText:(<>
    {"                 ``          "}<br />
    {"             -odmmNmds:      "}<br />
    {"           `hNmo:..-omNh.    "}<br />
    {"           yMd`      `hNh    "}<br />
    {"           mMd        oNm    "}<br />
    {"           oMNo      .mM/    "}<br />
    {"           `dMN+    -mM+     "}<br />
    {"            -mMNo  -mN+      "}<br />
    {"  .+-        :mMNo/mN/       "}<br />
    {":yNMd.        :NMNNN/        "}<br />
    {"-mMMMh.        /NMMh`        "}<br />
    {" .dMMMd.       /NMMMy`       "}<br />
    {"  `yMMMd.     /NNyNMMh`      "}<br />
    {"   `sMMMd.   +Nm: +NMMh.     "}<br />
    {"     oMMMm- oNm:   /NMMd.    "}<br />
    {"      +NMMmsMm-     :mMMd.   "}<br />
    {"       /NMMMm-       -mMMd.  "}<br />
    {"        /MMMm-        -mMMd. "}<br />
    {"       `sMNMMm-        .mMmo "}<br />
    {"      `sMd:hMMm.        ./.  "}<br />
    {"     `yMy` `yNMd`            "}<br />
    {"    `hMs`    oMMy            "}<br />
    {"   `hMh       sMN-           "}<br />
    {"   /MM-       .NMo           "}<br />
    {"   +MM:       :MM+           "}<br />
    {"    sNNo-.`.-omNy`           "}<br />
    {"     -smNNNNmdo-             "}<br />
    {"        `..`                 "}<br /><br />
    许多文化都预言人类将在不久的将来迎来终结，一场终结世界的最终末日；但我们不这么认为。</>),
    rumorText: <>{CityName.Chongqing} 正在酝酿麻烦。</>,
    inviteReqs: [
      haveSourceFile(13),
      haveAugmentations(0),
      {
        toString: () => `调查 ${CityName.Chongqing} 那座破败的教堂`,
        toJSON: () => ({ type: "location", location: LocationName.ChongqingChurchOfTheMachineGod }),
        isSatisfied: (p: PlayerObject) => {
          return [...p.factions, ...p.factionInvitations].includes(FactionName.ChurchOfTheMachineGod);
        },
      },
    ],
    rumorReqs: [haveSourceFile(13), haveAugmentations(0)],
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
    special: true,
    keepOnInstall: true,
    campaign: (): React.ReactElement => {
      return (
        <Option
          buttonText={"打开 Stanek 的礼物"}
          infoText={
            "Stanek 的礼物是一件强大的强化，可以增强你所选择提升的属性。" +
            "与机械神教积累声望，只能通过为礼物充能来实现。"
          }
          onClick={() => Router.toPage(Page.StaneksGift)}
        />
      );
    },
  }),
  [FactionName.ShadowsOfAnarchy]: new FactionInfo({
    infoText: <>政府已被那些我们放任吞噬它的企业所掌控。为了将世界从枷锁中解放出来，众神赐予我们力量。</>,
    rumorText: <>你的潜入活动已经引起了注意。</>,
    inviteReqs: [
      {
        toString: () => `完成一次潜入`,
        toJSON: () => ({ type: "numInfiltrations", numInfiltrations: 1 }),
        isSatisfied: (p: PlayerObject) => {
          return [...p.factions, ...p.factionInvitations].includes(FactionName.ShadowsOfAnarchy);
        },
      },
    ],
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
    special: true,
    keepOnInstall: true,
    campaign: (): React.ReactElement => {
      return <Typography>{FactionName.ShadowsOfAnarchy} 只能通过潜入来获得声望。</Typography>;
    },
  }),
};

for (const factionName of GangConstants.Names) {
  FactionInfos[factionName].campaign = () => <GangCampaign factionName={factionName} />;
}
