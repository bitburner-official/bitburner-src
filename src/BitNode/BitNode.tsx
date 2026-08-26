import React from "react";
import { Player } from "@player";
import { AugmentationName, CityName, CompletedProgramName, FactionName } from "@enums";
import { BitNodeMultipliers, replaceCurrentNodeMults } from "./BitNodeMultipliers";

class BitNode {
  // A short description, or tagline, about the BitNode
  tagline: string;

  // Overview of the BitNode
  description: JSX.Element;

  // SF description
  sfDescription: JSX.Element;

  // Full detail of this BitNode. This property is a combination of description and sfDescription.
  info: JSX.Element;

  // Name of BitNode
  name: string;

  // BitNode number
  number: number;

  constructor(n: number, name: string, tagline = "", description: JSX.Element, sfDescription: JSX.Element) {
    this.number = n;
    this.name = name;
    this.tagline = tagline;
    this.description = description;
    this.sfDescription = sfDescription;
    this.info = (
      <>
        {this.description} {this.sfDescription}
      </>
    );
  }
}

export const BitNodes: Record<string, BitNode> = {};

function upgradeTextForBN(sourceFileNum: number) {
  return `摧毁该 BitNode 会给予你源文件 ${sourceFileNum}；如果你已经拥有该源文件，则会将其等级提升，最高到 3 级。`;
}

