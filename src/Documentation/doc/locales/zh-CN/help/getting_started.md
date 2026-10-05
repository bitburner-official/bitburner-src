# 程序员初学者入门指南

_注意_：本指南中的[脚本](../basic/scripts.md)和策略并不一定是最佳或全面的。
本指南旨在帮助编程知识较少的用户在游戏初期体验 Bitburner。

如果你对游戏，尤其是编程和脚本方面感到困惑或无从下手，那么这份指南非常适合你！

## 简介

Bitburner 是一款以赛博朋克为主题的增量 RPG。
你可以通过提高[属性](../basic/stats.md)、赚钱以及提高你在现实中的编程能力来推进游戏进度。
在达到某些条件后，你将收到来自游戏中某些[派系](../basic/factions.md)的邀请
加入[派系](../basic/factions.md)并为其工作将会解锁各种[增强](../basic/augmentations.md)
购买并“安装”后，它们会为[属性](../basic/stats.md)和其他能力提供持久的加成。与派系合作并安装增强是在 Bitburner 中取得进步的基本步骤。

游戏有一个开放且简洁的故事线，你可以通过多种方式来实现目标。
由于本指南是作为 Bitburner 的基础介绍而编写的，因此不会包含游戏的所有可用内容和剧情。

## 开始

我假设你在刚开始游戏时按入门教程进行了操作。
在入门教程中，你创建了一个[脚本](../basic/scripts.md)调用 `n00dles.js` 并在服务器 `n00dles` 上运行它。
现在，我们将终止此[脚本](../basic/scripts.md)。有两种方法可以做到这一点：

- 前往终端并输入：`kill n00dles.js`
- 前往 `活动的脚本 \ Active Scripts` 页面 (快捷键 Alt + s) 并点击 `n00dles.js` 的 `终止` 按钮。

如果你跳过了入门教程，那么就无需理会上述内容。
相反，前往 `黑客网 \ Hacknet Nodes` 页面 (快捷键 Alt + h) 并购买[黑客网节点](../basic/hacknet_nodes.md)来获取一些挂机收益。

## 创建你的第一个脚本

接下来，我们将会创建一个可以在游戏的早期使用的通用[黑客](../basic/hacking.md)[脚本](../basic/scripts.md)(如果你愿意，也可以一直用下去)。

在我们写[脚本](../basic/scripts.md)前，要先熟悉以下这些内容：

- `黑客攻击`
- `安全`
- `hack`
- `grow`
- `weaken`
- `brutessh`
- `nuke`

简单的说： 每个[服务器](../basic/servers.md)都有一个安全等级，它影响黑客入侵的难度。
每个[服务器](../basic/servers.md)也有一定的资金，以及可容纳的最大资金。
[骇入](../basic/hacking.md)一个[服务器](../basic/servers.md)窃取该[服务器](../basic/servers.md)一定比例的资金。
`hack()` 函数用于黑进一个[服务器](../basic/servers.md)。
`grow()` 函数用于增加[服务器](../basic/servers.md)的可用资金。
`weaken()` 函数用于降低[服务器](../basic/servers.md)的安全等级。

现在，让我们开始动手创建一个[脚本](../basic/scripts.md)。
通过前往[终端](../basic/terminal.md)并输入以下两个命令，转到你的主机并创建一个名为 `early-hack-template.js` 的[脚本](../basic/scripts.md)：

    $ home
    $ nano early-hack-template.js

这将带你前往[脚本](../basic/scripts.md)编辑器，你可以用它编辑和创建[脚本](../basic/scripts.md)。

将以下代码输入[脚本](../basic/scripts.md)编辑器：

    /** @param {NS} ns */
    export async function main(ns) {
        // 定义“目标服务器”，即我们要骇入的服务器。
        // 在本例中，它是 "n00dles"
        const target = "n00dles";

        // 定义我们在破解服务器之前服务器中应该有多少资金
        // 在本例中，它被设置为服务器可容纳的最大资金
        const moneyThresh = ns.getServerMaxMoney(target);

        // 定义目标服务器所能达到的最小安全等级，如果目标服务器的安全等级比这更高，
        // 我们将在对其做任何其他操作前 weaken 它
        const securityThresh = ns.getServerMinSecurityLevel(target);

        // 如果我们拥有 BruteSSH.exe 程序，那么就用它在目标服务器上开放SSH端口
        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(target);
        }

        // 获取目标服务器的root权限
        ns.nuke(target);

        // 开始对目标服务器连续 hack/grow/weaken 的无限循环
        while(true) {
            if (ns.getServerSecurityLevel(target) > securityThresh) {
                // 如果服务器的安全等级超过我们设定的阈，weaken 它
                await ns.weaken(target);
            } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
                // 如果目标服务器的资金低于我们设定的阈值，grow 它
                await ns.grow(target);
            } else {
                // 否则，hack 它
                await ns.hack(target);
            }
        }
    }

[脚本](../basic/scripts.md)上包含了描述其功能的注释，但无论如何，让我们一步一步地完成它。

    const target = "n00dles";

