import { Player, setPlayer } from "../../../src/Player";
import { getCompaniesMetadata } from "../../../src/Company/data/CompaniesMetadata";
import { getCompanyPositionMetadata } from "../../../src/Company/data/CompanyPositionsMetadata";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import { NetscriptSingularity } from "../../../src/NetscriptFunctions/Singularity";
import { CompanyName, JobField, JobName } from "@enums";

import { WorkerScript } from "../../../src/Netscript/WorkerScript";
import { Script } from "../../../src/Script/Script";
import { RunningScript } from "../../../src/Script/RunningScript";
import { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { GetServer } from "../../../src/Server/AllServers";

describe("Singularity", () => {
  let ctx;
  let singularity;
  let positionMetadata;
  let companyMetadata;

  beforeAll(() => {
    singularity = NetscriptSingularity();
    positionMetadata = getCompanyPositionMetadata();
    companyMetadata = getCompaniesMetadata();
  });

  beforeEach(() => {
    setPlayer(new PlayerObject());
    Player.init();
    Player.sourceFiles.set(4, 3);

    GetServer("home").writeToScriptFile("function.js", "");
    let script = new Script("function.js", "", "home");
    let runningScript = new RunningScript(script, 1, []);
    let workerScript = new WorkerScript(runningScript, 1);
    ctx = { workerScript: workerScript, function: "singularityTest", functionPath: "test.singularityTest" };
  });

  afterEach(() => {
    Object.values(CompanyName).forEach((k) => {
      companyMetadata[k].playerReputation = 0;
    });
  });

  describe("getCompanyPositionInfo", () => {
    it("returns an enum for field", () => {
      let companyWithPositions = Object.values(CompanyName).find(
        (cn) => companyMetadata[cn].companyPositions.length > 0,
      );
      let company = companyMetadata[companyWithPositions];
      let positionName = company.companyPositions[0];
      let position = positionMetadata[positionName];

      let companyPosition = singularity.getCompanyPositionInfo(ctx)(company.name, positionName);
      expect(companyPosition.field).toEqual(position.field);
    });
  });

  describe("applyToCompany", () => {
    it("throws an error if input doesn't match an enum", () => {
      let anyValidCompany = Object.values(CompanyName)[0];
      expect(() => singularity.applyToCompany(ctx)(anyValidCompany, "sockware")).toThrow("should be a JobField");
      expect(() => singularity.applyToCompany(ctx)(anyValidCompany, "invalid-job-field")).toThrow(
        "should be a JobField",
      );
    });

    it("accepts the JobField specified by getCompanyPositionInfo", () => {
      Object.values(CompanyName).forEach((cn) => {
        companyMetadata[cn].companyPositions.forEach((pn) => {
          let pos = positionMetadata[pn];
          expect(() => singularity.applyToCompany(ctx)(cn, pos.field)).not.toThrow();
          Player.quitJob(cn);
        });
      });
    });

    it("is case-insensitive to string inputs to the field parameter", () => {
      Object.values(CompanyName).forEach((cn) => {
        companyMetadata[cn].companyPositions.forEach((pn) => {
          let pos = positionMetadata[pn];
          let field = pos.field;

          let upperCase = field.toUpperCase();
          expect(() => singularity.applyToCompany(ctx)(cn, upperCase)).not.toThrow();
          Player.quitJob(cn);

          let lowerCase = field.toLowerCase();
          expect(() => singularity.applyToCompany(ctx)(cn, lowerCase)).not.toThrow();
          Player.quitJob(cn);

          let brokenCasing = field
            .split("")
            .map((c, i) => (i % 2 == 0 ? c.toUpperCase() : c.toLowerCase()))
            .join("");
          expect(() => singularity.applyToCompany(ctx)(cn, brokenCasing)).not.toThrow();
          Player.quitJob(cn);
        });
      });
    });
  });
});