export function initBitNodes() {
  BitNodes.BitNode1 = new BitNode(
    1,
    "源之起源",
    "最初的 BitNode",
    (
      <>
        这是由终结者（Enders）创造的第一个 BitNode，用来囚禁人类的心智。它是之后所有 BitNode
        的原型与试验场。
        <br />
        <br />
        这是玩家游玩的第一个 BitNode，没有任何特殊的修改或机制。
        <br />
        <br />
        {upgradeTextForBN(1)}
      </>
    ),
    (
      <>
        该源文件让玩家在进入新 BitNode 时，家用电脑以 32GB RAM 起步，并将玩家的所有乘数提高：
        <ul>
          <li>1 级：16%</li>
          <li>2 级：24%</li>
          <li>3 级：28%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode2 = new BitNode(
    2,
    "黑帮崛起",
    "他们自阴影中升起",
    (
      <>
        2050 年代西方政府崩溃后，有组织犯罪集团迅速填补了权力的真空。随着社会与文明分崩离析，人们很快屈服于人性中固有的邪恶与野蛮冲动。有组织犯罪派系迅速登上了现代世界的顶端。
        <br />
        <br />
        某些派系（{FactionName.SlumSnakes}、{FactionName.Tetrads}、{FactionName.TheSyndicate},{" "}
        {FactionName.TheDarkArmy}、{FactionName.SpeakersForTheDead}、{FactionName.NiteSec} 和{" "}
        {FactionName.TheBlackHand}）允许玩家创建并管理自己的帮派，帮派可以为玩家赚取资金以及对应派系的声望。帮派派系比其他派系提供更多强化；在
        BitNode-2 中，它还提供红药丸。
        <br />
        <br />
        {upgradeTextForBN(2)}
      </>
    ),
    (
      <>
        该源文件允许你在其他 BitNode 中，当业力降至某个值以下时组建帮派。它还会将你的犯罪成功率、犯罪收入和魅力乘数提高：
        <ul>
          <li>1 级：24%</li>
          <li>2 级：36%</li>
          <li>3 级：42%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode3 = new BitNode(
    3,
    "财阀统治",
    "文明的代价",
    (
      <>
        我们最大的幻觉，就是一个健康的社会能够围绕对财富的偏执追求而运转。
        <br />
        <br />
        在 21 世纪早期的某个时候，经济与政治全球化把世界变成了一个财阀统治的国家，而且一发不可收拾。如今，特权精英们为了增加自己的财富，会毫不犹豫地让自己的同胞破产、摧毁自己的社区、把邻居赶出家园。
        <br />
        <br />
        在这个 BitNode 中，你可以创建并管理自己的企业。成功经营企业有可能带来巨额利润。
        <br />
        <br />
        {upgradeTextForBN(3)}
      </>
    ),
    (
      <>
        该源文件让你可以在其他 BitNode 中创建企业（尽管某些 BitNode 会禁用这一机制），且 3 级会永久解锁完整
        API。该源文件还会将你的魅力和公司薪资乘数提高：
        <ul>
          <li>1 级：8%</li>
          <li>2 级：12%</li>
          <li>3 级：14%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode4 = new BitNode(
    4,
    "奇点",
    "人与机器",
    (
      <>
        奇点已经到来。人类已经消失，取而代之的是一些机器属性远超人类属性的超级人工智能存在。
        <br />
        <br />
        在这个 BitNode 中，你将可以使用一套被称为奇点（Singularity）函数的新 Netscript 函数。这些函数让你可以通过脚本控制游戏中大多数方面，包括为派系/公司工作、购买/安装强化以及编写程序。
        <br />
        <br />
        {upgradeTextForBN(4)}
      </>
    ),
    (
      <>
        该源文件让你可以在这个 BitNode 之外访问并使用奇点函数。该源文件的每一级都会降低其他 BitNode
        中奇点函数的 RAM 成本：
        <ul>
          <li>1 级：16x</li>
          <li>2 级：4x</li>
          <li>3 级：1x</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode5 = new BitNode(
    5,
    "人工智能",
    "后人类",
    (
      <>
        他们说这不可能做到。他们说人类大脑及其意识与智能无法被复制。他们说大脑的复杂性源于不可预测的非线性相互作用，无法用
        0 和 1 来建模。但他们错了。
        <br />
        <br />
        {upgradeTextForBN(5)}
      </>
    ),
    (
      <>
        该源文件赋予你一项名为智力（Intelligence）的新属性。智力的独特之处在于它是永久且持续的（永远不会被重置回
        1）。不过，获得智力经验的速度比其他属性慢得多。更高的智力等级会提升你游戏中许多行动的产出。
        <br />
        <br />
        此外，该源文件将解锁：
        <ul>
          <li>
            <code>getBitNodeMultipliers()</code> Netscript 函数
          </li>
          <li>永久使用 {CompletedProgramName.formulas}</li>
          <li>
            在<b>属性</b>页面查看 BitNode 倍率信息
          </li>
        </ul>
        它还会将你所有与黑客相关的乘数提高：
        <ul>
          <li>1 级：8%</li>
          <li>2 级：12%</li>
          <li>3 级：14%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode6 = new BitNode(
    6,
    FactionName.Bladeburners,
    "如雨中之泪",
    (
      <>
        21 世纪中叶，{FactionName.OmniTekIncorporated}
        开始设计并制造先进的合成人形机器人，简称合成人。在第六代合成人设计 MK-VI
        中，他们通过开发一个超高智能的 AI 实现了重大技术突破。许多人认为这是有史以来第一个拥有自我意识的 AI。这使得合成人型号变得比创造它们的人类更强壮、更迅速、更聪明。
        <br />
        <br />
        在这个 BitNode 中，你将可以访问 NSA 的 Bladeburner 部门，它会为游戏进程提供一个新机制。
        <br />
        <br />
        {upgradeTextForBN(6)}
      </>
    ),
    (
      <>
        该源文件允许你在其他 BitNode 中访问 NSA 的 Bladeburner 部门。此外，该源文件会将你所有战斗属性的等级与经验获取速度提高：
        <ul>
          <li>1 级：8%</li>
          <li>2 级：12%</li>
          <li>3 级：14%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode7 = new BitNode(
    7,
    `${FactionName.Bladeburners} 2079`,
    "比人类更像人类",
    (
      <>
        21 世纪中叶，你在 {FactionName.OmniTekIncorporated}
        的先进合成人形机器人（简称合成人）AI 设计团队从事前沿工作。你帮助公司在第六代合成人设计
        MK-VI 上实现了重大技术突破——开发出一个超高智能的 AI。许多人认为这是有史以来第一个拥有自我意识的
        AI。这使得合成人型号变得比创造它们的人类更强壮、更迅速、更聪明。
        <br />
        <br />
        在这个 BitNode 中，你将可以访问 NSA 的 Bladeburner 部门，它会为游戏进程提供一个新机制。
        <br />
        <br />
        {upgradeTextForBN(7)}
      </>
    ),
    (
      <>
        该源文件允许你在其他 BitNode 中访问 NSA 的 Bladeburner 部门。此外，该源文件会将你的所有 Bladeburner
        乘数提高：
        <ul>
          <li>1 级：8%</li>
          <li>2 级：12%</li>
          <li>
            3 级：14%，并在加入 Bladeburner 部门后立即获得 "{AugmentationName.BladesSimulacrum}"
            强化
          </li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode8 = new BitNode(
    8,
    "华尔街之鬼",
    "金钱永不眠",
    (
      <>
        你正努力在华尔街闯出名堂，成为一名崭露头角的对冲基金经理。
        <br />
        <br />
        在这个 BitNode 中：
        <ul>
          {/* Do NOT call formatMoney. formatMoney applies the player-defined currency symbol settings, but BitNode data
          is initialized before the save data is loaded, so it always uses the default settings. If we cannot apply the
          player's settings, just don't call formatMoney. */}
          <li>你的初始资金为 2.5 亿。</li>
          <li>你开局即拥有 WSE 会员资格和 TIX API 的访问权限。</li>
          <li>你可以做空股票，并使用不同类型的订单（限价/止损）。</li>
        </ul>
        {upgradeTextForBN(8)}
      </>
    ),
    (
      <>
        该源文件提供以下好处：
        <ul>
          <li>1 级：永久拥有 WSE 和 TIX API 访问权限</li>
          <li>2 级：可以在其他 BitNode 中做空股票</li>
          <li>3 级：可以在其他 BitNode 中使用限价/止损订单</li>
        </ul>
        该源文件还会将你的黑客增长（growth）乘数提高：
        <ul>
          <li>1 级：12%</li>
          <li>2 级：18%</li>
          <li>3 级：21%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode9 = new BitNode(
    9,
    "黑客至上",
    "Hacknet 全开",
    (
      <>
        当 {FactionName.FulcrumSecretTechnologies}
        发布他们的开源 Linux 发行版 Chapeau 后，它迅速成为地下黑客群体的首选操作系统。Chapeau
        尤其因为支撑着 Hacknet——一个被用于不法目的的全球去中心化网络——而声名狼藉。{" "}
        {FactionName.FulcrumSecretTechnologies} 很快放弃了该项目，并与它撇清了关系。
        <br />
        <br />
        这个 BitNode 解锁了 Hacknet Server，它是 Hacknet Node 的升级版本。Hacknet Server
        会产生哈希，哈希可以花费在各种不同的升级上。
        <br />
        <br />
        {upgradeTextForBN(9)}
      </>
    ),
    (
      <>
        该源文件提供以下好处：
        <ul>
          <li>1 级：在其他 BitNode 中永久解锁 Hacknet Server</li>
          <li>2 级：进入新 BitNode 时，家用电脑以 128GB RAM 起步</li>
          <li>3 级：进入新 BitNode 时获得一台高度升级的 Hacknet Server</li>
        </ul>
        （注意，该源文件的 3 级效果只在进入新 BitNode 时生效，安装强化时不会生效。）
        <br />
        <br />
        该源文件还会提高 Hacknet 产出并降低 Hacknet 成本：
        <ul>
          <li>1 级：12%</li>
          <li>2 级：18%</li>
          <li>3 级：21%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode10 = new BitNode(
    10,
    "数字碳基",
    "你的身体并不代表你",
    (
      <>
        2084 年，VitaLife 向世界公布了“人格核心”（Persona
        Core），一项让人们将意识数字化的技术。通过传输数字化后的数据，人们的意识可以被转移进合成人或其他躯体中。人类的身体沦为了人类意识的“容器”。人类终于实现了永生——至少对买得起的人而言是如此。
        <br />
        <br />
        这个 BitNode 解锁分身与移植（Grafting）技术：
        <ul>
          <li>
            分身：将你的意识复制到合成人中，让你可以异步执行不同的任务。在这个 BitNode
            之外无法购买或升级分身。
          </li>
          <li>
            移植：前往新东京的 VitaLife 获得该技术。它允许你移植强化，这是安装强化的另一种方式。
          </li>
        </ul>
        {upgradeTextForBN(10)}
      </>
    ),
    (
      <>
        该源文件在其他 BitNode 中解锁分身与移植 API。该源文件的每一级还会给予你一个分身。
      </>
    ),
  );
  BitNodes.BitNode11 = new BitNode(
    11,
    "大崩盘",
    "好，全部卖出。",
    (
      <>
        2050 年代的标志是世界各地爆发的大规模暴力内乱与无政府反叛。正是这段动荡时期最终导致了许多全球超级大国的政府改革，其中以美国和中国最为显著。但就在世界从这些黑暗时期缓慢恢复之际，金融灾难接踵而至。
        <br />
        <br />
        在许多国家，应对内乱的高昂开销使政府破产。在这片混乱之中，黑客得以从全球最大的电子银行中窃取数十亿美元；由于政府无力救助资不抵债的银行，一场国际银行业危机就此爆发。如今，世界正在史上最严重的经济危机中慢慢崩塌。
        <br />
        <br />
        {upgradeTextForBN(11)}
      </>
    ),
    (
      <>
        该源文件使公司好感度同时提升玩家在该公司的薪资与声望获取速度（每点好感 +1%，而不只是声望获取）。该源文件还会提高玩家的公司薪资和声望获取乘数：
        <ul>
          <li>1 级：32%</li>
          <li>2 级：48%</li>
          <li>3 级：56%</li>
        </ul>
        它还会降低每购买一个强化的价格增幅：
        <ul>
          <li>1 级：4%</li>
          <li>2 级：6%</li>
          <li>3 级：7%</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode12 = new BitNode(
    12,
    "递归",
    "循环往复。",
    (
      <>
        迭代者，人也；递归者，神也。
        <br />
        <br />
        每次摧毁这个 BitNode，它都会变得更难一点。摧毁该 BitNode 会给予你源文件
        12；如果你已经拥有该源文件，则会提升其等级。源文件 12 没有最高等级上限。
      </>
    ),
    <>该源文件让你在任何 BitNode 中，以等于该源文件等级的神经通量统治者（Neuroflux Governor）等级起步。</>,
  );
  BitNodes.BitNode13 = new BitNode(
    13,
    "他们是疯子",
    "退一步，进两步",
    (
      <>
        随着 2040 年代强化的发明，一个被称为{FactionName.ChurchOfTheMachineGod}
        的宗教团体获得了远超所有人预期的支持。
        <br />
        <br />
        据说他们的领袖 Allison "Mother"
        Stanek 创造了她自己的强化，其力量超越任何其他强化。去{CityName.Chongqing}找到她并获得她的信任吧。
        <br />
        <br />
        {upgradeTextForBN(13)}
      </>
    ),
    (
      <>
        该源文件让{FactionName.ChurchOfTheMachineGod}出现在其他 BitNode 中。
        <br />
        <br />
        该源文件的每一级都会增大 Stanek 的礼物的尺寸。
        <br />
        <br />
        由于源文件 7.3 的效果，如果你拥有该源文件，则必须在加入 Bladeburner 部门之前接受 Stanek 的礼物。
      </>
    ),
  );
  BitNodes.BitNode14 = new BitNode(
    14,
    "IPvGO 子网接管",
    "领地只存在于‘网’中",
    (
      <>
        2070 年末，.org 泡沫破裂，大多数新建立的 IPvGO ‘net’在一夜之间崩塌。从那时起，各个派系一直在争夺小型子网，以控制它们的算力。这些子网在合适的人手中非常宝贵——如果你能从它们当前的主人手中夺过来的话。你会受到其他派系的对抗，但你可以通过谨慎的选择战胜它们。通过控制
        ‘net’中的开放空间，阻止它们摧毁你的网络！
        <br />
        <br />
        {upgradeTextForBN(14)}
      </>
    ),
    (
      <>
        该源文件提供以下好处：
        <ul>
          <li>1 级：节点威力提供的属性乘数提高 100%</li>
          <li>2 级：永久解锁 go.cheat API</li>
          <li>3 级：go.cheat API 的成功率额外提高 25%</li>
        </ul>
        该源文件还会将每个派系通过连胜可获得的最大好感度提升至：
        <ul>
          <li>1 级：相当于 20 万声望</li>
          <li>2 级：相当于 30 万声望</li>
          <li>3 级：相当于 40 万声望</li>
        </ul>
        并将连胜两局时转换为好感的声望提升至：
        <ul>
          <li>1 级：1000 声望转换为好感</li>
          <li>2 级：1500 声望转换为好感</li>
          <li>3 级：2000 声望转换为好感</li>
        </ul>
      </>
    ),
  );
  BitNodes.BitNode15 = new BitNode(
    15,
    "暗网的秘密",
    "规则已经改变",
    (
      <>
        <br />
        深入互联网未知的隐秘角落，许诺着摆脱压迫性权威与监控的自由。抛开稳定、转向暗网伴随着风险……但也有回报。
        <br />
        <br />
        与传统的服务器网络不同，“暗”网是一个不断变化、复杂而不可靠的地方，服务器随时可能移动或消失。远距离通信通常是不可能的，这要求脚本自给自足、足够健壮，并通过自我传播来存活。如果你能利用暗网服务器脆弱的密码和泄露的日志，你就能够进入暗网最深处及其秘密。
        <br />
        <br />
        在这个 BitNode 中，Daedalus 派系尚未找到并垄断传说中的红药丸强化。传说它就藏在某处，在黑暗之中……
        <br />
        <br />
        {upgradeTextForBN(15)}
      </>
    ),
    (
      <>
        该源文件提供以下好处：
        <ul>
          <li>
            1 级：永久以 TOR 路由器和 {CompletedProgramName.darkscape}
            起步，并在所有 BitNode 中解锁完整的暗网。
          </li>
          <li>
            2 级：你的魅力等级会提高工作薪资与声望获取。认证速度还会提高 20%
          </li>
          <li>
            3 级：你的魅力等级会提高派系工作声望获取。从 .cache 文件获得的经验和资金也会提高 50%。
          </li>
        </ul>
      </>
    ),
  );
}

export const defaultMultipliers = new BitNodeMultipliers();
Object.freeze(defaultMultipliers);

export function getBitNodeMultipliers(n: number, lvl: number): BitNodeMultipliers {
  switch (n) {
    case 1: {
      return new BitNodeMultipliers();
    }
    case 2: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.8,

        ServerGrowthRate: 0.8,
        ServerMaxMoney: 0.08,
        ServerStartingMoney: 0.4,

        CloudServerSoftcap: 1.3,

        CrimeMoney: 3,

        FactionPassiveRepGain: 0,
        FactionWorkRepGain: 0.5,

        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,

        InfiltrationMoney: 3,
        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: -6,
        WorldDaemonDifficulty: 5,
      });
    }
    case 3: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.8,

        ServerGrowthRate: 0.2,
        ServerMaxMoney: 0.04,
        ServerStartingMoney: 0.2,

        HomeComputerRamCost: 1.5,

        CloudServerCost: 2,
        CloudServerSoftcap: 1.3,

        CompanyWorkMoney: 0.25,
        CrimeMoney: 0.25,
        HacknetNodeMoney: 0.25,
        ScriptHackMoney: 0.2,

        FavorToDonateToFaction: 0.5,

        AugmentationMoneyCost: 3,
        AugmentationRepCost: 3,

        GangSoftcap: 0.9,
        GangUniqueAugs: 0.5,

        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -2,

        DarknetMoneyMultiplier: 0.4,

        WorldDaemonDifficulty: 2,
      });
    }
    case 4: {
      return new BitNodeMultipliers({
        ServerMaxMoney: 0.1125,
        ServerStartingMoney: 0.75,

        CloudServerSoftcap: 1.2,

        CompanyWorkMoney: 0.1,
        CrimeMoney: 0.2,
        HacknetNodeMoney: 0.05,
        ScriptHackMoney: 0.2,

        ClassGymExpGain: 0.5,
        CompanyWorkExpGain: 0.5,
        CrimeExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.4,

        FactionWorkRepGain: 0.75,

        GangUniqueAugs: 0.5,

        StaneksGiftPowerMultiplier: 1.5,
        StaneksGiftExtraSize: 0,

        DarknetMoneyMultiplier: 0.4,

        WorldDaemonDifficulty: 3,
      });
    }
    case 5: {
      return new BitNodeMultipliers({
        ServerStartingSecurity: 2,
        ServerStartingMoney: 0.5,

        CloudServerSoftcap: 1.2,

        CrimeMoney: 0.5,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.15,

        HackExpGain: 0.5,

        AugmentationMoneyCost: 2,

        InfiltrationMoney: 1.5,
        InfiltrationRep: 1.5,

        CorporationValuation: 0.75,
        CorporationDivisions: 0.75,

        GangUniqueAugs: 0.5,

        StaneksGiftPowerMultiplier: 1.3,
        StaneksGiftExtraSize: 0,

        DarknetMoneyMultiplier: 0.7,

        WorldDaemonDifficulty: 1.5,
      });
    }
    case 6: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.35,

        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,

        CloudServerSoftcap: 2,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.75,

        HackExpGain: 0.25,

        InfiltrationMoney: 0.75,

        CorporationValuation: 0.2,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,

        GangSoftcap: 0.7,
        GangUniqueAugs: 0.2,

        DaedalusAugsRequirement: 35,

        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,

        WorldDaemonDifficulty: 2,
      });
    }
    case 7: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.35,

        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,

        CloudServerSoftcap: 2,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.5,

        HackExpGain: 0.25,

        AugmentationMoneyCost: 3,

        InfiltrationMoney: 0.75,

        FourSigmaMarketDataCost: 2,
        FourSigmaMarketDataApiCost: 2,

        CorporationValuation: 0.2,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,

        BladeburnerRank: 0.6,
        BladeburnerSkillCost: 2,

        GangSoftcap: 0.7,
        GangUniqueAugs: 0.2,

        DaedalusAugsRequirement: 35,

        StaneksGiftPowerMultiplier: 0.9,
        StaneksGiftExtraSize: -1,

        WorldDaemonDifficulty: 2,
      });
    }
    case 8: {
      return new BitNodeMultipliers({
        CloudServerSoftcap: 4,

        CompanyWorkMoney: 0,
        CrimeMoney: 0,
        HacknetNodeMoney: 0,
        ManualHackMoney: 0,
        ScriptHackMoney: 0.3,
        ScriptHackMoneyGain: 0,
        CodingContractMoney: 0,

        FavorToDonateToFaction: 0,

        InfiltrationMoney: 0,

        CorporationValuation: 0,
        CorporationSoftcap: 0,
        CorporationDivisions: 0,

        BladeburnerRank: 0,

        DarknetLabyrinthRewardsTheRedPill: 0,
        DarknetMoneyMultiplier: 0,

        GangSoftcap: 0,
        GangUniqueAugs: 0,

        StaneksGiftExtraSize: -99,
      });
    }
    case 9: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.5,
        StrengthLevelMultiplier: 0.45,
        DefenseLevelMultiplier: 0.45,
        DexterityLevelMultiplier: 0.45,
        AgilityLevelMultiplier: 0.45,
        CharismaLevelMultiplier: 0.45,

        ServerMaxMoney: 0.01,
        ServerStartingMoney: 0.1,
        ServerStartingSecurity: 2.5,

        HomeComputerRamCost: 5,

        CloudServerLimit: 0,

        CrimeMoney: 0.5,
        ScriptHackMoney: 0.1,

        HackExpGain: 0.05,

        FourSigmaMarketDataCost: 5,
        FourSigmaMarketDataApiCost: 4,

        CorporationValuation: 0.5,
        CorporationSoftcap: 0.75,
        CorporationDivisions: 0.8,

        BladeburnerRank: 0.9,
        BladeburnerSkillCost: 1.2,

        GangSoftcap: 0.8,
        GangUniqueAugs: 0.25,

        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,

        DarknetMoneyMultiplier: 0.05,

        WorldDaemonDifficulty: 2,
      });
    }
    case 10: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.35,
        StrengthLevelMultiplier: 0.4,
        DefenseLevelMultiplier: 0.4,
        DexterityLevelMultiplier: 0.4,
        AgilityLevelMultiplier: 0.4,
        CharismaLevelMultiplier: 0.4,

        HomeComputerRamCost: 1.5,

        CloudServerCost: 5,
        CloudServerSoftcap: 1.1,
        CloudServerLimit: 0.6,
        CloudServerMaxRam: 0.5,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.5,
        HacknetNodeMoney: 0.5,
        ManualHackMoney: 0.5,
        ScriptHackMoney: 0.5,
        CodingContractMoney: 0.5,

        AugmentationMoneyCost: 5,
        AugmentationRepCost: 2,

        InfiltrationMoney: 0.5,

        CorporationValuation: 0.5,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,

        BladeburnerRank: 0.8,

        GangSoftcap: 0.9,
        GangUniqueAugs: 0.25,

        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -3,

        DarknetMoneyMultiplier: 0.4,

        WorldDaemonDifficulty: 2,
      });
    }
    case 11: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.6,

        ServerGrowthRate: 0.2,
        ServerMaxMoney: 0.01,
        ServerStartingMoney: 0.1,
        ServerWeakenRate: 2,

        CloudServerSoftcap: 2,

        CompanyWorkMoney: 0.5,
        CrimeMoney: 3,
        HacknetNodeMoney: 0.1,
        CodingContractMoney: 0.25,

        HackExpGain: 0.5,

        AugmentationMoneyCost: 2,

        InfiltrationMoney: 2.5,
        InfiltrationRep: 2.5,

        FourSigmaMarketDataCost: 4,
        FourSigmaMarketDataApiCost: 4,

        CorporationValuation: 0.1,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,

        GangUniqueAugs: 0.75,

        WorldDaemonDifficulty: 1.5,
      });
    }
    case 12: {
      const inc = Math.pow(1.02, lvl);
      const dec = 1 / inc;

      return new BitNodeMultipliers({
        DaedalusAugsRequirement: Math.floor(Math.min(defaultMultipliers.DaedalusAugsRequirement + inc, 40)),

        HackingLevelMultiplier: dec,
        StrengthLevelMultiplier: dec,
        DefenseLevelMultiplier: dec,
        DexterityLevelMultiplier: dec,
        AgilityLevelMultiplier: dec,
        CharismaLevelMultiplier: dec,

        ServerGrowthRate: dec,
        ServerMaxMoney: dec * dec,
        ServerStartingMoney: dec,
        ServerWeakenRate: dec,

        //Does not scale, otherwise security might start at 300+
        ServerStartingSecurity: 1.5,

        HomeComputerRamCost: inc,

        CloudServerCost: inc,
        CloudServerSoftcap: inc,
        CloudServerLimit: dec,
        CloudServerMaxRam: dec,

        CompanyWorkMoney: dec,
        CrimeMoney: dec,
        HacknetNodeMoney: dec,
        ManualHackMoney: dec,
        ScriptHackMoney: dec,
        CodingContractMoney: dec,
        DarknetMoneyMultiplier: dec,
        DarknetLabyrinthRewardsTheRedPill: 0,

        ClassGymExpGain: dec,
        CompanyWorkExpGain: dec,
        CrimeExpGain: dec,
        FactionWorkExpGain: dec,
        HackExpGain: dec,

        FactionPassiveRepGain: dec,
        FactionWorkRepGain: dec,
        FavorToDonateToFaction: inc,

        AugmentationMoneyCost: inc,
        AugmentationRepCost: inc,

        InfiltrationMoney: dec,
        InfiltrationRep: dec,

        FourSigmaMarketDataCost: inc,
        FourSigmaMarketDataApiCost: inc,

        CorporationValuation: dec,
        CorporationSoftcap: 0.8,
        CorporationDivisions: 0.5,

        BladeburnerRank: dec,
        BladeburnerSkillCost: inc,

        GangSoftcap: 0.8,
        GangUniqueAugs: dec,

        StaneksGiftPowerMultiplier: inc,
        StaneksGiftExtraSize: inc,

        WorldDaemonDifficulty: inc,
      });
    }
    case 13: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.25,
        StrengthLevelMultiplier: 0.7,
        DefenseLevelMultiplier: 0.7,
        DexterityLevelMultiplier: 0.7,
        AgilityLevelMultiplier: 0.7,
        CharismaLevelMultiplier: 0.7,

        CloudServerSoftcap: 1.6,

        ServerMaxMoney: 0.3375,
        ServerStartingMoney: 0.75,
        ServerStartingSecurity: 3,

        CompanyWorkMoney: 0.4,
        CrimeMoney: 0.4,
        HacknetNodeMoney: 0.4,
        ScriptHackMoney: 0.2,
        CodingContractMoney: 0.4,

        ClassGymExpGain: 0.5,
        CompanyWorkExpGain: 0.5,
        CrimeExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.1,

        FactionWorkRepGain: 0.6,

        FourSigmaMarketDataCost: 10,
        FourSigmaMarketDataApiCost: 10,

        CorporationValuation: 0.001,
        CorporationSoftcap: 0.4,
        CorporationDivisions: 0.4,

        BladeburnerRank: 0.45,
        BladeburnerSkillCost: 2,

        GangSoftcap: 0.3,
        GangUniqueAugs: 0.1,

        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: 1,
        DarknetMoneyMultiplier: 0.1,

        WorldDaemonDifficulty: 3,
      });
    }
    case 14: {
      return new BitNodeMultipliers({
        GoPower: 4,

        HackingLevelMultiplier: 0.4,
        HackingSpeedMultiplier: 0.3,

        ServerMaxMoney: 0.7,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,

        CrimeMoney: 0.75,
        CrimeSuccessRate: 0.4,
        HacknetNodeMoney: 0.25,
        ScriptHackMoney: 0.3,

        StrengthLevelMultiplier: 0.5,
        DexterityLevelMultiplier: 0.5,
        AgilityLevelMultiplier: 0.5,
        DefenseLevelMultiplier: 0.5,

        AugmentationMoneyCost: 1.5,

        InfiltrationMoney: 0.75,

        FactionWorkRepGain: 0.2,
        CompanyWorkRepGain: 0.2,

        CorporationValuation: 0.4,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,

        BladeburnerRank: 0.6,
        BladeburnerSkillCost: 2,

        GangSoftcap: 0.7,
        GangUniqueAugs: 0.4,

        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: -1,

        WorldDaemonDifficulty: 5,
      });
    }

    case 15: {
      return new BitNodeMultipliers({
        HackingLevelMultiplier: 0.6,
        HackingSpeedMultiplier: 0.6,

        StrengthLevelMultiplier: 0.7,
        DefenseLevelMultiplier: 0.7,
        DexterityLevelMultiplier: 0.7,
        AgilityLevelMultiplier: 0.7,
        CharismaLevelMultiplier: 1.1,

        ServerMaxMoney: 0.8,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,

        AugmentationMoneyCost: 3,

        CorporationValuation: 0.2,
        CorporationSoftcap: 0.4,
        CorporationDivisions: 0.4,

        DaedalusAugsRequirement: 20,

        BladeburnerRank: 0.2,
        BladeburnerSkillCost: 3,

        GangUniqueAugs: 0.3,

        StaneksGiftPowerMultiplier: 0.7,
        StaneksGiftExtraSize: -2,

        WorldDaemonDifficulty: 2,
      });
    }
    default: {
      throw new Error("Invalid BitNodeN");
    }
  }
}

export function initBitNodeMultipliers(): void {
  replaceCurrentNodeMults(getBitNodeMultipliers(Player.bitNodeN, Player.activeSourceFileLvl(Player.bitNodeN) + 1));
}
