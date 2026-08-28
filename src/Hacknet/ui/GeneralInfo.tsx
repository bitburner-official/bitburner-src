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
        cyber attacks without the fear of being traced. Hackers who use the network distribute a small percentage of
        their profits to it. The machines that the Hacknet runs on are called Hacknet Nodes, specialised rigs that can
        share computing power anonymously.
      </Typography>
      <br />
      {!props.hasHacknetServers ? (
        <>
          <Typography>You can purchase Hacknet Nodes to passively earn money.</Typography>
          <br />
          <Typography>
            Each Node can be upgraded to increase its computing power and the profit you make from it.
          </Typography>
        </>
      ) : (
        <>
          <Typography>
            Here you can purchase a Hacknet Server, an upgraded version of the Hacknet Node. Hacknet Servers will
            perform computations and operations on the network, earning you hashes. Hashes can be spent on a variety of
            different upgrades.
          </Typography>
          <br />
          <Typography>
            Hacknet Servers can also be used as servers to run scripts. However, running scripts on a server will reduce
            its hash rate (hashes generated per second). A Hacknet Server's hash rate will be reduced by the percentage
            of RAM that is being used by that Server to run scripts.
          </Typography>
        </>
      )}
    </>
  );
}
