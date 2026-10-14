import React from "react";

import { SvgIconProps } from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer"; // Hacking accordion
import LastPageIcon from "@mui/icons-material/LastPage"; // Terminal
import CreateIcon from "@mui/icons-material/Create"; // Create Script
import StorageIcon from "@mui/icons-material/Storage"; // Active Scripts
import BugReportIcon from "@mui/icons-material/BugReport"; // Create Program
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard"; // Stanek + Dev
import AccountBoxIcon from "@mui/icons-material/AccountBox"; // Character accordion
import EqualizerIcon from "@mui/icons-material/Equalizer"; // Stats
import ContactsIcon from "@mui/icons-material/Contacts"; // Factions
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow"; // Augmentations
import AccountTreeIcon from "@mui/icons-material/AccountTree"; // Hacknet
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"; // Sleeves
import BiotechIcon from "@mui/icons-material/Biotech"; // Grafting
import PublicIcon from "@mui/icons-material/Public"; // World accordion
import LocationCityIcon from "@mui/icons-material/LocationCity"; // City
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive"; // Travel
import WorkIcon from "@mui/icons-material/Work"; // Job
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // Stock Market
import FormatBoldIcon from "@mui/icons-material/FormatBold"; // Bladeburner
import BusinessIcon from "@mui/icons-material/Business"; // Corp
import SportsMmaIcon from "@mui/icons-material/SportsMma"; // Gang
import BorderInnerSharpIcon from "@mui/icons-material/BorderInnerSharp"; // IPvGO
import ShareIcon from "@mui/icons-material/Share"; // DarkWeb
import LiveHelpIcon from "@mui/icons-material/LiveHelp"; // Help accordion
import CheckIcon from "@mui/icons-material/Check"; // Milestones
import HelpIcon from "@mui/icons-material/Help"; // Documentation
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Achievements
import SettingsIcon from "@mui/icons-material/Settings"; // Options

const icons: Record<string, React.ComponentType<SvgIconProps>> = {
  // Sidebar icons
  "hacking-accordion": ComputerIcon,
  terminal: LastPageIcon,
  "create-script": CreateIcon,
  "active-scripts": StorageIcon,
  "create-program": BugReportIcon,
  stanek: DeveloperBoardIcon,
  "character-accordion": AccountBoxIcon,
  stats: EqualizerIcon,
  factions: ContactsIcon,
  augmentations: DoubleArrowIcon,
  hacknet: AccountTreeIcon,
  sleeves: PeopleAltIcon,
  grafting: BiotechIcon,
  "world-accordion": PublicIcon,
  city: LocationCityIcon,
  travel: AirplanemodeActiveIcon,
  job: WorkIcon,
  "stock-market": TrendingUpIcon,
  bladeburner: FormatBoldIcon,
  corporation: BusinessIcon,
  gang: SportsMmaIcon,
  ipvgo: BorderInnerSharpIcon,
  darknet: ShareIcon,
  "help-accordion": LiveHelpIcon,
  milestones: CheckIcon,
  documentation: HelpIcon,
  achievements: EmojiEventsIcon,
  options: SettingsIcon,
};

export function Icon({ name }: { name?: string }): React.ReactElement | null {
  const Component = name ? icons[name] : undefined;
  return Component ? (
    <Component
      sx={{
        verticalAlign: "middle",
        ...(name === "augmentations" && { transform: "rotate(-90deg)" }),
        fontSize: "max(1em, 20px)",
      }}
    />
  ) : null;
}

export const icon = {
  icon: Icon,
};
