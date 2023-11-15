import React, { useState } from "react";
import { CharityORGMemberCard } from "./CharityORGMemberCard";
import { RecruitButton } from "./RecruitButton";
import { useCharityORG } from "./Context";

import { Box, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { CharityVolunteer } from "../CharityVolunteer";
import { OptionSwitch } from "../../ui/React/OptionSwitch";

/** React Component for the list of gang members on the management subpage. */
export function CharityORGMemberList(): React.ReactElement {
  const charityORG = useCharityORG();
  const setRerender = useState(false)[1];
  const [filter, setFilter] = useState("");
  const [ascendOnly, setAscendOnly] = useState(false);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFilter(event.target.value.toLowerCase());
  };

  const members = charityORG.volunteers
    .filter((member) => member && member.name.toLowerCase().includes(filter))
    .filter((member) => {
      if (ascendOnly) return member.canAscend();
      return true;
    });

  return (
    <>
      <RecruitButton onRecruit={() => setRerender((old) => !old)} />
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
      <OptionSwitch
        checked={ascendOnly}
        onChange={(newValue) => setAscendOnly(newValue)}
        text="Show only ascendable"
        tooltip={<>Filter the members list by whether or not the volunteer can be ascended.</>}
      />
      <Box display="grid" sx={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {members.map((member: CharityVolunteer) => (
          <CharityORGMemberCard key={member.name} member={member} />
        ))}
      </Box>
    </>
  );
}
