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
        The Hacknet is a global, decentralized network of machines. It is used by hackers around the world to perform
        cyberattacks without the fear of being traced.
      </Typography>
      <br />
      {!props.hasHacknetServers ? (
        <>
          <Typography>
            Here you can purchase Hacknet Nodes, specialized machines that can anonymously connect and contribute their
            resoures to the network. They allow you to take a small percentage of profits from hacks performed on the
            network. Essentially, you are renting out your Nodes' computing power.
            <br />
            <br />
            Hacknet Nodes passively earn you money, even when you're offline. You can upgrade Hacknet Nodes to increase
            their earnings.
          </Typography>
        </>
      ) : (
        <>
          <Typography>
            Here you can purchase Hacknet Servers, an upgraded version of Hacknet Nodes. Hacknet Servers perform
            computations and operations on the network, earning you hashes. Hashes can be spent on a variety of
            upgrades.
            <br />
            <br />
            Hacknet Servers can be used to run scripts, just like regular servers. However, running scripts on a Hacknet
            Server reduces its hash rate by the percentage of its RAM you use.
          </Typography>
        </>
      )}
    </>
  );
}
