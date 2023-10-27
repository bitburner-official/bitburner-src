import React, { useEffect } from "react";
import { Explore, Info, LastPage, LocalPolice, NewReleases, Report, SportsMma } from "@mui/icons-material";
import { Box, Button, Container, Paper, Tooltip, Typography, useTheme } from "@mui/material";

import { Player } from "@player";
import { FactionName, FactionDiscovery } from "@enums";

import { Settings } from "../../Settings/Settings";
import { formatFavor, formatReputation } from "../../ui/formatNumber";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { useRerender } from "../../ui/React/hooks";
import { CorruptableText } from "../../ui/React/CorruptableText";

import { Faction } from "../Faction";
import { getFactionAugmentationsFiltered, joinFaction } from "../FactionHelpers";
import { Factions } from "../Factions";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

export const InvitationsSeen = new Set<FactionName>();

const fontSize = "small";
const marginRight = 0.5;

const WorkTypesOffered = (props: { faction: Faction }): React.ReactElement => {
  const info = props.faction.getInfo();

  return (
    <>
      {info.offerFieldWork && (
        <Tooltip title="This Faction offers field work">
          <Explore sx={{ color: Settings.theme.info, mr: marginRight }} fontSize={fontSize} />
        </Tooltip>
      )}
      {info.offerHackingWork && (
        <Tooltip title="This Faction offers hacking work">
          <LastPage sx={{ color: Settings.theme.hack, mr: marginRight }} fontSize={fontSize} />
        </Tooltip>
      )}
      {info.offerSecurityWork && (
        <Tooltip title="This Faction offers security work">
          <LocalPolice sx={{ color: Settings.theme.combat, mr: marginRight }} fontSize={fontSize} />
        </Tooltip>
      )}
    </>
  );
};

