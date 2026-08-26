import React, { useEffect } from "react";
import { Explore, Info, LastPage, LocalPolice, NewReleases, Report, SportsMma } from "@mui/icons-material";
import { Box, Button, Container, Paper, Tooltip, Typography, useTheme } from "@mui/material";

import { Player } from "@player";
import { FactionName, FactionDiscovery } from "@enums";

import { Settings } from "../../Settings/Settings";
import { formatFavor, formatReputation } from "../../ui/formatNumber";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { useCycleRerender } from "../../ui/React/hooks";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
import { Requirement } from "../../ui/Components/Requirement";

import { Faction } from "../Faction";
import { getFactionAugmentationsFiltered, joinFaction } from "../FactionHelpers";
import { Factions } from "../Factions";
import { ShareOption } from "./ShareOption";

export const InvitationsSeen = new Set<FactionName>();

const fontSize = "small";
const marginRight = 0.5;

const WorkTypesOffered = (props: { faction: Faction }): React.ReactElement => {
  const info = props.faction.getInfo();

  return (
    <>
      {info.offerFieldWork && (
        <Tooltip title="该派系提供外勤工作">
          <Explore sx={{ color: Settings.theme.info, mr: marginRight }} fontSize={fontSize} />
        </Tooltip>
      )}
      {info.offerHackingWork && (
        <Tooltip title="该派系提供黑客工作">
          <LastPage sx={{ color: Settings.theme.hack, mr: marginRight }} fontSize={fontSize} />
        </Tooltip>
      )}
      {info.offerSecurityWork && (
        <Tooltip title="该派系提供安保工作">
          <LocalPolice sx={{ color: Settings.theme.combat, mr: marginRight }} fontSize={fontSize} />
        </Tooltip>
      )}
    </>
  );
};

const JoinChecklist = (props: { faction: Faction }): React.ReactElement => {
  const info = props.faction.getInfo();
  return (
    <>
      {[...info.inviteReqs].map((condition, i) => (
        <Requirement key={i} fulfilled={condition.isSatisfied(Player)} value={condition.toString()} />
      ))}
    </>
  );
};

function getStylesForFactionName(faction: Faction) {
  return {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    color: faction.isBanned ? Settings.theme.error : "inherit",
    textDecorationLine: faction.isBanned ? "line-through" : "none",
  };
}

