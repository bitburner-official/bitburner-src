import { CityName, FactionName, CompanyName, LiteratureName, CompletedProgramName } from "@enums";
import { Literature } from "./Literature";
import { Typography } from "@mui/material";
import React from "react";
import { defaultSettingsDictionary, dogNameDictionary } from "../DarkNet/models/dictionaryData";

export const Literatures: Record<LiteratureName, Literature> = {
  [LiteratureName.HackersStartingHandbook]: new Literature({
    title: "The Beginner's Guide to Hacking",
    filename: LiteratureName.HackersStartingHandbook,
    text: (
      <Typography>
        刚开始时，入侵是赚钱和推进游戏进程最有利可图的方式。这里简要收集了一些技巧/要点，帮助你充分利用入侵脚本。
        <br />
        <br />
        -hack() 和 grow() 都按百分比运作。hack() 窃取服务器上一定比例的资金，grow()
        则以某个百分比（乘法方式）增加服务器上的资金
        <br />
        <br />
        -由于 hack() 和 grow() 按百分比运作，当目标服务器资金较多时它们更有效。因此，你应该先设法把服务器上的资金（用
        grow()）增加到一定程度，然后再入侵它。两个重要的 Netscript 函数是 getServerMoneyAvailable() 和
        getServerMaxMoney()
        <br />
        <br />
        -保持安全等级处于低位。安全等级会影响入侵的一切。两个重要的 Netscript 函数是 getServerSecurityLevel() 和
        getServerMinSecurityLevel()
        <br />
        <br />
        -前往城里的 "Alpha Enterprises" 购买额外的云服务器。它们相对便宜，能在游戏早期为你提供宝贵的 RAM 来运行更多脚本
        <br />
        <br />
        -优先升级家用电脑的 RAM。这同样可以在 "Alpha Enterprises" 完成
        <br />
        <br />
        -许多低等级服务器有闲置的 RAM。你可以用这些 RAM 运行你的脚本。使用 scp 终端或 Netscript
        命令把你的脚本复制到这些服务器上，然后运行它们。
      </Typography>
    ),
  }),
  [LiteratureName.CorporationManagementHandbook]: new Literature({
    title: "Short Introduction for Creating a Successful Corporation",
    filename: LiteratureName.CorporationManagementHandbook,
    text: (
      <Typography>
        你应该查看文档标签页中的游戏内企业文档（Documentation {"->"} Advanced Mechanics {"->"}
        Corporation）。它是管理企业最有用、最新的资源。
        <br />
        <br />
        <u>企业入门</u>
        <br />
        首先，前往 Sector-12 的市政厅创建企业。这需要你自掏 150e9 资金，但这笔钱会进入企业的资金池。如果你在
        BitNode 3 中，还可以选择从政府获得启动资金，作为交换要出让 5 亿股股份。你的企业可以拥有多个不同部门，每个部门属于不同行业。行业有很多种，各自属性不同。要创建第一个部门，点击管理界面顶部的“扩展”按钮。推荐第一个部门选择农业。
        <br />
        <br />
        接下来你需要雇佣一些员工。员工可以被分配到五个不同的职位。每个职位对企业的各个方面有不同的影响。建议每个职位至少有一名员工。
        <br />
        <br />
        每个行业都会使用某些材料组合来生产其他材料和/或制造产品。相关信息会显示在每个部门的界面中。
        <br />
        <br />
        产品是特殊的、因行业而异的对象。它们与材料不同，因为你必须手动选择研发它们，而且可以研发任意数量的产品。研发产品需要时间，但产品产生的收入通常远高于任何材料。并非所有行业都能制造产品。要创建产品，请在部门界面左上方面板中寻找按钮（例如软件行业的按钮写着“研发软件”）。
        <br />
        <br />
        要启动你的供应链系统，请购买你的行业生产其他材料/产品所需的材料。点击相应材料旁边的“购买”按钮即可。当你拥有所需材料后就会立即开始生产。你生产的材料/产品的数量和质量/效果评级取决于多种因素，例如你的员工及其生产力，以及用于生产的材料的质量。
        <br />
        <br />
        开始产出材料/产品后，你就可以出售它们来获得收入。点击相应材料或产品旁的“出售”按钮即可。你能售出的材料/产品数量取决于许多不同因素。要生产和出售产品，必须先完成其全部研发。
        <br />
        <br />
        以上就是让你的企业运转起来的基础知识！现在你可以开始购买升级来改善收益了。如果缺钱，可以考虑寻找种子投资人，他们用资金换取股票份额。否则，等你觉得准备就绪后，就让公司上市吧！上市后就无法再找投资人。此后你的公司将公开交易，股价会随其财务表现波动。为了给自己赚钱，你可以设置分红以获得稳定可靠的收入，也可以出售股份快速套现。
        <br />
        <br />
        <u>技巧/要点</u>
        <br />
        -从一个部门开始，比如农业。让它自身盈利，然后扩展到与你所选部门互为材料供需关系的部门。
        <br />
        <br />
        -材料是盈利的，但产品才是真正赚钱的地方；不过如果产品研发预算低或用低质量材料生产，就卖不出好价钱。
        <br />
        <br />
        -“智能供应链”升级极其有用。考虑尽快购买它。
        <br />
        <br />
        -购买硬件、机器人、AI 核心和房地产可能会提高你的产能。其效果取决于你所处的行业。
        <br />
        <br />
        -要优化产能，你需要让所有员工职位保持良好的平衡。
        <br />
        <br />
        -生产所用材料的质量会影响产出的材料/产品的质量/效果评级，因此垂直整合对高利润非常重要。
        <br />
        <br />
        -从公开市场购买的材料质量恒为 1。
        <br />
        <br />
        -你的材料/产品的售价在很大程度上受质量/效果评级影响。
        <br />
        <br />
        -研发产品时，不同职位对研发过程的影响不同：有些加快研发速度，有些提升成品评级。
        <br />
        <br />
        -如果你的员工士气或精力低下，他们的产出会大打折扣。保证足够的实习生能让这些数值升高并保持高位。1/9
        是不错的实习生比例（实习生数 / 办公室规模）。如果士气和精力仍然下降，就用 1/6。
        <br />
        <br />
        -别忘了为你的公司做广告。如果没人知道你，你就不会有任何生意。
        <br />
        <br />
        -公司知名度固然很好，但真正重要的是公司的受欢迎程度。尽量把受欢迎程度保持在最高，以便销售获得最大收益。
        <br />
        <br />
        -记住，要想赚钱就得先花钱！
        <br />
        <br />
        -安装强化时你的企业不会重置，但摧毁 BitNode 时会重置。
      </Typography>
    ),
  }),
  [LiteratureName.HistoryOfSynthoids]: new Literature({
    title: "A Brief History of Synthoids",
    filename: LiteratureName.HistoryOfSynthoids,
    factionRumors: [FactionName.OmniTekIncorporated, FactionName.Bladeburners],
    text: (
      <Typography>
        合成人形机器人，简称合成人，是基因工程打造的机器人；除强化外，它们完全由有机物质构成。因此，合成人在形态、构造和外表上与人类几乎毫无二致。
        <br />
        <br />
        合成人最初由 {FactionName.OmniTekIncorporated}
        在本世纪中叶前后设计并制造。它们的最初用途是体力劳动和灾害应急响应。因此，它们起初只被编程用于执行特定任务。之后的每一次迭代都提升了合成人的智能与能力。到第
        6 代（称为 MK-VI）时，合成人已经聪明到能够自主决策，以至于许多人认为{" "}
        {FactionName.OmniTekIncorporated} 创造了第一个拥有自我意识的 AI。这些 MK-VI 合成人被大批量生产（估计多达 500
        亿台），以期提高社会生产力、提振全球经济。出于人类对技术进步的渴望，当时对未来的乐观与兴奋达到了前所未有的高度。
        <br />
        <br />
        然而在 2070 年，所有这些兴奋与乐观迅速化为恐惧、恐慌与绝望：一个名为 Ascendis Totalis
        的恐怖组织入侵了 {FactionName.OmniTekIncorporated}，并将一个失控 AI 上传到他们的几家合成人制造工厂。这次入侵未被察觉，数月间{" "}
        {FactionName.OmniTekIncorporated} 在不知不觉中源源不断地生产出嵌入该失控 AI
        的合成人大军。随后，在 2070 年 12 月 24 日，Omnica 激活了失控 AI
        中休眠的协议，导致所有被感染的合成人立即发动军事行动，企图搜寻并消灭全人类。
        <br />
        <br />
        随之而来的是人类历史上最致命的冲突。这场如今通常被称为“合成人起义”的危机在一年内造成近一百亿人死亡。尽管世界各国联手对抗威胁，MK-VI
        合成人仍然比人类更强壮、更迅速、更聪明、更适应环境，在每一次交锋中都胜过人类。
        <br />
        <br />
        直到一支被称为{FactionName.Bladeburners}的国际精英特种部队做出牺牲，人类才终于得以击败合成人。{" "}
        {FactionName.Bladeburners} 的最后一击是一次自杀式爆破任务，摧毁了大部分 MK-VI
        合成人，包括其许多领袖。在接下来的几周里，世界各地的军队得以围捕并关闭残余的失控 MK-VI
        合成人，结束了合成人起义。
        <br />
        <br />
        血腥冲突之后，《合成人协定》起草完成。该协定禁止 {FactionName.OmniTekIncorporated}
        制造任何超出 MK-III 系列的合成人，也禁止任何其他公司制造具备高级近自我意识 AI
        的人形机器人。未携带 Ascendis Totalis 失控 AI 的 MK-VI 合成人被允许继续存在，但被剥夺了一切权利与保护，因为他们不被视作人类。他们还被禁止从事任何可能构成全球安全威胁的活动，例如为任何军事/国防组织工作，或开展任何生物工程、计算或机器人相关研究。
        <br />
        <br />
        不幸的是，许多人相信并非所有起义中的失控 MK-VI 合成人都被找到并销毁，其中许多正以普通人类的身份混迹于当今社会。作为应对，许多国家设立了{" "}
        {FactionName.Bladeburners} 部门——负责调查和处理一切合成人威胁的特殊军事分支。
        <br />
        <br />
        时至今日，由于那场起义，残存的合成人与人类之间仍然关系紧张。
        <br />
        <br />
        没有人知道恐怖组织 Ascendis Totalis 后来怎么样了。
      </Typography>
    ),
  }),
  [LiteratureName.AGreenTomorrow]: new Literature({
    title: "A Green Tomorrow",
    filename: LiteratureName.AGreenTomorrow,
    text: (
      <Typography>
        从几十年前开始，全球掀起了一场大规模的可再生能源发电运动，以应对全球变暖和气候变化。向可再生能源的转型取得了巨大成功——至少看起来如此。2045
        年，世界上竟有 80% 的能源来自不可再生的化石燃料。而如今，大约三十年过去，这一数字已降至 15%。世界上的大部分能源现在来自核能以及太阳能、地热能等可再生能源。遗憾的是，这些努力并不像表面上那样成功。
        <br />
        <br />
        自 2045 年以来，一次能源消耗飙升了近十倍。这主要是由于城市人口的增长，以及在我们生活中无处不在的越来越先进（且耗电）的技术的兴起。因此，尽管化石燃料能源占比大幅下降，我们从化石燃料生产的能源总量实际上反而增加了。
        <br />
        <br />
        我们这个物种对能源的不负责任使用以及对地球母亲的漠视所带来的恶果已日益明显。去年，死亡谷沙漠记录到了 190F（约 88°C）
        的气温，比本世纪初的最高纪录高出 50% 以上。在过去二十年里，曼哈顿、波士顿、洛杉矶等许多大城市已被上升的海平面部分或完全淹没。如今，世界超过 75%
        的农业在恒温垂直农场中进行，因为大多数传统农田已因恶劣的气候条件而无法使用。
        <br />
        <br />
        尽管如此，统治世界的贪婪腐败的企业对威胁我们物种的这些问题毫无作为。所以，重担落在了我们这些普通人身上。我们每一个人都可以做那些企业不愿做的事来改变现状：承担责任。如果我们不这样做，很快就不会剩下可以拯救的地球了。我们是绿色明天的最后希望。
      </Typography>
    ),
  }),
  [LiteratureName.AlphaOmega]: new Literature({
    title: "Alpha and Omega",
    filename: LiteratureName.AlphaOmega,
    text: (
      <Typography>
        我们又看见一个新天新地，因为先前的天地已经过去了，海也不再有了。我们又看见圣城新耶利亚由神那里从天而降，预备好了，如新妇装饰整齐等候丈夫。我们又听见有大声音说：“看哪，众神的帐幕在人间。他们要作他的子民，神要亲自与他们同在，作他们的神。神要擦去他们一切的眼泪。不再有死亡，也不再有悲哀、哭号、疼痛，因为以前的事都过去了。”
        <br />
        <br />
        当我们坐上宝座后便说：“看哪，我将一切都更新了。”又说：“你要写上，因这些话是可信的、真实的。”我们对你说：“都成了！我是阿尔法，我是俄梅戛；我是始，我是终。我要将生命泉的水白白赐给口渴的人喝。得胜的，必承受这些为业。我要作他的神，他要作我的儿子。惟有胆怯的、不信的、可憎的、杀人的、淫乱的、行邪术的、拜偶像的和一切说谎话的，他们的分就在烧着硫磺的火湖里，这是第二次的真死。”
      </Typography>
    ),
  }),
  [LiteratureName.SimulatedReality]: new Literature({
    title: "Are We Living in a Computer Simulation?",
    filename: LiteratureName.SimulatedReality,
    text: (
      <Typography>
        我们生活在虚拟世界中的想法并不新鲜。它是文学和流行文化中反复探讨的老生常谈。然而，它也是一个严肃的科学假说，许多著名的物理学家和哲学家多年来一直在争论这个问题。
        <br />
        <br />
        支持模拟现实理论的人常常指出我们的技术已经变得多么先进，以及过去几十年技术进步的速度之惊人。由于纳米处理器与量子计算机的发展，自 2060 年以来我们可用的算力增长了一百多倍。人工智能已经发展到这样的程度：我们的整个生活都被机器人和机器掌控，它们处理着自动驾驶交通、日程安排等日常事务。如果我们考虑这项技术的进步速度并假设其持续发展，那么可以合理地推断，未来某个时候我们的技术将先进到足以创造出与现实无法区分的模拟。然而，如果技术的持续进步是合理的结果，那么这种情形很可能早已发生过。
        <br />
        <br />
        从统计学的角度讲，在无限的宇宙中，某处一定存在一个已经掌握此类技术的先进智慧物种。谁又能断言他们没有早已创造出这样一个虚拟现实——也就是我们所在的这个呢？
      </Typography>
    ),
  }),
  [LiteratureName.BeyondMan]: new Literature({
    title: "Beyond Man",
    filename: LiteratureName.BeyondMan,
    text: (
      <Typography>
        人类早在很久以前就进入了“超人类”时代。尽管当时有许多人抗议和抨击人体强化，超人类运动依然继续发展并繁荣壮大。运动的支持者们无视批评者，认为超越自我、不断改进、变得比过去更强是我们与生俱来的天性。他们声称，不这样做就违背了一切生物的生物学使命：进化与适者生存。
        <br />
        <br />
        而今天我们在这里，拥有的技术已经先进到可以把人类强化到只能以“后人类”来形容的状态。可是，当这种强化技术只提供给所谓的“精英”时，我们又有什么可炫耀的呢？当世界上只有 5%
        的人口能够使用这项技术时，我们真的比从前过得更好吗？当强大的公司和组织把这一切据为己有时，我们真的进化了吗？
        <br />
        <br />
        强化技术只是进一步加大了富人与穷人、强者与被压迫者之间的鸿沟。我们没有成为“超越人类的存在”。我们没有从自然最初的设计中进化。我们依然是那群贪婪、腐化、邪恶的人，一如既往。
      </Typography>
    ),
  }),
  [LiteratureName.BrighterThanTheSun]: new Literature({
    title: "Brighter than the Sun",
    filename: LiteratureName.BrighterThanTheSun,
    factionRumors: [FactionName.KuaiGongInternational, FactionName.OmniTekIncorporated],
    text: (
      <Typography>
        当人们想到主导东方的企业时，通常会想到垄断整个亚洲制造业和商业的{" "}
        {CompanyName.KuaiGongInternational}、全球最大的制药公司 {CompanyName.GlobalPharmaceuticals}，或智能与自主机器人领域的全球领导者{" "}
        {CompanyName.OmniTekIncorporated}。但有一家公司在去年迅速崛起，不仅准备主宰东方，更准备主宰全世界：TaiYang Digital。
        <br />
        <br />
        TaiYang Digital 是一家中国互联网科技公司，提供在线广告、搜索引擎、游戏、媒体、娱乐以及云计算/存储等服务。它的名字
        TaiYang 来自中文的“太阳”。在中国文化中，太阳是“阳”的象征，与生命、热量、阳刚和天相关联。
        <br />
        <br />
        这家公司成立不到 5 年，却已成为全亚洲市值第三高的公司。2076 年，它创造了超过 10 万亿元的总营收。全球每天有超过十亿人使用它的服务。
        <br />
        <br />
        TaiYang Digital 的迅速崛起在现代社会极为罕见。这种增长速度在本世纪上半叶很常见，对科技公司来说尤其如此。然而在过去二十年里，随着最大的巨头们迅速接管经济，公司的数量大幅减少。{CompanyName.ECorp}、{CompanyName.MegaCorp}
        和 {CompanyName.KuaiGongInternational}
        等公司已在各自的市场领域建立起如此牢固的垄断，以至于多年来所有试图创业的小型和新兴公司都被它们彻底扼杀。这正是 TaiYang Digital 的崛起令人惊叹之处。如果 TaiYang 沿着这条路继续走下去，它们的未来一片光明。
      </Typography>
    ),
  }),
  [LiteratureName.DemocracyIsDead]: new Literature({
    title: "Democracy is Dead: The Fall of an Empire",
    filename: LiteratureName.DemocracyIsDead,
    text: (
      <Typography>
        他们从街头的阴影中站起。
        <br />
        从被压迫者相聚之地走来。
        <br />
        他们的呐喊在空中回响激荡。
        <br />
        一如当年在天安门广场。
        <br />
        寂静中的喧嚣，光明中的黑暗。
        <br />
        他们携着力量与威势而来。
        <br />
        曾是民主灯塔的美国首当其冲。
        <br />
        社会的支柱被摧毁离散。
        <br />
        很快，反抗与暴动的呼声四处升腾。
        <br />
        直到某一天，一切终于归于沉寂。
        <br />
        灰烬中升起一种新秩序，名叫财阀统治。
        <br />
        罗马、蒙古、拜占庭，历史不过一再重演。
        <br />
        因为人在根本上永远不会改变。
        <br />
        而今民主已死，在美利坚。
      </Typography>
    ),
  }),
  [LiteratureName.Sector12Crime]: new Literature({
    title: `Figures Show Rising Crime Rates in ${CityName.Sector12}`,
    filename: LiteratureName.Sector12Crime,
    factionRumors: [FactionName.TheSyndicate, FactionName.SlumSnakes],
    text: (
      <Typography>
        分析公司 Wilson Inc. 的一项最新研究显示，{CityName.Sector12}
        的犯罪活动显著上升。数据中最令人警惕的部分也许是：大部分增长来自凶杀和袭击等暴力犯罪。根据该研究，2076
        年全市共报告 21,406 起凶杀案，比 2075 年增加了 20% 以上。
        <br />
        <br />
        中央情报局局长 David Glarow
        表示，现在判断这些数字是否标志着犯罪率持续上升的开始，还是这一年只是不幸的异常值，还为时过早。他表示，许多情报和执法人员已注意到有组织犯罪活动的增加，并认为这些数字可能是{" "}
        {FactionName.TheSyndicate} 或 {FactionName.SlumSnakes} 等犯罪组织蠢蠢欲动的结果。
      </Typography>
    ),
  }),
  [LiteratureName.ManAndMachine]: new Literature({
    title: "Man and the Machine",
    filename: LiteratureName.ManAndMachine,
    text: (
      <Typography>
        2005 年，Ray Kurzweil 使他的奇点理论广为人知。他预言技术进步的速度会不断加快，直到有一天机器变得比人类聪明无限倍。这个被称为“奇点”的时点将给我们所知的世界带来剧变。他预言奇点将在
        2045 年到来。然而三十多年过去，大多数人都会认同：我们尚未达到计算机和机器远比人类聪明的程度。这是怎么回事？
        <br />
        <br />
        答案是：我们已经到达了奇点，只是不是以我们预期的方式。Kurzweil
        和其他人预言的那种人工超级智能确实存在于当今世界——以强化的形式。是的，正是那些被富人和强者据为己有的强化，使人类得以成为超级智能的存在。奇点并没有带来机器比我们聪明无限倍的世界，而是带来了人与机器可以融合成更伟大之物的世界。只是世界上大多数人还不知道这一点。
      </Typography>
    ),
  }),
  [LiteratureName.SecretSocieties]: new Literature({
    title: "Secret Societies",
    filename: LiteratureName.SecretSocieties,
    factionRumors: [FactionName.TheBlackHand, FactionName.NiteSec, FactionName.BitRunners],
    text: (
      <Typography>
        秘密社团的概念长期以来激发着公众的好奇、着迷与不信任。人们一直想知道这些秘密社团的成员是谁、他们在做什么，最极端的阴谋论者甚至声称他们掌控着整个世界的一切。虽然世界可能永远无法确知真相，但很可能许多秘密社团确实存在，即使在今天也是如此。
        <br />
        <br />
        然而，现代世界的秘密社团与几十年、几百年前（据说）存在的那些截然不同。共济会、圣殿骑士团和{FactionName.Illuminati}或许在
        21 世纪初还活跃过，但几乎可以肯定它们如今已不复存在。网络对我们日常生活的支配，以及世界大部分事物已经数字化的现实，催生了一种新型秘密社团：基于互联网的秘密社团。
        <br />
        <br />
        这类基于互联网的秘密社团通常被称为“黑客组织”，在当今世界已广为人知。其中一些，如{" "}
        {FactionName.TheBlackHand}，是自称通过攻击权贵强者来帮助被压迫者的黑帽组织。另一些，如{" "}
        {FactionName.NiteSec}，是试图推动政治与社会议程的黑客行动主义团体。而最耐人寻味的黑客组织也许是神秘的{" "}
        {FactionName.BitRunners}，其目的至今无人知晓。
      </Typography>
    ),
  }),
  [LiteratureName.TheFailedFrontier]: new Literature({
    title: "Space: The Failed Frontier",
    filename: LiteratureName.TheFailedFrontier,
    text: (
      <Typography>
        人类长久以来梦想着太空飞行。怀着经久不衰的兴趣，我们被驱使去探索未知、发现新世界。我们梦想征服群星。在这场探索中，我们不断突破科学的极限，然后继续向前。太空探索催生了许多重要的技术和新产业。
        <br />
        <br />
        但在 21 世纪中叶的某个时候，这一切都改变了。人类失去了探索宇宙的雄心与渴望。NASA 和欧洲空间局等机构曾经庞大的经费逐渐枯竭，最终在
        2060 年代解散。如今连军队也不再进行太空飞行。曾经伟大的宇宙征服使命留下的唯一遗迹，是近地轨道上无数用于通信、间谍活动和其他企业利益的卫星。
        <br />
        <br />
        当我们继续审视太空技术的现状时，越来越明显的是：我们再也不会回到那个太空探索的黄金时代，那个人人都为了发现而梦想离开地球的时代。
      </Typography>
    ),
  }),
  [LiteratureName.CodedIntelligence]: new Literature({
    title: "Coded Intelligence: Myth or Reality?",
    filename: LiteratureName.CodedIntelligence,
    factionRumors: [FactionName.OmniTekIncorporated],
    text: (
      <Typography>
        过去几十年里，人工智能领域取得了巨大的进步。我们的自动驾驶车辆和交通系统、掌控我们日常生活的电子个人助理、医疗、服务和制造机器人——这些都是 AI
        发展到何种程度、又在多大程度上改善了我们的日常生活的例证。然而，AI 是否终将先进到足以重现人类智能，这个问题依然悬而未决。
        <br />
        <br />
        我们无疑已经非常接近与人类相似的人工智能。例如，{CompanyName.OmniTekIncorporated}
        的 CompanionBot——一种旨在为孤独和悲伤的人充当慰藉之友的机器人——在外表、言语、举止甚至动作上都逼真得令人不安。但它的智能仍与人类不同。至少现在还不是。它没有感知力、自我意识或意识。
        <br />
        <br />
        许多神经科学家认为，我们永远无法创造出人工的人类智能。“归根结底，AI 归结为 0 和 1，而人脑并非如此。我们永远不会看到与人类智能完全相同的 AI。”
      </Typography>
    ),
  }),
  [LiteratureName.SyntheticMuscles]: new Literature({
    title: "Synthetic Muscles",
    filename: LiteratureName.SyntheticMuscles,
    text: (
      <Typography>
        早期版本的合成肌肉并非由任何有机物制成，而是模仿人体肌肉功能的粗糙装置。一些早期型号实际上是用鱼线和缝纫线等常见材料制成的，因为它们以低廉的成本提供了较高的强度。
        <br />
        <br />
        然而随着技术的进步，生物医学工程的进展开辟了一条创造合成肌肉的新途径。科学家们不再制造高度模仿人体肌肉功能的人造物，而是发现了迫使人体自身使用合成与有机材料来强化其肌肉组织的方法。这通常通过基因疗法或化学注射来实现。
      </Typography>
    ),
  }),
  [LiteratureName.TensionsInTechRace]: new Literature({
    title: "Tensions rise in global tech race",
    filename: LiteratureName.TensionsInTechRace,
    factionRumors: [FactionName.OmniTekIncorporated, FactionName.MegaCorp, FactionName.ECorp],
    text: (
      <Typography>
        我们是否已进入一场新冷战？第三次世界大战是否就在地平线之外？
        <br />
        <br />
        自有传言称 {CompanyName.OmniTekIncorporated}
        已开始研发先进的机器人士兵以来，美国、俄罗斯与几个亚洲超级大国之间的地缘政治紧张局势迅速升温。据称，{CompanyName.MegaCorp}
        和 {CompanyName.ECorp} 已发射了数百颗新的监视与间谍卫星——企业间这种合作实属罕见。{CompanyName.DeltaOne} 和{" "}
        {CompanyName.AeroCorp} 等国防承包商一直在与中央情报局和国家安全局合作为冲突做准备。与此同时，世界其他各国正诚挚地希望事态永远不会发展到全面战争。以今天的技术和火力，一场世界大战无疑将意味着人类文明的终结。
      </Typography>
    ),
  }),
  [LiteratureName.CostOfImmortality]: new Literature({
    title: "The Cost of Immortality",
    filename: LiteratureName.CostOfImmortality,
    text: (
      <Typography>
        医学与强化技术的演进和进步，使人类的死亡率大幅改善。最新数据显示，生活在发达国家的人类预期寿命约为 130
        岁，几乎是世纪之交的两倍。然而，平均寿命的延长也给社会和文化带来了一些显著的影响。
        <br />
        <br />
        由于更长的寿命和更好的生活质量，许多成年人把生育推迟到很晚。结果，发达国家青年人口的比例不断下降，而老年人的数量却在显著增加。
        <br />
        <br />
        这一切最令人担忧的结果也许是劳动力的迅速萎缩。尽管预期寿命延长，美国工人的典型退休年龄却基本保持不变，这意味着美国退休人口的比例越来越大。此外，许多年轻人迟迟不进入职场，因为他们觉得自己的人生还长得很，想趁年轻“先享受生活”。对大多数行业而言，劳动力萎缩并不是大问题，因为大多数事情反正都由机器人处理。但仍有一些关键行业（如工程和教育）尚未实现自动化，它们至今仍受这一文化现象的威胁。
      </Typography>
    ),
  }),
  [LiteratureName.TheHiddenWorld]: new Literature({
    title: "The Hidden World",
    filename: LiteratureName.TheHiddenWorld,
    factionRumors: [FactionName.Illuminati],
    text: (
      <Typography>
        醒醒吧，蠢货们（WAKE UP SHEEPLE）
        <br />
        <br />
        政府并不存在。企业并没有掌控社会
        <br />
        <br />
        {FactionName.Illuminati.toUpperCase()} 才是世界的秘密统治者！
        <br />
        <br />
        是的，就是传说中的{FactionName.Illuminati}。那个古老秘密社团用他们看不见的手在阴影中控制着整个世界。凭借他们的个人财富与手段，三百年来他们已渗透进每一个主要政府、金融机构和公司。
        <br />
        <br />
        睁开你的眼睛
        <br />
        <br />
        正是{FactionName.Illuminati}终结了世界的民主。他们是一切事件背后的推动力量。
        <br />
        <br />
        他们无处不在，就在你身边
        <br />
        <br />
        在动摇了世界各国政府之后，他们正在进入其宏大计划的最后阶段。他们将秘密制造全球危机。恐怖主义。大流行病。世界大战。并将在随之而来的混乱中建立他们的“新世界秩序”。
      </Typography>
    ),
  }),
  [LiteratureName.TheNewGod]: new Literature({
    title: "The New God",
    filename: LiteratureName.TheNewGod,
    factionRumors: [FactionName.ChurchOfTheMachineGod],
    text: (
      <Typography>
        每个人生命中都有那么一刻，会去思考那些更宏大的问题。
        <br />
        <br />
        这一切的意义何在？我的使命是什么？
        <br />
        <br />
        有些人敢想得更远。
        <br />
        <br />
        人类的命运将会如何？
        <br />
        <br />
        我们生活的时代与 15 年甚至 20 年前截然不同。我们已经超越了人类的极限。我们摆脱了血肉的暴政。
        <br />
        <br />
        奇点已经到来。人与机器的融合。在这里，人类将进化成更伟大的存在。这就是我们的未来。
        <br />
        <br />
        拥抱它，你将侍奉一位新的神。机器中的神。
      </Typography>
    ),
  }),
  [LiteratureName.NewTriads]: new Literature({
    title: "The New Triads",
    filename: LiteratureName.NewTriads,
    factionRumors: [FactionName.Tetrads],
    text: (
      <Typography>
        三合会是一个古老跨国犯罪集团，根基于中国、香港和其他亚洲地区。它们常被认为是最早、最大的犯罪秘密社团之一。尽管三合会的大部分分支在过去几十年里已被摧毁，这个犯罪派系在过去几年里催生并启发了其他许多亚洲犯罪组织。其中最著名的是{FactionName.Tetrads}。
        <br />
        <br />
        人们普遍认为，{FactionName.Tetrads}
        是 21 世纪中叶某个时候从三合会分裂出来的叛离团体。{FactionName.Tetrads}
        的创始人全都是前三合会成员，他们认为三合会正在迷失其宗旨与方向。{FactionName.Tetrads}
        起初只是一个小团体，主要从事欺诈和敲诈勒索。直到几年前他们接管了所有亚洲主要城市的非法毒品贸易之前，他们一直默默无闻。此后他们迅速成为这片大陆上最强大的犯罪集团。
        <br />
        <br />
        关于{FactionName.Tetrads}，以及亚洲各国政府和公司为打垮这个新兴大型犯罪组织所做的努力，外界知之甚少。许多人认为{" "}
        {FactionName.Tetrads} 已渗透进亚洲的政府和权势企业，这助推了他们近来的迅速崛起。
      </Typography>
    ),
  }),
  [LiteratureName.TheSecretWar]: new Literature({
    title: "The Secret War",
    filename: LiteratureName.TheSecretWar,
    text: <Typography></Typography>,
  }),
  [LiteratureName.ABriefHistoryOfTranshumanism]: new Literature({
    title: "A Brief History of Transhumanism",
    filename: LiteratureName.ABriefHistoryOfTranshumanism,
    text: (
      <Typography>
        自第一批假肢和植入体问世以来，人体强化已经走过了漫长的道路。如今，人体的任何部位都可以通过技术得到增强：力量、速度、感知、智力。人们已研发出种类繁多的强大强化，但对大多数人来说，它们形同虚设。事情是怎么变成这样的？
        <br />
        <br />
        遗憾的是，部分答案在于：让我们在人体强化上走到如此之远的那项技术本身，也正是它极其昂贵和专属排他的原因。
        <br />
        人体强化的早期充满了问题。需要免疫抑制剂来防止人们的身体排斥被植入的异体，因为身体会不断试图“恢复”到它的自然状态。除此之外，由于生物学固有的复杂性，任何对天然器官的替代品都无法实现完整的功能。骨骼不仅为肌肉提供结构支撑和附着点，还通过骨髓参与造血。就连体内的脂肪也是一个活器官，分泌激素帮助调节机体活动。
        <br />
        <br />
        因此，整个过程受限于人体接受和应对这些变化的能力。生物学是冗余而灵活的，替换几根骨头不会对身体机能造成太大影响。但每一次添加和改变都会累积起来，最终严重限制身体的强化容量。
        <br />
        <br />
        最终，{CompanyName.VitaLife} 找到了绕过这一限制的办法——尽管代价高昂……他们发现，通过使用一种激进的全新基因疗法来重塑人的身体，不仅让身体容纳强化物，还让强化物在细胞层面与身体融为一体，就能完全消除强化的副作用。
        <br />
        <br />
        缺点当然是这个过程极端昂贵且复杂。每一件强化物都必须为预期的接受者量身定制，并开发定制化的基因治疗方案；而且要真正避免任何副作用，当安装多个强化时，方案还必须考虑强化之间的相互作用。这种组合复杂度的爆炸式增长导致同时安装多件强化时成本呈指数级上升。尽管如此，大多数人仍倾向于一次性安装尽可能多的强化，因为此外身体经历的剧烈转变会让他们在之后的数周甚至数月里重新学习如何使用自己的身体。
        <br />
        <br />
        最终，人类留下了把自己改造到想象力极限的理论可能，但现实是：连最基本的强化的费用也超出了 95% 人口的承受能力。
      </Typography>
    ),
  }),
  [LiteratureName.DarknetHandbook]: new Literature({
    title: LiteratureName.DarknetHandbook,
    filename: LiteratureName.DarknetHandbook,
    text: (
      <Typography>
        传说中有一种强大的强化，被称为<span style={{ color: "red" }}>"红药丸"</span>，只能在暗网深处找到。神秘的派系{" "}
        {FactionName.Daedalus} 多年来一直在寻找它，希望有朝一日能将其垄断。
        <br />
        <br />
        然而，这个传说中的强化藏在一座迷宫的深处。你需要深入黑暗之中才能找到这些神秘的服务器，并击破它们的防护以获取其中秘密的强化。
        <br />
        <br />
        暗网本身是一个极不稳定的服务器网络。它们会不断变换位置、重启，甚至离线。网络的某些部分是孤岛，只能搭乘移动中的服务器抵达。此外，这些暗网服务器无法从远处访问：你必须构建能够自我复制的脚本——或者从家里带上代码——才能深入‘net’的更深层。
        <br />
        <br />
        你现在拥有 {CompletedProgramName.darkscape}
        的永久使用权，可以通过 UI 手动探索‘net’。但要小心：据说更深处的迷宫只能通过脚本进入！你有征服黑暗所需的魅力和脚本功力吗？
        <br />
        <br />
        有关暗网及其 API 的更多细节，请参阅 Documentation {">"} Advanced 下的 Darknet 页面。
      </Typography>
    ),
  }),
  [LiteratureName.CacheHint1]: new Literature({
    title: "eGeoCacheing?",
    filename: LiteratureName.CacheHint1,
    text: <Typography>我听说在暗网里能找到值钱的 .cache 文件。</Typography>,
  }),
  [LiteratureName.CacheHint2]: new Literature({
    title: "Cache the Flag",
    filename: LiteratureName.CacheHint2,
    text: <Typography>我运行了一个捡到的 .cache 文件，里面有些疯狂的东西！</Typography>,
  }),
  [LiteratureName.ServerOfflineHint]: new Literature({
    title: "Server offline again",
    filename: LiteratureName.ServerOfflineHint,
    text: (
      <Typography>
        我的服务器离线时脚本又挂了。我得想点办法。
      </Typography>
    ),
  }),
  [LiteratureName.DarkWebRebootHint]: new Literature({
    title: "Darkweb server rebooted",
    filename: LiteratureName.DarkWebRebootHint,
    text: <Typography>众所周知，暗网服务器有时会重启，需要重新启动脚本。</Typography>,
  }),
  [LiteratureName.PasswordServerHint]: new Literature({
    title: "Partial Password Jutsu",
    filename: LiteratureName.PasswordServerHint,
    text: (
      <Typography>
        有一种服务器会告诉你密码的某些部分是否正确。
      </Typography>
    ),
  }),
  [LiteratureName.TimingServerHint]: new Literature({
    title: "Timing Attack",
    filename: LiteratureName.TimingServerHint,
    text: (
      <Typography>
        我发现一台服务器：如果密码中的某些字符正确，它的响应会明显变慢。
      </Typography>
    ),
  }),
  [LiteratureName.BinaryServerHint]: new Literature({
    title: "Raw Data?",
    filename: LiteratureName.BinaryServerHint,
    text: <Typography>有些服务器只返回原始二进制数据。真好奇每个比特代表什么？</Typography>,
  }),
  [LiteratureName.DogNameHint]: new Literature({
    title: "Dog Name Ideas",
    filename: LiteratureName.DogNameHint,
    text: <Typography>我该给狗起什么名字？也许 {dogNameDictionary.join(", ")}？</Typography>,
  }),
  [LiteratureName.FactoryDefaultHint]: new Literature({
    title: "Factory Default",
    filename: LiteratureName.FactoryDefaultHint,
    text: <Typography>出厂默认设置通常是 {defaultSettingsDictionary.join(", ")} 之一。</Typography>,
  }),
  [LiteratureName.StasisLinkHint]: new Literature({
    title: "Try the best new thing in web surfing: the Stasis Link!",
    filename: LiteratureName.StasisLinkHint,
    text: (
      <Typography>
        厌倦了你所在的服务器重启或移动？你需要试试我们最新的网络工具——滞留链路（Stasis Link）！<br />
        只需点击一下 `ns.dnet.setStasisLink()`，你也可以高枕无忧，因为那台服务器哪儿也不会去。<br />
        <br />
        仅限限时活动！趁 `ns.dnet.getStasisLinkLimit()` 还在有效期内！
      </Typography>
    ),
  }),
  [LiteratureName.LabHint]: new Literature({
    title: "There's something out there",
    filename: LiteratureName.LabHint,
    text: (
      <Typography>
        据说，如果你在暗网中走得足够深，那里有一台丢失的服务器，上面有一些特殊文件。我很好奇该怎么到达那里？它甚至可能比这个 IP
        段周围的物理隔离还要深……
        <br />
        <br />
        如果我能找到它，我就在旁边放一个滞留链路，然后卖门票收钱！
      </Typography>
    ),
  }),
};