第一行代码定义了一个包含我们的目标[服务器](../basic/servers.md)的一个字符串。
那就是我们将要[骇入](../basic/hacking.md)的[服务器](../basic/servers.md)。
目前，它被设置为 `"n00dles"` .因为这是唯一的需要黑客等级为`1`的[服务器](../basic/servers.md)。
如果你需要[骇入](../basic/hacking.md)另一个[服务器](../basic/servers.md)，只需将此变量修改为另一个[服务器](../basic/servers.md)的主机名即可。

    const moneyThresh = ns.getServerMaxMoney(target);

第二行代码定义了一个数值，表示我们的[脚本](../basic/scripts.md)[骇入](../basic/hacking.md)目标[服务器](../basic/servers.md)时它所应具有的最低可用资金。
如果目标[服务器](../basic/servers.md)上的可用资金小于此值，那么我们的[脚本](../basic/scripts.md)将 `grow()` [服务器](../basic/servers.md)而不是[骇入](../basic/hacking.md)它。
它被设置为[服务器](../basic/servers.md)的最大可用资金。
可以用 `getServerMaxMoney()` 函数得到这个值

    const securityThresh = ns.getServerMinSecurityLevel(target);

第三行代码定义了一个数值，用以表示目标[服务器](../basic/servers.md)的最低安全等级。
如果目标[服务器](../basic/servers.md)的安全等级比这个值更高，那么我们的[脚本](../basic/scripts.md)将在做任何操作之前 `weaken()` 它

    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
    }

    ns.nuke(target);

这段代码用于获取目标[服务器](../basic/servers.md)的 root 权限。
这是[黑客攻击](../basic/hacking.md)的前提条件。

    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // 如果服务器的安全等级超过我们设定的阈值，weaken 它
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // 如果目标服务器的资金低于我们设定的阈值，grow 它
            await ns.grow(target);
        } else {
            // 否则，hack 它
            await ns.hack(target);
        }
    }

这是我们[脚本](../basic/scripts.md)的核心。
它决定了[脚本](../basic/scripts.md)的逻辑并执行[骇入](../basic/hacking.md)操作。
`while (true)` 会创建一个无限循环，持续进行[黑客攻击](../basic/hacking.md)直到这个[脚本](../basic/scripts.md)被终止。

`hack()` / `grow()` / `weaken()` 需要使用 await 关键字，因为它们与其他命令不同，需要一定的时间才能完成执行。
如果你忘记 await 这些命令，那就会产生一个异常来告知你试图同时做多件事。这是因为你的代码会立即完成函数调用，而不会等待操作完成。
同样重要的是，await 只能在标记为 `async` 的函数中使用(注意：`main()` 已被标记为 `async`)

## 运行我们的脚本

现在，我们要开始运行我们的[黑客攻击](../basic/hacking.md)[脚本](../basic/scripts.md)，这样它就能开始为我们赚钱和积累经验了。
我们的主机只有 8GB [内存](../basic/ram.md)，我们稍后会交给它一些别的任务。
所以，我们将利用其他机器上的[内存](../basic/ram.md)来完成这个工作。

前往 `终端 \ Terminal` 并输入以下命令：

    $ scan-analyze 2

这将显示网络上某些[服务器](../basic/servers.md)的详细信息。
**网络是随机的，因此每个人的输出都不同**。
以下是我制作它时显示的内容：

    [home ~]> scan-analyze 2
    ┕ home
      ┃   Root Access: YES, Required hacking skill: 1
      ┃   Number of open ports required to NUKE: 5
      ┃   RAM: 8.00GB
      ┣ n00dles
      ┃ ┃   Root Access: YES, Required hacking skill: 1
      ┃ ┃   Number of open ports required to NUKE: 0
      ┃ ┃   RAM: 4.00GB
      ┃ ┕ nectar-net
      ┃       Root Access: NO, Required hacking skill: 20
      ┃       Number of open ports required to NUKE: 0
      ┃       RAM: 16.00GB
      ┣ foodnstuff
      ┃ ┃   Root Access: NO, Required hacking skill: 1
      ┃ ┃   Number of open ports required to NUKE: 0
      ┃ ┃   RAM: 16.00GB
      ┃ ┕ zer0
      ┃       Root Access: NO, Required hacking skill: 75
      ┃       Number of open ports required to NUKE: 1
      ┃       RAM: 32.00GB
      ┣ sigma-cosmetics
      ┃ ┃   Root Access: NO, Required hacking skill: 5
      ┃ ┃   Number of open ports required to NUKE: 0
      ┃ ┃   RAM: 16.00GB
      ┃ ┕ max-hardware
      ┃       Root Access: NO, Required hacking skill: 80
      ┃       Number of open ports required to NUKE: 1
      ┃       RAM: 32.00GB
      ┣ joesguns
      ┃     Root Access: NO, Required hacking skill: 10
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┣ hong-fang-tea
      ┃     Root Access: NO, Required hacking skill: 30
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┣ harakiri-sushi
      ┃     Root Access: NO, Required hacking skill: 40
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┕ iron-gym
        ┃   Root Access: NO, Required hacking skill: 100
        ┃   Number of open ports required to NUKE: 1
        ┃   RAM: 32.00GB
        ┕ CSEC
              Root Access: NO, Required hacking skill: 55
              Number of open ports required to NUKE: 1
              RAM: 8.00GB

