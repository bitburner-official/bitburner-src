/**
 * Creates a dropdown (select HTML element) with company names as options
 */
import React from "react";
import { companiesMetadata } from "../../Company/data/CompaniesMetadata";

import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

interface IProps {
  purchase: () => void;
  canPurchase: boolean;
  onChange: (event: SelectChangeEvent<string>) => void;
  value: string;
}

export function CompanyDropdown(props: IProps): React.ReactElement {

  const companies = [];
  for (const company of companiesMetadata.sort((a, b) => a.name.localeCompare(b.name))) {
    companies.push(
      <MenuItem key={company.name} value={company.name}>
        {company.name}
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
