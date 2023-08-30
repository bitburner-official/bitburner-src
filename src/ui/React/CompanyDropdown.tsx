import type { CompanyName } from "../../Enums";

import React from "react";

import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { Companies } from "../../Company/Companies";
import { getRecordKeys } from "../../Types/Record";

interface IProps {
  purchase: () => void;
  canPurchase: boolean;
  onChange: (event: SelectChangeEvent<CompanyName>) => void;
  value: CompanyName;
}

const sortedCompanies = getRecordKeys(Companies).sort((a, b) => a.localeCompare(b));

export function CompanyDropdown(props: IProps): React.ReactElement {
  const companies = [];
  for (const company of sortedCompanies) {
    companies.push(
      <MenuItem key={company} value={company}>
        {company}
      </MenuItem>,
    );
  }

  return (
    <Select
      startAdornment={
        <Button onClick={props.purchase} disabled={!props.canPurchase}>
          Buy
        </Button>
      }
      sx={{ mx: 1 }}
      value={props.value}
      onChange={props.onChange}
    >
      {companies}
    </Select>
  );
}