const JoinConditions = (props: { faction: Faction }): React.ReactElement => {
  const info = props.faction.getInfo();
  return (
    <>
      {info.inviteReqs.map((condition, i) => (
        <Typography key={i} style={{ paddingLeft: "1.25em", display: "flex", alignItems: "center" }}>
          <span style={{ marginLeft: "-1.25em" }}>
            {condition.isSatisfied(Player) ? <TaskAltIcon /> : <RadioButtonUncheckedIcon />}
          </span>
          {condition.toString()}
        </Typography>
      ))}
    </>
  );
};

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

  function acceptInvitation(event: React.MouseEvent<HTMLButtonElement>, faction: FactionName): void {
    if (!event.isTrusted) return;
    joinFaction(Factions[faction]);
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
            <Button onClick={() => openFaction(props.faction)}>Details</Button>
            <Button onClick={() => openFactionAugPage(props.faction)}>Augments</Button>
          </Box>
        ) : props.faction.alreadyInvited ? (
          <Button sx={{ height: "48px", mr: 1 }} onClick={(e) => acceptInvitation(e, props.faction.name)}>
            Join!
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
            {props.faction.discovery == FactionDiscovery.known ? (
              <Tooltip
                title={
                  <>
                    <Typography>{props.faction.name}</Typography>
                    <JoinConditions faction={props.faction} />
                  </>
                }
              >
                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {props.faction.name}
                </span>
              </Tooltip>
            ) : (
              <Tooltip title={"Rumored Faction"}>
                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  <CorruptableText content={props.faction.name} />
                </span>
              </Tooltip>
            )}

            <span style={{ display: "flex", alignItems: "center" }}>
              {Player.hasGangWith(props.faction.name) && (
                <Tooltip title="You have a gang with this Faction">
                  <SportsMma sx={{ color: Settings.theme.hp, ml: 1 }} />
                </Tooltip>
              )}

              {facInfo.special && (
                <Tooltip title="This is a special Faction">
                  <NewReleases sx={{ ml: 1, color: Settings.theme.money, transform: "rotate(180deg)" }} />
                </Tooltip>
              )}

              {!props.faction.isMember && facInfo.enemies.length > 0 && (
                <Tooltip
                  title={
                    <Typography component="div">
                      This Faction is enemies with:
                      <ul>
                        {facInfo.enemies.map((enemy) => (
                          <li key={enemy}>{enemy}</li>
                        ))}
                      </ul>
                      Joining this Faction will prevent you from joining its enemies
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
                <Typography variant="body2" sx={{ display: "flex", whiteSpace: "nowrap" }}>{`${
                  augsLeft || "No"
                } Augmentations left`}</Typography>
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
          <Typography sx={{ color: Settings.theme.rep }}>
            {formatFavor(Math.floor(props.faction.favor))} favor
          </Typography>
          <Typography sx={{ color: Settings.theme.rep }}>
            {formatReputation(props.faction.playerReputation)} rep
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export function FactionsRoot(): React.ReactElement {
  const theme = useTheme();
  const rerender = useRerender(200);
  useEffect(() => {
    Player.factionInvitations.forEach((faction) => {
      InvitationsSeen.add(faction);
    });
  }, []);

  const allFactions = Object.values(FactionName).map((faction) => faction as string);
  const allJoinedFactions = [...Player.factions].map((facName) => Factions[facName]).filter((faction) => !!faction);
  allJoinedFactions.sort((a, b) => allFactions.indexOf(a.name) - allFactions.indexOf(b.name));

  const invitations = Player.factionInvitations.map((facName) => Factions[facName]).filter((faction) => !!faction);

  const rumors = Player.factionRumors.map((facName) => Factions[facName]).filter((faction) => !!faction);

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0, mb: 10 }}>
      <Typography variant="h4">
        Factions
        <Tooltip
          title={
            <Typography>
              Throughout the game you may receive invitations from factions. There are many different factions, and each
              faction has different criteria for determining its potential members. Joining a faction and furthering its
              cause is crucial to progressing in the game and unlocking endgame content.
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
          gridTemplateColumns: (invitations.length > 0 ? "1fr " : "") + "2fr",
          [theme.breakpoints.down("lg")]: { gridTemplateColumns: "1fr", "& > span:nth-of-type(1)": { order: 1 } },
          gridTemplateRows: "minmax(0, 1fr)",
          "& > span > .MuiBox-root": {
            display: "grid",
            gridAutoRows: "70px",
            gap: 1,
          },
        }}
      >
        <span>
          {invitations.length > 0 && (
            <>
              <Typography variant="h5" color="primary">
                Faction Invitations
              </Typography>
              <Box>
                {invitations.map((faction) => (
                  <FactionElement key={faction.name} faction={faction} rerender={rerender} />
                ))}
              </Box>
            </>
          )}

          {rumors.length > 0 && (
            <>
              <Typography variant="h5" color="primary">
                Rumors
              </Typography>
              <div style={{ display: "grid", gap: 1, gridAutoRows: "minmax(70px, auto)" }}>
                {rumors.map((faction) => (
                  <FactionElement key={faction.name} faction={faction} rerender={rerender} />
                ))}
              </div>
            </>
          )}
        </span>

        <span>
          {Player.inGang() && (
            <>
              <Typography variant="h5" color="primary">
                Your Gang
              </Typography>
              <Box>
                <FactionElement key={Player.getGangName()} faction={Player.getGangFaction()} rerender={rerender} />
              </Box>
            </>
          )}
          <Typography variant="h5" color="primary">
            Your Factions
          </Typography>
          <Box>
            {allJoinedFactions.length > 0 ? (
              allJoinedFactions.map((faction) => {
                if (Player.getGangName() === faction.name) return null;
                return <FactionElement key={faction.name} faction={faction} rerender={rerender} />;
              })
            ) : (
              <Typography>You have not yet joined any Factions.</Typography>
            )}
          </Box>
        </span>
      </Box>
    </Container>
  );
}
