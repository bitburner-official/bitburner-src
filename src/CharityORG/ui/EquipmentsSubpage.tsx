import React, { useState } from "react";
import { useCharityORG } from "./Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { MenuItem, Table, TableBody, TableCell, TextField, TableRow } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { formatMultiplier, formatSkill, formatNumber } from "../../ui/formatNumber";
import { CharityVolunteerUpgrades } from "../CharityVolunteerUpgrades";
import { CharityVolunteerUpgrade } from "../CharityVolunteerUpgrade";
import { Money } from "../../ui/React/Money";
import { CharityVolunteer } from "../CharityVolunteer";
import { UpgradeType } from "../data/upgrades";
//import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { useRerender } from "../../ui/React/hooks";
import { useStyles } from "../../ui/React/CharacterOverview";

interface INextRevealProps {
  upgrades: string[];
  type: UpgradeType;
}

function NextReveal(props: INextRevealProps): React.ReactElement {
  const charity = useCharityORG();
  const upgrades = Object.keys(CharityVolunteerUpgrades)
    .filter((upgName: string) => {
      const upg = CharityVolunteerUpgrades[upgName];
      if (charity.bank > charity.getUpgradeCost(upg)) return false;
      if (upg.type !== props.type) return false;
      if (props.upgrades.includes(upgName)) return false;
      return true;
    })
    .map((upgName: string) => CharityVolunteerUpgrades[upgName]);

  if (upgrades.length === 0) return <></>;
  return (
    <Typography>
      Next at <Money money={charity.getUpgradeCost(upgrades[0])} />
    </Typography>
  );
}

function PurchasedUpgrade({ upgName }: { upgName: string }): React.ReactElement {
  const upg = CharityVolunteerUpgrades[upgName];
  return (
    <Paper sx={{ p: 1 }}>
      <Tooltip title={<Typography dangerouslySetInnerHTML={{ __html: upg.desc }} />}>
        <Typography>{upg.name}</Typography>
      </Tooltip>
    </Paper>
  );
}

interface IUpgradeButtonProps {
  upg: CharityVolunteerUpgrade;
  rerender: () => void;
  member: CharityVolunteer;
}

function UpgradeButton(props: IUpgradeButtonProps): React.ReactElement {
  const charity = useCharityORG();
  function onClick(): void {
    props.member.buyUpgrade(props.upg);
    props.rerender();
  }
  return (
    <Tooltip title={<Typography dangerouslySetInnerHTML={{ __html: props.upg.desc }} />}>
      <span>
        <Button onClick={onClick} sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          <Typography sx={{ display: "block" }}>{props.upg.name}</Typography>
          <Money money={charity.getUpgradeCost(props.upg)} />
        </Button>
      </span>
    </Tooltip>
  );
}

interface IPanelProps {
  member: CharityVolunteer;
}

