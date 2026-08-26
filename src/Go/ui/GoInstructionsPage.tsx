import React from "react";
import { Grid, Link, Typography } from "@mui/material";

import { GoOpponent, GoColor } from "@enums";
import { boardStyles } from "../boardState/goStyles";
import { boardStateFromSimpleBoard } from "../boardAnalysis/boardAnalysis";
import { GoTutorialChallenge } from "./GoTutorialChallenge";
import { getMaxRep } from "../effects/effect";
import { DocumentationLink } from "../../ui/React/DocumentationLink";

const captureChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard([".....", "OX...", "OXX..", "OOX.O", "OOX.."], GoOpponent.none, GoColor.white)}
    description={"挑战：下方这片白棋网络很脆弱！点击棋盘放置路由器，切断它们与所有空节点的通路，提掉一些白子。"}
    correctMoves={[{ x: 0, y: 0 }]}
    correctText={"正确！没有了开放端口，白色路由器被摧毁。现在你包围并控制了右下角的空节点。"}
    incorrectText={"可惜白色路由器仍与至少一个空节点相连。点击'重置'再试一次。"}
  />
);

const saveTheNetworkChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard(["OO.##", "XO..#", "XX..#", "XO...", "XO..."], GoOpponent.none, GoColor.white)}
    description={"挑战：你的路由器有危险！它们只剩一个开放端口。把它们连接到更多空节点上，拯救黑棋网络。"}
    correctMoves={[{ x: 2, y: 2 }]}
    correctText={"正确！现在这个网络连接着三个空节点而不是一个，想切断它就难多了。"}
    incorrectText={"可惜白方只需一步就能把你的网络与所有开放端口切断。点击'重置'再试一次。"}
  />
);

const onlyGoodMoveChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard(["XXO.O", "XO.O.", ".OOOO", "XXXXX", "X.X.X"], GoOpponent.none, GoColor.white)}
    description={"挑战：拯救左边的黑棋网络！把它连接到不止一个空节点上。"}
    correctMoves={[{ x: 2, y: 0 }]}
    correctText={"正确！现在网络连接着两个空节点而不是一个，想切断它就难多了。"}
    incorrectText={"不对。左边的网络仍会被一步切断。而且，你还堵住了右边网络仅剩的开放端口之一！"}
  />
);

const makeTwoEyesChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard(["XXOO.", ".XXOO", ".XXO.", ".XXOO", "XXOO."], GoOpponent.none, GoColor.white)}
    description={"挑战：黑色路由器目前只连接着一组空节点。请放置一个路由器，让它改连到两组空节点上。"}
    correctMoves={[{ x: 2, y: 0 }]}
    correctText={
      "正确！现在你的网络在多个不同区域包围着空节点，由于自杀规则的存在，白方已经不可能提掉这个网络（除非你自己填掉自家的空节点！）。"
    }
    incorrectText={"不对。黑棋网络仍然只接触一组空节点。（提示：试着把底部那组空节点分隔开。）点击'重置'再试一次。"}
  />
);

