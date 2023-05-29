/**
 * Creates a dropdown (select HTML element) with company names as options
 */
import React from "react";

import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { companiesMetadata } from "../../Company/data/CompaniesMetadata";

interface IProps {
  purchase: () => void;
  canPurchase: boolean;
  onChange: (event: SelectChangeEvent) => void;
  value: string;
}

const sortedCompanies = companiesMetadata.sort((a, b) => a.name.localeCompare(b.name));

export function CompanyDropdown(props: IProps): React.ReactElement {
  const companies = [];
  for (const company of sortedCompanies) {
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
