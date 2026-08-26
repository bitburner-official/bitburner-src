/**
 * React Component for the Hacknet Node UI
 *
 * Displays general information about Hacknet Nodes
 */
import React from "react";
import Typography from "@mui/material/Typography";

interface IProps {
  hasHacknetServers: boolean;
}

export function GeneralInfo(props: IProps): React.ReactElement {
  return (
    <>
      <Typography>
        Hacknet
        是一个全球性的去中心化机器网络。世界各地的黑客利用它匿名共享算力，并在不必担心被追踪的情况下发起分布式网络攻击。
      </Typography>
      <br />
      {!props.hasHacknetServers ? (
        <>
          <Typography>
            {`在这里，你可以购买 Hacknet 节点，这是一种专用机器，` +
              `可以接入 Hacknet 网络并贡献自身的资源。这让你能从网络上进行的入侵中分得一小部分利润。本质上，` +
              `你是在出租自己节点的算力。`}
          </Typography>
          <Typography>
            {`你购买的每个 Hacknet 节点都会被动地为你赚取资金。每个 Hacknet 节点` +
              `都可以通过升级来提高算力，从而增加` +
              `你从中获得的利润。`}
          </Typography>
        </>
      ) : (
        <>
          <Typography>
            {`在这里，你可以购买 Hacknet 服务器，它是 Hacknet 节点的升级版本。` +
              `Hacknet 服务器会在网络上执行计算和操作，为你赚取` +
              `哈希。哈希可以用于各种不同的升级。`}
          </Typography>
          <Typography>
            {`Hacknet 服务器也可以当作服务器来运行脚本。但是，在服务器上运行脚本` +
              `会降低其哈希速率（每秒生成的哈希数）。Hacknet 服务器的哈希速率降低幅度，等于该服务器用于运行` +
              `脚本的 RAM 所占的百分比。`}
          </Typography>
        </>
      )}
    </>
  );
}