function CharityVolunteerUpgradePanel(props: IPanelProps): React.ReactElement {
  const charity = useCharityORG();
  const rerender = useRerender();
  const [currentCategory, setCurrentCategory] = useState("Tools");
  const classes = useStyles();
  useRerender(200);

  function filterUpgrades(list: string[], type: UpgradeType): CharityVolunteerUpgrade[] {
    return Object.keys(CharityVolunteerUpgrades)
      .filter((upgName: string) => {
        const upg = CharityVolunteerUpgrades[upgName];
        if (charity.bank < charity.getUpgradeCost(upg)) return false;
        if (upg.type !== type) return false;
        if (list.includes(upgName)) return false;
        return true;
      })
      .map((upgName: string) => CharityVolunteerUpgrades[upgName]);
  }

  const onChange = (event: SelectChangeEvent): void => {
    setCurrentCategory(event.target.value);
    rerender();
  };

  const toolsUpgrades = filterUpgrades(props.member.upgrades, UpgradeType.Tools);
  const shoesUpgrades = filterUpgrades(props.member.upgrades, UpgradeType.Shoes);
  const suitsUpgrades = filterUpgrades(props.member.upgrades, UpgradeType.Suits);
  const selfDefenceUpgrades = filterUpgrades(props.member.upgrades, UpgradeType.SelfDefence);
  const practiceUpgrades = filterUpgrades(props.member.upgrades, UpgradeType.Practice);
  const undergroundUpgrades = filterUpgrades(props.member.upgrades, UpgradeType.Underground);

  const categories: Record<string, (CharityVolunteerUpgrade[] | UpgradeType)[]> = {
    Tools: [toolsUpgrades, UpgradeType.Tools],
    Shoes: [shoesUpgrades, UpgradeType.Shoes],
    Suits: [suitsUpgrades, UpgradeType.Suits],
    SelfDefence: [selfDefenceUpgrades, UpgradeType.SelfDefence],
    Practice: [practiceUpgrades, UpgradeType.Practice],
    Underground: [undergroundUpgrades, UpgradeType.Underground],
  };

  const asc = {
    hack: props.member.calculateAscensionMult(props.member.hack_asc_points),
    str: props.member.calculateAscensionMult(props.member.str_asc_points),
    def: props.member.calculateAscensionMult(props.member.def_asc_points),
    dex: props.member.calculateAscensionMult(props.member.dex_asc_points),
    agi: props.member.calculateAscensionMult(props.member.agi_asc_points),
    cha: props.member.calculateAscensionMult(props.member.cha_asc_points),
  };

  function exportStat(name: string, num: number, xp: number, color: string): React.ReactElement {
    return (
      <>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="left" sx={{ color: color }}>
            {name}
          </Typography>
        </TableCell>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="right" sx={{ color: color }}>
            {formatSkill(num)}
          </Typography>
        </TableCell>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="right" sx={{ color: color }}>
            {"(" + formatNumber(xp) + ")"}
          </Typography>
        </TableCell>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="right" sx={{ color: color }}>
            {"exp"}
          </Typography>
        </TableCell>
      </>
    );
  }

  return (
    <Paper>
      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr", m: 1, gap: 1 }}>
        <span>
          <Table sx={{ style: "flex", display: "table", width: "100%", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            <TableBody>
              <Tooltip
                title={
                  <Typography>
                    Hk: x{formatMultiplier(props.member.hack_mult * asc.hack)}(x
                    {formatMultiplier(props.member.hack_mult)} Eq, x{formatMultiplier(asc.hack)} Asc)
                  </Typography>
                }
              >
                <TableRow>
                  {exportStat("Hacking", props.member.hack, props.member.hack_exp, Settings.theme.hack)}
                </TableRow>
              </Tooltip>

              <Tooltip
                title={
                  <Typography>
                    St: x{formatMultiplier(props.member.str_mult * asc.str)}
                    (x{formatMultiplier(props.member.str_mult)} Eq, x{formatMultiplier(asc.str)} Asc)
                  </Typography>
                }
              >
                <TableRow>
                  {exportStat("Strength", props.member.str, props.member.str_exp, Settings.theme.combat)}
                </TableRow>
              </Tooltip>

              <Tooltip
                title={
                  <Typography>
                    Df: x{formatMultiplier(props.member.def_mult * asc.def)}
                    (x{formatMultiplier(props.member.def_mult)} Eq, x{formatMultiplier(asc.def)} Asc)
                  </Typography>
                }
              >
                <TableRow>
                  {exportStat("Defence", props.member.def, props.member.def_exp, Settings.theme.combat)}
                </TableRow>
              </Tooltip>

              <Tooltip
                title={
                  <Typography>
                    Dx: x{formatMultiplier(props.member.dex_mult * asc.dex)}
                    (x{formatMultiplier(props.member.dex_mult)} Eq, x{formatMultiplier(asc.dex)} Asc)
                  </Typography>
                }
              >
                <TableRow>
                  {exportStat("Dexterity", props.member.dex, props.member.dex_exp, Settings.theme.combat)}
                </TableRow>
              </Tooltip>

              <Tooltip
                title={
                  <Typography>
                    Ag: x{formatMultiplier(props.member.agi_mult * asc.agi)}
                    (x{formatMultiplier(props.member.agi_mult)} Eq, x{formatMultiplier(asc.agi)} Asc)
                  </Typography>
                }
              >
                <TableRow>
                  {exportStat("Agility", props.member.agi, props.member.agi_exp, Settings.theme.combat)}
                </TableRow>
              </Tooltip>

              <Tooltip
                title={
                  <Typography>
                    Ch: x{formatMultiplier(props.member.cha_mult * asc.cha)}
                    (x{formatMultiplier(props.member.cha_mult)} Eq, x{formatMultiplier(asc.cha)} Asc)
                  </Typography>
                }
              >
                <TableRow>
                  {exportStat("Charisma", props.member.cha, props.member.cha_exp, Settings.theme.cha)}
                </TableRow>
              </Tooltip>
            </TableBody>
          </Table>
        </span>

        <span>
          <Select onChange={onChange} value={currentCategory} sx={{ width: "100%", mb: 1 }}>
            {Object.keys(categories).map((k, i) => (
              <MenuItem key={i + 1} value={k}>
                <Typography variant="h6">{k}</Typography>
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ width: "100%" }}>
            {(categories[currentCategory][0] as CharityVolunteerUpgrade[]).length === 0 && (
              <Typography>All upgrades owned!</Typography>
            )}
            <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
              {(categories[currentCategory][0] as CharityVolunteerUpgrade[]).map((upg) => (
                <UpgradeButton key={upg.name} rerender={rerender} member={props.member} upg={upg} />
              ))}
            </Box>
            <NextReveal type={categories[currentCategory][1] as UpgradeType} upgrades={props.member.upgrades} />
          </Box>
        </span>
      </Box>

      <Typography sx={{ mx: 1 }}>Purchased Upgrades: </Typography>
      <Box display="grid" sx={{ gridTemplateColumns: "repeat(4, 1fr)", m: 1 }}>
        {props.member.upgrades.map((upg: string) => (
          <PurchasedUpgrade key={upg} upgName={upg} />
        ))}
      </Box>
    </Paper>
  );
}

/** React Component for the popup that manages charity volunteer upgrades */
export function EquipmentsSubpage(): React.ReactElement {
  const charity = useCharityORG();
  const [filter, setFilter] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFilter(event.target.value.toLowerCase());
  };

  const members = charity.volunteers.filter((member) => member && member.name.toLowerCase().includes(filter));

  return (
    <>
      <TextField
        value={filter}
        onChange={handleFilterChange}
        autoFocus
        InputProps={{
          startAdornment: <SearchIcon />,
          spellCheck: false,
        }}
        placeholder="Filter by member name"
        sx={{ m: 1, width: "15%" }}
      />

      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr", width: "100%" }}>
        {members.map((member: CharityVolunteer) => (
          <CharityVolunteerUpgradePanel key={member.name} member={member} />
        ))}
      </Box>
    </>
  );
}
