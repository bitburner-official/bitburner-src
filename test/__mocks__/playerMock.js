import { setPlayer } from "@player";
import { CityName, LocationName } from "@enums";
import { defaultMultipliers } from "../../src/PersonObjects/Multipliers";

export default function createMockPlayer(playerMocks) {
  const player = {
    achievements: [],
    applyEntropy() {
      return false;
    },
    applyForAgentJob() {
      return false;
    },
    applyForBusinessConsultantJob() {
      return false;
    },
    applyForBusinessJob() {
      return false;
    },
    applyForEmployeeJob() {
      return false;
    },
    applyForItJob() {
      return false;
    },
    applyForJob() {
      return false;
    },
    applyForNetworkEngineerJob() {
      return false;
    },
    applyForPartTimeEmployeeJob() {
      return false;
    },
    applyForPartTimeWaiterJob() {
      return false;
    },
    applyForSecurityEngineerJob() {
      return false;
    },
    applyForSecurityJob() {
      return false;
    },
    applyForSoftwareConsultantJob() {
      return false;
    },
    applyForSoftwareJob() {
      return false;
    },
    applyForWaiterJob() {
      return false;
    },
    augmentations: [],
    bitNodeN: 0,
    bladeburner: undefined,
    calculateSkill() {
      return 0;
    },
    calculateSkillProgress() {
      return undefined;
    },
    canAccessBladeburner() {
      return false;
    },
    canAccessCorporation() {
      return false;
    },
    canAccessCotMG() {
      return false;
    },
    canAccessGang() {
      return false;
    },
    canAccessGrafting() {
      return false;
    },
    canAfford(cost) {
      return false;
    },
    checkForFactionInvitations() {
      return [];
    },
    corporation: undefined,
    createHacknetServer() {
      return undefined;
    },
    currentServer: "",
    currentWork: undefined,
    exploits: [],
    factionInvitations: [],
    finishWork() {},
    focus: false,
    focusPenalty() {
      return 0;
    },
    gainAgilityExp() {},
    gainCharismaExp() {},
    gainCodingContractReward() {
      return "";
    },
    gainDefenseExp() {},
    gainDexterityExp() {},
    gainHackingExp() {},
    gainIntelligenceExp() {},
    gainMoney() {},
    gainStats() {},
    gainStrengthExp() {},
    gang: undefined,
    getCasinoWinnings() {
      return 0;
    },
    getCurrentServer() {
      return undefined;
    },
    getGangFaction() {
      return undefined;
    },
    getGangName() {
      return "";
    },
    getHomeComputer() {
      return undefined;
    },
    getNextCompanyPosition() {
      return undefined;
    },
    getUpgradeHomeCoresCost() {
      return 0;
    },
    getUpgradeHomeRamCost() {
      return 0;
    },
    giveAchievement() {},
    giveExploit(exploit) {},
    gotoLocation(to) {
      return false;
    },
    hacknetNodes: [],
    has4SData: false,
    has4SDataTixApi: false,
    hasAugmentation(augName, ignoreQueued) {
      return undefined;
    },
    hasGangWith(facNameName) {
      return false;
    },
    hasJob() {
      return false;
    },
    hasProgram(programName) {
      return false;
    },
    hasTixApiAccess: false,
    hasTorRouter() {
      return false;
    },
    hasWseAccount: false,
    hashManager: undefined,
    hospitalize() {
      return 0;
    },
    identifier: "",
    inGang() {
      return undefined;
    },
    init() {},
    isAwareOfGang() {
      return false;
    },
    isQualified(company, position) {
      return false;
    },
    karma: 0,
    lastAugReset: 0,
    lastNodeReset: 0,
    lastSave: 0,
    lastUpdate: 0,
    loseMoney(money, source) {},
    moneySourceA: undefined,
    moneySourceB: undefined,
    playtimeSinceLastAug: 0,
    playtimeSinceLastBitnode: 0,
    prestigeAugmentation() {},
    prestigeSourceFile() {},
    processWork(cycles) {},
    purchasedServers: [],
    queryStatFromString(str) {
      return 0;
    },
    queueAugmentation(name) {},
    queuedAugmentations: [],
    quitJob(companyName) {},
    reapplyAllAugmentations(resetMultipliers) {},
    reapplyAllSourceFiles() {},
    receiveInvite(factionNameName) {},
    recordMoneySource(amt, source) {},
    regenerateHp(amt) {},
    scriptProdSinceLastAug: 0,
    setBitNodeNumber(n) {},
    setMoney(money) {},
    sleeves: [],
    sleevesFromCovenant: 0,
    sourceFileLvl(n) {
      return 0;
    },
    sourceFiles: undefined,
    startBladeburner() {},
    startCorporation(corpName, seedFunded) {},
    startFocusing() {},
    startGang(factionNameName, hacking) {},
    startWork(w: Work) {},
    stopFocusing() {},
    takeDamage(amt) {
      return false;
    },
    terminalCommandHistory: [],
    travel(to) {
      return false;
    },
    updateSkillLevels() {},
    resetMultipliers() {},
    toJSON() {
      return undefined;
    },
    whoAmI() {
      return "";
    },
    // Person
    hp: { current: 0, max: 0 },
    skills: { hacking: 0, strength: 0, defense: 0, dexterity: 0, agility: 0, charisma: 0, intelligence: 0 },
    exp: { hacking: 0, strength: 0, defense: 0, dexterity: 0, agility: 0, charisma: 0, intelligence: 0 },
    mults: defaultMultipliers(),
    city: CityName.Sector12,
    // Player-specific
    numPeopleKilled: 0,
    money: 0,
    location: LocationName.TravelAgency,
    totalPlaytime: 0,
    jobs: {},
    factions: [],
    entropy: 0,
  };

  return setPlayer(player);
}