记下这些服务器：

- `sigma-cosmetics`
- `joesguns`
- `nectar-net`
- `hong-fang-tea`
- `harakiri-sushi`

上述所有服务器都拥有 16GB[内存](../basic/ram.md)。
此外，它们都不需要任何开放端口即可进行 NUKE。
换句话说，我们可以获得这些服务器的 root 权限，然后在它们上面运行[脚本](../basic/scripts.md)。

首先，让我们确定可以运行多少个线程的[黑客攻击](../basic/hacking.md)[脚本](../basic/scripts.md)。
(有关多线程的更多信息，请参阅[脚本](../basic/scripts.md)页面)

我们写的这个[脚本](../basic/scripts.md)需要使用 2.6GB 的[内存](../basic/ram.md)。
你可以通过下面的 `终端 \ Terminal` 命令来查看：

    $ mem early-hack-template.js

这意味着我们可以在 16GB 服务器上运行 6 个线程。
现在，要在这些服务器上运行我们的[脚本](../basic/scripts.md)，我们需要执行以下步骤：

1. 使用 `scp` 命令拷贝我们的[脚本](../basic/scripts.md)到每一个服务器。
2. 使用 `connect` 命令连接到一个服务器。
3. 使用 `run` 命令运行 `NUKE.exe` 程序来获得 root 权限。
4. 再次使用 `run` 命令运行我们的[脚本](../basic/scripts.md)。
5. 对每一个服务器重复 2-4 步。

这是我完成这些步骤时使用的 `终端 \ Terminal` 命令序列：

    $ home
    $ scp early-hack-template.js n00dles
    $ scp early-hack-template.js sigma-cosmetics
    $ scp early-hack-template.js joesguns
    $ scp early-hack-template.js nectar-net
    $ scp early-hack-template.js hong-fang-tea
    $ scp early-hack-template.js harakiri-sushi
    $ connect n00dles
    $ run NUKE.exe
    $ run early-hack-template.js -t 1
    $ home
    $ connect sigma-cosmetics
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect joesguns
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect hong-fang-tea
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect harakiri-sushi
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect hong-fang-tea
    $ connect nectar-net
    $ run NUKE.exe
    $ run early-hack-template.js -t 6

在终端命令未完成时按下 `Tab` 键，将尝试自动补全命令。
举个例子，如果你输入 `scp ea` 并按 `Tab` 键，其余的[脚本](../basic/scripts.md)名称应该自动填写。
这对于游戏中的大多数命令都有效！

`home` 命令用于连接到主机。当使用 `run early-hack-template.js -t 6` 命令运行我们的[脚本](../basic/scripts.md)时，`-t 6` 指定[脚本](../basic/scripts.md)应使用 6 个线程。

请注意：`nectar-net` [服务器](../basic/servers.md)不在主机的当前的网络中。
这意味着你不能直接从主机连接到它，而是要先在网络中搜索它的位置。
我们之前运行的 `scan-analyze 2` 命令的输出将显示它在哪里。
在我的这个例子中，我可以通过 `hong-fang-tea` -> `nectar-net` 来连接到它。
然而，这对你来说可能不同。

在你运行所有这些 `终端 / Terminal` 命令之后，我们的[脚本](../basic/scripts.md)现在已经启动并运行。
随着时间的流逝，它们将会赚取金钱和黑客经验。
现在，这些收益产出的很慢，但随着你的黑客技能提高和运行更多的[脚本](../basic/scripts.md)，收益也会随之增加。

## 提高黑客等级

有许多[服务器](../basic/servers.md)可以被攻击，但它们需要更高的黑客等级。
因此，我们应该提高我们的黑客等级。
这不仅能让我们黑进更多的[服务器](../basic/servers.md)，还能提高我们对 `n00dles` 的[黑客攻击](../basic/hacking.md)效率。

提高黑客等级的最简单方法是前往 Rothman 大学。
你可以通过左侧导航菜单中的 `城市 / City` 选项卡(快捷键 Alt + w)进行访问。
Rothman 大学应该是右下角附近的 "U"。
点击 "U" 即可前往该地点。

进入 Rothman 大学后，你会看到一个包含多个选项的列表。
这些选项描述了你可以选择的不同课程。
你应该点击第一个按钮，上面写着：`学习计算机科学(免费) / Study Computer Science (free)`。

点击按钮后，你将开始学习并获得黑客经验。
在此期间，你不能与游戏的任何其他部分互动，直到你点击 `停止学习课程 / Stop taking course` 或 `同时做其他事情 / Do something else simultaneously`。

现在，我们希望黑客等级达到 10 级，这大概需要 174 黑客经验。
你可以进入左侧导航菜单中的 `统计 / Stats` 选项卡(快捷键 Alt + c)，查看自己有多少黑客经验。
由于在罗斯曼大学学习每秒可获得 1 经验，因此这需要 174 秒，即大约 3 分钟。
在此期间，你可以去做些别的事情！

## 编辑我们的黑客脚本

现在我们的黑客等级已经达到 10 级，可以黑进 `joesguns` [服务器](../basic/servers.md)。
这个[服务器](../basic/servers.md)的收益比 `n00dles` 更高。
因此，我们想要让我们的[黑客攻击](../basic/hacking.md)[脚本](../basic/scripts.md)以 `joesguns` 为目标。

