import React, { useState } from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  generateContract,
  generateRandomContract,
  generateRandomContractOnHome,
} from "../../CodingContract/ContractGenerator";
import { CodingContractName } from "@enums";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";
import { getEnumHelper } from "../../utils/EnumHelper";

export function CodingContractsDev(): React.ReactElement {
  const [codingcontract, setCodingcontract] = useState(CodingContractName.FindLargestPrimeFactor);
  function setCodingcontractDropdown(event: SelectChangeEvent): void {
    const value = event.target.value;
    if (!getEnumHelper("CodingContractName").isMember(value)) {
      return;
    }
    setCodingcontract(value);
  }

  function specificContract(): void {
    generateContract({
      problemType: codingcontract,
      server: "home",
    });
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_CodingContractsDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Coding Contracts</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Button onClick={generateRandomContract}>Generate Random Contract</Button>
                <Button onClick={generateRandomContractOnHome}>Generate Random Contract on Home Comp</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Select onChange={setCodingcontractDropdown} value={codingcontract}>
                  {Object.values(CodingContractName).map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                <Button onClick={specificContract}>Generate Specified Contract Type on Home Comp</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