interface FactionElementProps {
  faction: Faction;
  /** Rerender function to force the entire FactionsRoot to rerender */
  rerender: () => void;
}
const FactionElement = (props: FactionElementProps): React.ReactElement => {
  const facInfo = props.faction.getInfo();
  const augsLeft = getFactionAugmentationsFiltered(props.faction).filter((aug) => !Player.hasAugmentation(aug)).length;

  function openFaction(faction: Faction): void {
    Router.toPage(Page.Faction, { faction });
  }

  function openFactionAugPage(faction: Faction): void {
    Router.toPage(Page.FactionAugmentations, { faction });
  }

  function acceptInvitation(event: React.MouseEvent<HTMLButtonElement>, factionName: FactionName): void {
    if (!event.isTrusted || !Factions[factionName].alreadyInvited || Factions[factionName].isBanned) {
      return;
    }
    joinFaction(Factions[factionName]);
    props.rerender();
  }

  return (
    <Paper
      sx={{
        display: "grid",
        p: 1,
        alignItems: "center",
        gridTemplateColumns: "minmax(0, 4fr)" + (props.faction.isMember ? " 1fr" : ""),
      }}
    >
      <Box display="flex" sx={{ alignItems: "center" }}>
        {props.faction.isMember ? (
          <Box
            display="grid"
            sx={{
              mr: 1,
              gridTemplateColumns: "1fr 1fr",
              minWidth: "fit-content",
              gap: 0.5,
              "& .MuiButton-root": { height: "48px" },
            }}
          >
            <Button onClick={() => openFaction(props.faction)}>详情</Button>
            <Button onClick={() => openFactionAugPage(props.faction)}>强化</Button>
          </Box>
        ) : props.faction.alreadyInvited ? (
          <Button sx={{ height: "48px", mr: 1 }} onClick={(e) => acceptInvitation(e, props.faction.name)}>
            加入！
          </Button>
        ) : null}

        <span style={{ maxWidth: props.faction.isMember ? "70%" : "95%", overflow: "hidden" }}>
          <Typography
            variant="h6"
            sx={{
              mr: 1,
              display: "grid",
              gridTemplateColumns: "fit-content(100vw) max-content",
              alignItems: "center",
            }}
          >
            {props.faction.discovery === FactionDiscovery.known ? (
              <Tooltip
                title={
                  <>
                    <Typography sx={{ textAlign: "center" }}>{props.faction.name}</Typography>
                    <JoinChecklist faction={props.faction} />
                  </>
                }
              >
                <span style={getStylesForFactionName(props.faction)}>{props.faction.name}</span>
              </Tooltip>
            ) : (
              <Tooltip title={"传闻中的派系"}>
                <span style={getStylesForFactionName(props.faction)}>
                  <CorruptibleText content={props.faction.name} spoiler={false} />
                </span>
              </Tooltip>
            )}

            <span style={{ display: "flex", alignItems: "center" }}>
              {Player.hasGangWith(props.faction.name) && (
                <Tooltip title="你已在该派系拥有帮派">
                  <SportsMma sx={{ color: Settings.theme.hp, ml: 1 }} />
                </Tooltip>
              )}

              {facInfo.special && (
                <Tooltip title="这是一个特殊派系">
                  <NewReleases sx={{ ml: 1, color: Settings.theme.money, transform: "rotate(180deg)" }} />
                </Tooltip>
              )}

              {facInfo.enemies.length > 0 && (
                <Tooltip
                  title={
                    <Typography component="div">
                      该派系的敌对派系：
                      <ul>
                        {facInfo.enemies.map((enemy) => (
                          <li key={enemy}>{enemy}</li>
                        ))}
                      </ul>
                      {!props.faction.isMember && <>加入该派系将导致你无法加入其敌对派系。</>}
                    </Typography>
                  }
                >
                  <Report sx={{ ml: 1, color: Settings.theme.error }} />
                </Tooltip>
              )}
            </span>
          </Typography>

          <span style={{ display: "flex", alignItems: "center" }}>
            {props.faction.isMember || props.faction.alreadyInvited ? (
              <>
                {!Player.hasGangWith(props.faction.name) && <WorkTypesOffered faction={props.faction} />}
                <Typography variant="body2" sx={{ display: "flex", whiteSpace: "nowrap" }}>{`还可解锁 ${
                  augsLeft || "无"
                } 个强化`}</Typography>
              </>
            ) : (
              <Typography variant="body2" component="div">
                <i>{props.faction.getInfo().rumorText}</i>
              </Typography>
            )}
          </span>
        </span>
      </Box>

      {props.faction.isMember && (
        <Box display="grid" sx={{ alignItems: "center", justifyItems: "left", gridAutoFlow: "row" }}>
          <Typography sx={{ color: Settings.theme.rep }}>{formatFavor(props.faction.favor)} 人脉</Typography>
          <Typography sx={{ color: Settings.theme.rep }}>
            {formatReputation(props.faction.playerReputation)} 声望
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export function FactionsRoot(): React.ReactElement {
  const theme = useTheme();
  const rerender = useCycleRerender();
  useEffect(() => {
    Player.factionInvitations.forEach((factionName) => {
      InvitationsSeen.add(factionName);
    });
  }, []);

  // Display joined factions in the standard order
  const joinedFactions = Object.values(Factions).filter((faction) => faction.isMember);
  // Display invitations and rumors in the order they were received
  const invitedFactions = Player.factionInvitations.map((facName) => Factions[facName]).filter((faction) => !!faction);
  const rumoredFactions = [...Player.factionRumors]
    .map((facName) => Factions[facName])
    .filter((faction) => !!faction && !faction.isMember && !faction.alreadyInvited);

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0, mb: 10 }}>
      <Typography variant="h4">
        派系
        <Tooltip
          title={
            <Typography>
              在游戏过程中你会收到来自各个派系的邀请。游戏中有许多不同的派系，每个派系都有不同的准入标准。加入派系并推进其事业，对推进游戏进程和解锁终局内容至关重要。
            </Typography>
          }
        >
          <Info sx={{ ml: 1, mb: 0 }} color="info" />
        </Tooltip>
      </Typography>

      <Box
        display="grid"
        sx={{
          gap: 1,
          gridTemplateColumns: (invitedFactions.length > 0 ? "1fr " : "") + "2fr",
          [theme.breakpoints.down("lg")]: { gridTemplateColumns: "1fr", "& > span:nth-of-type(1)": { order: 1 } },
          gridTemplateRows: "minmax(0, 1fr)",
          "& > span > .MuiBox-root": {
            display: "grid",
            gridAutoRows: "70px",
            gap: 1,
          },
        }}
      >
        <span className="factions-invites">
          {invitedFactions.length > 0 && (
            <>
              <Typography variant="h5" color="primary">
                派系邀请
              </Typography>
              <Box>
                {invitedFactions.map((faction) => (
                  <FactionElement key={faction.name} faction={faction} rerender={rerender} />
                ))}
              </Box>
            </>
          )}
        </span>

        <span className="factions-joined">
          {Player.inGang() && (
            <>
              <Typography variant="h5" color="primary">
                你的帮派
              </Typography>
              <Box>
                <FactionElement key={Player.getGangName()} faction={Player.getGangFaction()} rerender={rerender} />
              </Box>
            </>
          )}
          <Typography variant="h5" color="primary">
            你的派系
          </Typography>
          <Box>
            {joinedFactions.length > 0 ? (
              joinedFactions.map((faction) => {
                if (Player.getGangName() === faction.name) return null;
                return <FactionElement key={faction.name} faction={faction} rerender={rerender} />;
              })
            ) : (
              <Typography>你尚未加入任何派系。</Typography>
            )}
          </Box>
        </span>
      </Box>
      <div style={{ margin: "15px 0" }}>
        <Typography variant="h5" color="primary">
          共享 RAM
        </Typography>
        <ShareOption rerender={rerender} />
      </div>
      <span className="factions-rumors">
        {rumoredFactions.length > 0 && (
          <>
            <Typography variant="h5" color="primary">
              传闻
            </Typography>
            <Box style={{ display: "grid", gap: 1, gridAutoRows: "minmax(70px, auto)" }}>
              {rumoredFactions.map((faction) => (
                <FactionElement key={faction.name} faction={faction} rerender={rerender} />
              ))}
            </Box>
          </>
        )}
      </span>
    </Container>
  );
}