前往 `终端 / Terminal` 并通过输入下述命令来编辑[黑客攻击](../basic/hacking.md)[脚本](../basic/scripts.md)：

    $ home
    $ nano early-hack-template.js

在[脚本](../basic/scripts.md)的第一行，将 `target` 变量的值修改为 `"joesguns"`：

    const target = "joesguns";

请注意，这**不会**影响已经运行的[脚本](../basic/scripts.md)实例。
这只会影响从现在起运行的新[脚本](../basic/scripts.md)实例。

## 创建一个新的脚本来购买新的服务器

接下来，我们将创建一个[脚本](../basic/scripts.md)，自动购买额外的[服务器](../basic/servers.md)。
这些[服务器](../basic/servers.md)将用于运行许多[脚本](../basic/scripts.md)。
刚开始运行这些[脚本](../basic/scripts.md)时会花很多钱，因为购买[服务器](../basic/servers.md)需要资金，但长远来看它将会给出更多的回报。

为了创建这个[脚本](../basic/scripts.md)，你应该熟悉以下函数：

- `purchaseServer()`
- `getPurchasedServerCost()`
- `getPurchasedServerLimit()`
- `getServerMoneyAvailable()`
- `scp()`
- `exec()`

通过前往 `终端 / Terminal` 并输入以下命令来创建这个[脚本](../basic/scripts.md)：

    $ home
    $ nano purchase-server-8gb.js

在[脚本](../basic/scripts.md)编辑器中粘贴以下代码：

    /** @param {NS} ns */
    export async function main(ns) {
        // 每个购买的服务器将具有的内存。在此例中，它是 8GB。
        const ram = 8;

        // 我们将使用此迭代器进行循环
        let i = 0;

        // 不断尝试购买服务器，直到达到最大值
        while (i < ns.getPurchasedServerLimit()) {
            // 检查我们是否拥有足够的资金来购买服务器
            if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
                //  如果我们拥有足够的资金，那么：
                //   1. 购买服务器
                //   2. 将我们的黑客脚本复制到刚刚购买的服务器上
                //   3. 在刚刚购买的服务器上使用 3 个线程运行我们的黑客脚本
                //   4. 将迭代器递增，以指示我们已经购买了一个新服务器
                let hostname = ns.purchaseServer("pserv-" + i, ram);
                ns.scp("early-hack-template.js", hostname);
                ns.exec("early-hack-template.js", hostname, 3);
                ++i;
            }
            // 让这个脚本等待一秒，然后再次循环。
            // 删除此行将导致无限循环，并导致游戏崩溃。
            await ns.sleep(1000);
        }
    }

这段代码通过一个 while 循环，使用 `purchaseServer()` 函数购买[服务器](../basic/servers.md)直到允许的最大值。
每个[服务器](../basic/servers.md)都将拥有 8GB [内存](../basic/ram.md)，正如 `ram` 变量所定义的那样。
请注意，[脚本](../basic/scripts.md)使用命令 `getServerMoneyAvailable("home")` 来获取你当前拥有的资金量。
然后用它来检查你是否有能力购买一台[服务器](../basic/servers.md)。

每当脚本购买一个新的[服务器](../basic/servers.md)时，它会使用 `scp()` 函数将我们的[脚本](../basic/scripts.md)复制到新的[服务器](../basic/servers.md)上，然后使用 `exec()` 函数在该[服务器](../basic/servers.md)上执行。

为了运行这个[脚本](../basic/scripts.md)，请前往 `终端 / Terminal` 并输入以下命令：

    $ run purchase-server-8gb.js

这个脚本将持续运行，直到你所购买的[服务器](../basic/servers.md)达到最大值。
那时，你已经拥有了许多新[服务器](../basic/servers.md)，它们都正在运行[黑客攻击](../basic/hacking.md)[脚本](../basic/scripts.md)，攻击 `joesguns` [服务器](../basic/servers.md)！

我们之所以使用这么多[脚本](../basic/scripts.md)来入侵 `joesguns` ，而不是瞄准其他[服务器](../basic/servers.md)，是因为这样做更高效。
在游戏的早期，我们没有足够的[内存](../basic/ram.md)来有效地入侵多个目标，同时因为我们的目标过于分散，效率会极其低下。
不过你以后肯定会这样做！

注意：一个[服务器](../basic/servers.md)的价格相当昂贵，而购买最大数量的[服务器](../basic/servers.md)需要消耗大量的资金。
在编写本指南时，上述 [脚本](../basic/scripts.md) 需要 \$11m 才能购买完所有 8GB [服务器](../basic/servers.md)。
因此，我们需要找到更多的赚钱方法来加快进程！
下一节将介绍这些方法。

## 额外的收入来源

除了[脚本](../basic/scripts.md)和[黑客攻击](../basic/hacking.md)之外，还有其他方法可以获得金钱。

## 黑客网节点

