import React, { useEffect, useRef, useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Companies as AllCompanies } from "../../Company/Companies";
import MenuItem from "@mui/material/MenuItem";
import { Adjuster } from "./Adjuster";
import { LocationName } from "../../data/Enums";
import { getEnumHelper } from "../../utils/helpers/enum";
import { Company } from "../../Company/Company";

const bigNumber = 1e12;

export function Companies(): React.ReactElement {
  const [companyName, setCompanyName] = useState(LocationName.NewTokyoNoodleBar);
  const companyRef = useRef<Company>(AllCompanies[LocationName.NewTokyoNoodleBar] as Company);
  useEffect(() => {
    const newCompany = AllCompanies[companyName];
    if (newCompany) companyRef.current = newCompany;
  }, [companyName]);

  function setCompanyDropdown(event: SelectChangeEvent): void {
    setCompanyName(getEnumHelper(LocationName).fuzzyMatch(event.target.value));
  }
  const resetCompanyRep = () => (companyRef.current.playerReputation = 0);

  function modifyCompanyRep(modifier: number): (x: number) => void {
    return function (reputation: number): void {
      if (!isNaN(reputation)) companyRef.current.playerReputation += reputation * modifier;
    };
  }

  function modifyCompanyFavor(modifier: number): (x: number) => void {
    return function (favor: number): void {
      if (!isNaN(favor)) companyRef.current.favor += favor * modifier;
    };
  }

  const resetCompanyFavor = () => (companyRef.current.favor = 0);

  function tonsOfRepCompanies(): void {
    for (const company of Object.values(AllCompanies)) company.playerReputation = bigNumber;
  }

  function resetAllRepCompanies(): void {
    for (const company of Object.values(AllCompanies)) company.playerReputation = 0;
  }

  function tonsOfFavorCompanies(): void {
    for (const company of Object.values(AllCompanies)) company.favor = bigNumber;
  }

  function resetAllFavorCompanies(): void {
    for (const company of Object.values(AllCompanies)) company.favor = 0;
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Companies</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Company:</Typography>
              </td>
              <td colSpan={3}>
                <Select id="dev-companies-dropdown" onChange={setCompanyDropdown} value={companyName}>
                  {Object.values(AllCompanies).map((company) => (
                    <MenuItem key={company.name} value={company.name}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Reputation:</Typography>
              </td>
              <td>
                <Adjuster
                  label="reputation"
                  placeholder="amt"
                  tons={() => modifyCompanyRep(1)(bigNumber)}
                  add={modifyCompanyRep(1)}
                  subtract={modifyCompanyRep(-1)}
                  reset={resetCompanyRep}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Favor:</Typography>
              </td>
              <td>
                <Adjuster
                  label="favor"
                  placeholder="amt"
                  tons={() => modifyCompanyFavor(1)(2000)}
                  add={modifyCompanyFavor(1)}
                  subtract={modifyCompanyFavor(-1)}
                  reset={resetCompanyFavor}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>All Reputation:</Typography>
              </td>
              <td>
                <Button onClick={tonsOfRepCompanies}>Tons</Button>
                <Button onClick={resetAllRepCompanies}>Reset</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>All Favor:</Typography>
              </td>
              <td>
                <Button onClick={tonsOfFavorCompanies}>Tons</Button>
                <Button onClick={resetAllFavorCompanies}>Reset</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
