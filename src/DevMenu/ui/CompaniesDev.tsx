import React, { useMemo, useState } from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { CompanyName } from "@enums";
import { Companies } from "../../Company/Companies";
import { Adjuster } from "./Adjuster";
import { getEnumHelper } from "../../utils/EnumHelper";
import { getRecordValues } from "../../Types/Record";
import { MaxFavor } from "../../Faction/formulas/favor";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

const largeAmountOfReputation = 1e12;

export function CompaniesDev(): React.ReactElement {
  const [companyName, setCompanyName] = useState(CompanyName.ECorp);
  const companies = useMemo<CompanyName[]>(() => {
    return getRecordValues(Companies).map((company) => company.name);
  }, []);

  function resetCompanyRep(): void {
    Companies[companyName].playerReputation = 0;
  }

  function modifyCompanyRep(modifier: number): (x: number) => void {
    return function (reputation: number): void {
      const company = Companies[companyName];
      if (!isNaN(reputation)) {
        company.playerReputation += reputation * modifier;
      }
    };
  }

  function modifyCompanyFavor(modifier: number): (x: number) => void {
    return function (favor: number): void {
      const company = Companies[companyName];
      if (!isNaN(favor)) {
        company.setFavor(company.favor + favor * modifier);
      }
    };
  }

  function resetCompanyFavor(): void {
    Companies[companyName].setFavor(0);
  }

  function tonsOfRepCompanies(): void {
    for (const company of getRecordValues(Companies)) {
      company.playerReputation = largeAmountOfReputation;
    }
  }

  function resetAllRepCompanies(): void {
    for (const company of getRecordValues(Companies)) {
      company.playerReputation = 0;
    }
  }

  function tonsOfFavorCompanies(): void {
    for (const company of getRecordValues(Companies)) {
      company.setFavor(MaxFavor);
    }
  }

  function resetAllFavorCompanies(): void {
    for (const company of getRecordValues(Companies)) {
      company.setFavor(0);
    }
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_CompaniesDev" unmountOnExit={true}>
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
                <Autocomplete
                  style={{ width: "350px" }}
                  options={companies}
                  value={companyName}
                  renderInput={(params) => <TextField {...params} />}
                  onChange={(_, companyName) => {
                    if (!companyName || !getEnumHelper("CompanyName").isMember(companyName)) {
                      return;
                    }
                    setCompanyName(companyName);
                  }}
                ></Autocomplete>
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
                  tons={() => modifyCompanyRep(1)(largeAmountOfReputation)}
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
    </AutoExpandAccordion>
  );
}