如果你完成了入门教程，就已经了解了这种方法：[黑客网节点](../basic/hacknet_nodes.md)。
一旦你有了足够的资金，就可以开始升级你的[黑客网节点](../basic/hacknet_nodes.md)，以增加你的挂机收益。
当然，这个操作是可选的。
由于每次[黑客网节点](../basic/hacknet_nodes.md)升级都需要一定的时间才能“还清”成本，因升级节点并不一定是性价比最高的选择。

尽管如此，[黑客网节点](../basic/hacknet_nodes.md)在游戏初期还是一个不错的收入来源，虽然它们的收益会随着游戏进度的推进而逐渐降低。
如果你最终购买并打算升级[黑客网节点](../basic/hacknet_nodes.md)，我建议暂时只升级它们的等级。
至于[内存](../basic/ram.md)和 CPU 升级，还是先放一放吧。

## 违法行为

[违法行为](../basic/crimes.md)是一个不错的收入来源。
因为它不仅能给你带来大量金钱，还能提高你的黑客等级。
要实施[违法行为](../basic/crimes.md)，先前往 `城市 / City` 标签(快捷键 Alt + w)。
然后点击 `贫民窟 / The Slums` 链接。

在贫民窟，你可以尝试犯下各种[罪行](../basic/crimes.md)，每种罪行成功后都会获得特定类型的经验和金钱。
详情请查看[违法行为](../basic/crimes.md)。

你在尝试犯罪时并不总是成功的。
如果[犯罪](../basic/crimes.md)失败，也不会有什么不好的事情发生，但你不会获得任何金钱，获得的经验也会减少。
提高你的属性可以提高你成功实施[违法行为](../basic/crimes.md)的几率。

现在,[违法行为](../basic/crimes.md) `Rob Store` 是一个性价比较高的选择。
这将要花费 60 秒钟的尝试时间，如果成功，可以获得 \$400k ，并且可以获得黑客经验(这在当前非常重要)。

或者，你也可以实施[违法行为](../basic/crimes.md) `Shoplift` 。
这需要 2 秒钟的尝试时间，如果成功，会得到 \$15k 。
这种[违法行为](../basic/crimes.md)比 `Rob Store` 稍微容易些，也会获得更多的钱，但不提供黑客经验。

## 为公司工作

如果你不想犯下[罪行](../basic/crimes.md)，还有另一种选择 ——— 为[公司](../basic/companies.md)工作。
这不会像[犯罪](../basic/crimes.md)那样有利可图，但可以提供[公司](../basic/companies.md)[声誉](../basic/reputation.md)。

转到左侧导航菜单中的 `城市 / City` 选项卡，然后前往 `Joe's Guns`。
在 `Joe's Guns` ，会有一个上面写着 `申请成为员工 / Apply to be an Employe` 的选项。
点击该选项获得工作。
然后，会出现一个写着 `工作 / Work` 的新选项。
点击该选项开始工作。
在 `Joe's Guns` 工作每秒可以赚取 \$110 ，而且还可以获得除黑客外的各种经验。

为[公司](../basic/companies.md)工作，就像为[犯罪](../basic/crimes.md)一样，是完全被动的。
你可以选择专注于工作，也可以同时做其他事情，或者在两者之间切换。
当你专注于工作时，你将无法在游戏中进行其他操作。
如果你同时做其他事情，你获得[声望](../basic/reputation.md)的速度将会降低。
你可以随时取消工作。

一旦你的黑客等级达到 75 级，你就可以前往城里的 `Carmichael Security` 找一份软件工作。
这份工作的薪水较高，还能为你赚取黑客经验。

在 `城市 / City` 选项卡中，还有更多公司提供更高的报酬和更多的游戏功能。
请自由探索！

## 在你购买新服务器之后

在你总共赚了 \$11m 之后，你的自动购买[服务器](../basic/servers.md)[脚本](../basic/scripts.md)应该运行完毕。
这将在你的主机上腾出一些 [内存](../basic/ram.md)来。
我们不想浪费这些[内存](../basic/ram.md)资源，所以要好好利用一下。
进入 `终端 / Terminal` ，输入以下命令：

    $ home
    $ run early-hack-template.js -t 3

## 黑客等级达到 50

当你的黑客等级达到 50 级，游戏的两个重要功能就会开放。

## 创建你的第一个程序：BruteSSH.exe

在左侧导航菜单中，你会发现 `创建程序 / Create Program` 选项卡(快捷键 Alt + p)上出现了一个红点。
这表示有新的程序可以编写。
进入该选项卡，你会看到当前所有可编写的程序列表，其下附有程序功能的简要说明。
只需点击程序即可开始编写。

现在，我们要编写的程序是 `BruteSSH.exe`。
这个程序用来打开[服务器](../basic/servers.md)上的 SSH 端口。
这将允许你入侵更多的[服务器](../basic/servers.md)，因为游戏中的许多[服务器](../basic/servers.md)都需要一定数量的开放端口才能让 `NUKE.exe` 获得 root 权限。

你可以随时暂停编写程序的工作，你的进度将被保存，再次开始编写将从保存的进度继续。
`BruteSSH.exe` 大约需要 10 分钟完成。

## 可选：创建 AutoLink.exe

在 `创建程序 / Create Program` 页面，你会发现你还可以编写一个名为 `AutoLink.exe` 的程序。
如果你不介意再等 10-15 分钟，那就去创建这个程序吧。
它可以减少连接其他[服务器](../basic/servers.md)的繁琐操作，但这并不是继续推进的必要条件。