export const GoInstructionsPage = (): React.ReactElement => {
  const { classes } = boardStyles({});
  return (
    <div className={classes.instructionScroller}>
      <>
        <Typography variant="h4">IPvGO</Typography>
        <br />
        <Typography>
          2070 年末，.org 泡沫破裂，大多数新建的 IPvGO "网络"在一夜之间崩溃。从那时起，各个派系一直在争夺小型子网，
          以控制其中的算力。如果能从现任所有者手中夺过来，这些子网在懂行的人手里会非常值钱。
          <br />
          <br />
          （有关如何用 API 实现自动化的详情，以及一份可直接使用的入门脚本，请参阅游戏内文档的{" "}
          <DocumentationLink page="programming/go_algorithms.md">IPvGO</DocumentationLink> 章节。）
        </Typography>
        <br />
        <br />
        <Grid container columns={2}>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">如何攻占 IPvGO 子网</Typography>
            <br />
            <Typography>
              你的目标是用自己的路由器包围空节点，比当前占据子网的派系控制更多的<i>空节点</i>。
              <br />
              <br />
              每回合你在一个空节点放置一个路由器（或停一手）。路由器会与相邻的自家路由器相连，形成网络。网络剩余的开放端口
              由指向相邻空节点的连线表示。
              <br />
              <br />
              如果一组路由器不再与任何空节点相连，它们会发生严重丢包并从子网中被移除。务必保证你的每个网络始终能连通多个空节点！
              只剩一个开放端口的网络会开始忽隐忽现，因为它随时可能被摧毁。
              <br />
              <br />
              你也可以用路由器尽量限制对手连通空节点的机会。只要把一个网络与所有空节点隔断，对方的整组路由器都会被移除！
              <br />
              <br />
            </Typography>
          </Grid>
          <Grid item className={classes.instructionBoardWrapper}>
            {captureChallenge}
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container>
          <Grid item className={classes.instructionBoardWrapper}>
            {saveTheNetworkChallenge}
          </Grid>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">赢下子网</Typography>
            <br />
            <Typography>
              当子网上所有的空节点都被同一种颜色完全包围，或双方接连停一手时，对局结束。
              <br />
              <br />
              子网被完全瓜分后，每名玩家为其完全包围的每个空节点得一分，每拥有一个路由器也得一分。你可以借助棋盘边缘配合自家
              路由器来完全包围并占据空节点。 <br />
              <br />
              白方还会得到几分（称为"贴目"）作为其在该子网的主场优势，用以平衡黑方先行之利。
              <br />
              <br />
              对局结束时你控制的地盘会为你提供属性乘数加成。赢下该节点会增加收益数额，但并非必需。
              <br />
              <br />
              只要你属于该派系，连续两次战胜同一对手就会获得 {getMaxRep() /
                200} 点声望，转化为该派系的好感度（上限为 {getMaxRep()} 点声望）。
              <br />
              这些声望会立即转化为好感度，也就是说无需转生安装就能立刻提高声望获取速度。
              <br />
              <br />
              给围棋老手的说明：IPvGO 采用古老的传统围棋计分规则——数子法，而非 21
              世纪中期流行的日本数目法。对局期间未被提走
              的棋子都是活棋并计入得分。可能已死的棋链不会在对局结束后被自动提掉，也不计算俘子。这样选择是因为它易于教学和计算，
              而非使用那些为加快实体对局而设计的数目法捷径。
            </Typography>
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">特殊规则详解</Typography>
            <br />
            <Typography>
              *
              这些子网年久失修，并不总是标准的正方形。死亡区域（例如上方示例中的左上角）不属于子网的一部分，既不计入地盘，
              也不会为相邻路由器提供开放端口。
              <br />
              <br />
              * 你不能用切断最后一个空节点的方式让自己的路由器自杀；也不能把路由器放进被对方路由器完全包围的节点里自杀。
              <br />
              <br />
              * 自杀规则有一个例外：如果落子能够提掉对方的任何路由器，你可以把路由器放在任意节点上。
              <br />
              <br />
              *
              不能重现之前的棋盘状态。这条规则防止了提子与反提子的无限循环。这意味着某些情况下，你不能立即提掉那些正在闪烁、
              看似脆弱的敌方网络。
              <br />
              <br />
              注意，你最终还是可以反提的，但必须先在棋盘其他位置落子，使整体棋盘状态发生改变。
            </Typography>
          </Grid>
          <Grid item className={classes.instructionBoardWrapper}>
            {onlyGoodMoveChallenge}
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container>
          <Grid item className={classes.instructionBoardWrapper}>
            {makeTwoEyesChallenge}
          </Grid>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">策略</Typography>
            <br />
            <br />
            <Typography>
              * 你可以通过 "ns.go" API 放置路由器并查看棋盘状态。更多细节请前往文档标签页中的{" "}
              <DocumentationLink page="programming/go_algorithms.md">IPvGO</DocumentationLink> 页面。
              <br />
              <br />
              *
              如果一个网络只包围着一个空节点，对手最终可以填掉该节点从而提掉整个网络。但如果你的网络内部有两个独立的空节点，
              自杀规则会阻止对手填掉其中任何一个，这意味着你的网络不可被提掉！尽量让你的网络包围多个不同的空节点，
              并尽可能避免填掉自己网络的空节点。
              <br />
              <br />
              * 留意路由器网络只剩一两个通向空位的开放端口的时候！那正是你保护己方网络、或提掉对方派系网络的时机。
              <br />
              <br />
              * 每个派系都有不同的风格和弱点。试着弄清它们各自擅长和不擅长什么。
              <br />
              <br />
              * 学习策略最好的方法就是多加尝试，看看什么有效！
              <br />
              <br />* 本游戏是计分略有简化的围棋。想了解更多规则细节和策略，试试{" "}
              <Link href={"https://way-to-go.gitlab.io/#/en/capture-stones"} target={"_blank"} rel="noreferrer">
                The Way to Go 互动指南。
              </Link>{" "}
              <br />
              <br />
            </Typography>
          </Grid>
        </Grid>
        <br />
      </>
    </div>
  );
};