## 加入你的第一个派系：CyberSec

在你达到黑客等级 50 级后不久，你应该会收到这样一条信息：

    收到未知发件人的信息：

    我们一直在关注你。你的能力令人印象深刻。但你在浪费你的才能。
    如果你加入我们，你可以将你的能力发挥到极致，改变世界。
    如果你加入我们，我们可以释放你的全部潜能。

    但首先，你必须通过我们的考验：找到我们的服务器并在其上安装后门。

    -CyberSec

     这条信息在你的主机上被保存为 csec-test.msg。

如果你没有收到消息，或者不小心关闭了它，不用担心。
信息会保存到你的主机中。
输入以下 `终端 / Terminal` 命令查看信息：

    $ home
    $ cat csec-test.msg

这条信息是游戏 "主线" 的一部分。
它是来自 `CyberSec` [派系](../basic/factions.md)的消息，要求你通过他们的考验。
通过他们的考验很简单，你只需找到他们的[服务器](../basic/servers.md)，入侵它，并通过 `终端 / Terminal` 安装后门。
他们的[服务器](../basic/servers.md)名为 `CSEC` 。
为此，我们将像之前那样使用 `scan-analyze` 命令：

    $ home
    $ scan-analyze 2

这将显示所有与你的主机最多相距 2 个“节点”的[服务器](../basic/servers.md)网络。
请记住，网络是随机生成的，因此每个人的情况都有所不同。
下面是我的 `scan-analyze` 的结果：

    ┕ home
      ┃   Root Access: YES, Required hacking skill: 1
      ┃   Number of open ports required to NUKE: 5
      ┃   RAM: 8.00GB
      ┣ harakiri-sushi
      ┃     Root Access: NO, Required hacking skill: 40
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┕ iron-gym
        ┃   Root Access: NO, Required hacking skill: 100
        ┃   Number of open ports required to NUKE: 1
        ┃   RAM: 32.00GB
        ┕ CSEC
                  Root Access: NO, Required hacking skill: 55
              Number of open ports required to NUKE: 1
              RAM: 8.00GB

这表示了我可以通过 `iron-gym` 到达 `CSEC` :

    $ connect iron-gym
    $ connect CSEC

如果你之前创建了 `AutoLink.exe` 程序，那么你可以更简单地连接到 `CSEC` 。
你会发现，在 `scan-analyze` 的结果中，所有[服务器](../basic/servers.md)主机名都以白色并带有下划线显示。
你只需点击任意一个[服务器](../basic/servers.md)主机名，就能直接连接到该服务器。
因此，只需点击 `CSEC` 即可连接到它！

注意 `CSEC` [服务器](../basic/servers.md)的所需黑客等级。
这是一个介于 51 和 60 之间的随机值。
虽然当你的黑客等级达到 50 时你就会收到来自 CSEC 的消息。但实际上，直到你的黑客等级达到足以在他们的[Server](../basic/servers.md)上安装后门之前，你无法通过他们的考验。

连接到 `CSEC` [服务器](../basic/servers.md)后，你就可以在其上安装后门。
请注意，该[服务器](../basic/servers.md)需要一个开放端口才能获得 root 权限。
我们可以使用之前创建的 `BruteSSH.exe` 程序打开 SSH 端口。
在 `终端 / Terminal` 中：

    $ run BruteSSH.exe
    $ run NUKE.exe
    $ backdoor

成功安装后门后，你很快就会收到来自 `CyberSec` 的[派系](../basic/factions.md)邀请。
接受它。
如果你不小心拒绝了邀请，也没关系。
只要进入 `派系 / Factions` 选项卡(快捷键 Alt + f)，你就会看到一个接受邀请的选项。

恭喜！
你刚刚加入了你的第一个[派系](../basic/factions.md)。
先别急着对[派系](../basic/factions.md)做任何事情，我们可以先把它放一放。

## 使用额外的服务器攻击 Joesguns

一旦你拥有了 `BruteSSH` 程序，你就可以获得其他几个[服务器](../basic/servers.md)的 root 权限。
这些[服务器](../basic/servers.md)拥有更多的[内存](../basic/ram.md)，你可以用它们来运行[脚本](../basic/scripts.md)。
我们将使用这些[服务器](../basic/servers.md)上的[内存](../basic/ram.md)来运行更多以 `joesguns` 为目标的[脚本](../basic/scripts.md)。

## 拷贝我们的脚本

我们将使用这些[服务器](../basic/servers.md)来运行我们的[脚本](../basic/scripts.md)：

- `neo-net`
- `zer0`
- `max-hardware`
- `iron-gym`

所有的[服务器](../basic/servers.md)都有 32GB 的[内存](../basic/ram.md)。
你可以使用 `终端 / Terminal` 命令 `scan-analyze 3` 自行查看。
为了拷贝我们的[黑客攻击](../basic/hacking.md)[脚本](../basic/scripts.md)到这些[服务器](../basic/servers.md)上，请前往 `终端 / Terminal` 并运行：

    $ home
    $ scp early-hack-template.js neo-net
    $ scp early-hack-template.js zer0
    $ scp early-hack-template.js max-hardware
    $ scp early-hack-template.js iron-gym

由于每台[服务器](../basic/servers.md)都有 32GB 的[内存](../basic/ram.md)，我们可以在每台[服务器](../basic/servers.md)上以 12 个线程运行我们的[黑客攻击](../basic/hacking.md)脚本。
现在，你应该知道如何连接[服务器](../basic/servers.md)了。
因此，使用 `scan-analyze 3` `终端 / Terminal` 命令查找并连接到上述每个[服务器](../basic/servers.md)。
然后，使用下面的 `终端 / Terminal` 命令以 12 个线程运行我们的[黑客攻击](../basic/hacking.md)脚本：

    $ run early-hack-template.js -t 12

请记住，如果你有 `AutoLink` 程序，在运行 `scan-analyze` 后，只需点击[服务器](../basic/servers.md)的主机名即可连接到该服务器。

## 通过脚本盈利 & 提升在 CyberSec 中的声望

现在，让我们正式开始放置游戏吧。
你的[脚本](../basic/scripts.md)需要一段时间才能开始产生收益。
请记住，你的大部分[脚本](../basic/scripts.md)都是针对 `joesguns` 的。
在他们开始进行[黑客攻击](../basic/hacking.md)之前，需要花一点时间让[服务器](../basic/servers.md) `grow()` 和 `weaken()` 到适当的值。
不过，一旦它们完成了这些准备工作，[脚本](../basic/scripts.md)就会产生很高的收益。

作为参考，在我运行第一个[脚本](../basic/scripts.md)大约两个小时后，我的[脚本](../basic/scripts.md)的收益达到了 \$20k/s，总共赚了 \$70m 。
(你可以在 `活动的脚本 / Active Scripts` 选项卡上看到这些统计数据）。

又过了 15 分钟，收益增加到 \$25k/s ，[脚本](../basic/scripts.md)又赚了 \$55 。

根据你从[犯罪](../basic/crimes.md)/[工作](../basic/companies.md)/[黑客网节点](../basic/hacknet_nodes.md) 中挣钱的速度，你的结果会有所不同，但这希望能让你对 [脚本](../basic/scripts.md) 能挣多少钱有一个很好的了解。

与此同时，我们要获得 `CyberSec` [派系](../basic/factions.md)的声望。
进入左侧导航菜单的 `派系 / Factions` 选项卡(快捷键 Alt + f)，然后选择 `CyberSec` 。
页面中间应该有一个 `黑客攻击合同 / Hacking Contracts` 按钮。
点击它就可以开始赚取 `CyberSec`[派系](../basic/factions.md)的[声望](../basic/reputation.md)(以及一些黑客经验)。
你的黑客等级越高，获得的 [声望](../basic/reputation.md) 也就越多。
请注意，当你为某个[派系](../basic/factions.md)工作时，你可以选择专注于工作，以全速获得[声望](../basic/reputation.md)。
你也可以选择同时做其他事情，获得[声望](../basic/reputation.md)的速度会慢一些，直到你再次集中注意力。
你可以随时取消你的[派系](../basic/factions.md)工作且获得的[声望](../basic/reputation.md)不会受到任何惩罚。

## 购买升级和增强

正如我之前提到的，在 1-2 小时内，我赚了超过 \$200m 。
现在，是时候将这些积累的财富投入到一些持续的升级上来帮助推进进度了！

## 升级主机的内存

目前最需要升级的是主机的[内存](../basic/ram.md)。
这将允许你运行更多的[脚本](../basic/scripts.md)。

为了升级[内存](../basic/ram.md)，请访问 `城市 / City` 选项卡，并访问公司 `Alpha Enterprises`。
你将看到一个写着 `升级 'home' 内存(8.00GB -> 16.00GB) - $1.010m / Upgrade 'home' RAM (8.00GB -> 16.00GB) - $1.010m` 的按钮。
点击这个按钮升级你的[内存](../basic/ram.md)。

我建议你将主机的[内存](../basic/ram.md)**至少**升级到 128GB 。
当然，它越高越好。

## 购买你的第一个增强

当你获得至少 1000 `CyberSec` [派系](../basic/factions.md)的[声望](../basic/reputation.md)，你就可以从那里购买你的第一个[增强](../basic/augmentations.md)。

要这么做，前往左侧导航菜单的 `派系 / Factions` 选项卡(快捷键 Alt + f)，然后选择 `CyberSec` 。
你能看到底部有一个写着 `购买增强 / Purchase Augmentations` 的按钮。
这将打开一个显示所有 `CyberSec` 可以提供的[增强](../basic/augmentations.md)的页面。
其中的一些现在可能处于锁定状态。
想要解锁它们，你需要继续提升 `CyberSec` 的[声望](../basic/reputation.md)。

[增强](../basic/augmentations.md)提供了以倍数形式的持久性升级。
在游戏初期这个增益并不会很强，因为倍数较小。
不过，多个[增强](../basic/augmentations.md)叠加的效果 **以乘法结算** ，因此当你继续安装更多[增强](../basic/augmentations.md)时，它们的效果会显著增加。

正因为如此，我建议你在游戏初期倾向于主机的[内存](../basic/ram.md)升级，而不是安装更多的[增强](../basic/augmentations.md)。
拥有足够的[内存](../basic/ram.md)来运行许多[脚本](../basic/scripts.md)会让你赚到更多的钱，然后你可以在后期回来购买所有这些[增强](../basic/augmentations.md)。

现在，我建议你至少从 `CyberSec` 购买 `精神训练师 I / Neurotrainer I` 这个[增强](../basic/augmentations.md)。
如果你的资金还充足，我还建议你购买 `比特线 / BitWire` 和几级 `神经通量调节器 / NeuroFlux Governor` (`NFG`)[增强](../basic/augmentations.md)。
请注意，每购买一次[增强](../basic/augmentations.md)，**其他增强的价格就会上涨 90%**，所以你应该先购买最贵的[增强](../basic/augmentations.md)。
不过别担心，一旦你选择安装[增强](../basic/augmentations.md)，它们的价格就会重置。

## 下一步

本指南的攻略部分到此结束！
你可以继续探索游戏的内容。
本指南中还有很多没有涵盖或提及的功能，甚至还有更多的功能会在你继续游戏的过程中解锁！

此外，查看 API 文档，了解它能提供什么。
在我看来，编写[脚本](../basic/scripts.md)来执行和自动化各种任务是游戏中最有趣的地方！

下面是你近期可能要考虑做的几件事。

## 安装增强(以及重置)

在你购买[增强](../basic/augmentations.md)之后，你需要进行安装才能获得它们所提供的增益效果。
安装[增强](../basic/augmentations.md)是游戏的“软重置”或“声望”机制。

要安装[增强](../basic/augmentations.md)，请转到左侧导航菜单的 `增强 / Augmentations` 选项卡(快捷键 Alt + a)。
你可以看到所有你购买的[增强](../basic/augmentations.md)的列表。
在那下面，你会看到一个写着 `安装增强 / Install Augmentations` 的按钮。
注意：点击这个按钮后，你将无法撤销它(除非你加载一个更早的存档)。

## 脚本启动流程自动化

每当你安装[增强](../basic/augmentations.md)时，你的所有[脚本](../basic/scripts.md)都会被终止，你需要重新运行它们。
每次安装[增强](../basic/augmentations.md)时都需要这样做会很麻烦，所以你也许需要编写一个[脚本](../basic/scripts.md)来自动化这个过程。
下面是一个简单的启动[脚本](../basic/scripts.md)示例。
你可以根据自己的喜好随意调整。

    /** @param {NS} ns */
    export async function main(ns) {
        // 不需要开放任何端口就能获得 root 权限的服务器数组
        // 这些服务器有16GB的内存
        const servers0Port = ["sigma-cosmetics",
                            "joesguns",
                            "nectar-net",
                            "hong-fang-tea",
                            "harakiri-sushi"];

        // 仅需要开放一个端口就能获得 root 权限的服务器数组
        // 这些服务器有32GB的内存
        const servers1Port = ["neo-net",
                            "zer0",
                            "max-hardware",
                            "iron-gym"];

        // 拷贝我们的脚本到每个不需要端口获取 root 权限的服务器上，
        // 然后使用 nuke() 来获得管理员权限并运行脚本。
        for (let i = 0; i < servers0Port.length; ++i) {
            const serv = servers0Port[i];

            ns.scp("early-hack-template.js", serv);
            ns.nuke(serv);
            ns.exec("early-hack-template.js", serv, 6);
        }

        // 等待直到获得 "BruteSSH.exe" 程序
        while (!ns.fileExists("BruteSSH.exe")) {
            await ns.sleep(60000);
        }

        // 拷贝我们的脚本到每个需要开放一个端口才能获得root权限的服务器上，
        // 然后使用 brutessh() 和 nuke() 来获得管理员权限并运行脚本。
        for (let i = 0; i < servers1Port.length; ++i) {
            const serv = servers1Port[i];

            ns.scp("early-hack-template.js", serv);
            ns.brutessh(serv);
            ns.nuke(serv);
            ns.exec("early-hack-template.js", serv, 12);
        }
    }

## 随机小贴士

- 在游戏初期，将你的资金花在升级[内存](../basic/ram.md)和购买新的[服务器](../basic/servers.md)上比购买[增强](../basic/augmentations.md)更好。
- 一个[服务器](../basic/servers.md)上的可用资金越多，`hack()` 和 `grow()` 函数的效果越好。
  这是因为这两个函数的运算基于百分比而不是固定值。
  `hack()` 窃取的是[服务器](../basic/servers.md)的可用资金的一定百分比，而 `grow()` 则会使[服务器](../basic/servers.md)的资金增加 X%。
- 每个[服务器](../basic/servers.md)上存在的资金都有一个上限。
  这个值对每个[服务器](../basic/servers.md)都是不同的。
  `getServerMaxMoney()` 函数会告诉你这个上限值。
- 在游戏初期，你的战斗属性(力量、防御等)并不是很重要。
  不要浪费太多时间或资金去提升这些战斗属性的经验值。
- 根据经验，你的黑客攻击目标应该是服务器中资金上限最高的那个，同时其所需的黑客等级应低于你当前黑客等级的 1/2 。
