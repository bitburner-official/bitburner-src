import { Research } from "./Research";
import { CorpResearchName } from "@nsdefs";

// A full record ensures that every research name is present
/** A record for looking up a research object from the name */
export const ResearchMap: Record<CorpResearchName, Research> = {
  AutoBrew: new Research({
    name: "AutoBrew",
    cost: 12e3,
    desc:
      "通过注射茶水，自动让你的员工保持充足的咖啡因。" +
      "该研究会让所有员工的精力始终保持在可能的最大值，且不产生任何费用。" +
      "这同时会禁用“购买茶水”升级。",
  }),
  AutoPartyManager: new Research({
    name: "AutoPartyManager",
    cost: 15e3,
    desc:
      "自动分析员工的士气，并在检测到士气下降时进行提升。该研究会让所有员工" +
      "的士气始终保持在可能的最大值，且不产生任何费用。" +
      "这同时会禁用“举办派对”功能。",
  }),
  "Automatic Drug Administration": new Research({
    name: "Automatic Drug Administration",
    cost: 10e3,
    desc:
      "研究如何自动为所有员工服用提升表现的药物。" +
      "这会解锁与药物相关的研究。",
  }),
  "CPH4 Injections": new Research({
    name: "CPH4 Injections",
    cost: 25e3,
    desc:
      "研发一种先进无害的合成药物，给员工服用后，" +
      "除经验以外的所有属性都会提升10%。",
    employeeCreMult: 1.1,
    employeeChaMult: 1.1,
    employeeEffMult: 1.1,
    employeeIntMult: 1.1,
  }),
  Drones: new Research({
    name: "Drones",
    cost: 5e3,
    desc:
      "获得制造先进无人机所需的知识。该研究本身没有效果，" +
      "但会解锁其他与无人机相关的研究。",
  }),
  "Drones - Assembly": new Research({
    name: "Drones - Assembly",
    cost: 25e3,
    desc:
      "制造并使用装配无人机来提高生产线的效率。" +
      "这会使所有产量提高20%。",
    productionMult: 1.2,
  }),
  "Drones - Transport": new Research({
    name: "Drones - Transport",
    cost: 30e3,
    desc:
      "制造并使用智能运输无人机来优化你的仓库。" +
      "这会使所有仓库的存储空间增加50%。",
    storageMult: 1.5,
  }),
  "Go-Juice": new Research({
    name: "Go-Juice",
    cost: 25e3,
    desc:
      "为员工提供Go-Juice——一种能进一步促进大脑多巴胺分泌的茶衍生饮品。" +
      "这会使所有员工的最大精力提高10。",
  }),
  "HRBuddy-Recruitment": new Research({
    name: "HRBuddy-Recruitment",
    cost: 15e3,
    desc:
      "使用自动化软件处理员工招聘。有了该研究，" +
      "只要有空余空间，每个办事处都会在每个市场周期自动雇用一名员工。",
  }),
  "HRBuddy-Training": new Research({
    name: "HRBuddy-Training",
    cost: 20e3,
    desc:
      "使用自动化软件处理员工培训。有了该研究，" +
      "通过HRBuddy-Recruitment雇用的每名员工都会被自动分配到“实习生”岗位，而不是处于未分配状态。",
  }),
  "Hi-Tech R&D Laboratory": new Research({
    name: "Hi-Tech R&D Laboratory",
    cost: 5e3,
    desc:
      "建造一座致力于高级研究与开发的前沿设施。" +
      "这让你可以把科研点数花在强大的升级上。" +
      "它还会使全局科研点数产出提高10%。",
    sciResearchMult: 1.1,
  }),

  "Market-TA.I": new Research({
    name: "Market-TA.I",
    cost: 20e3,
    desc:
      "开发使用技术分析帮助你理解和利用市场的高级人工智能软件。" +
      "该研究让你知道应以什么价格出售材料/产品，" +
      "从而避免因加价过高而损失销量。" +
      "它还让你可以自动使用该售价。",
  }),
  "Market-TA.II": new Research({
    name: "Market-TA.II",
    cost: 50e3,
    desc:
      "开发使用技术分析帮助你理解和市场的双重强化人工智能软件。" +
      "该研究让你知道售价过高或过低时，某种材料/产品的销量会损失或增加多少。" +
      "它还让你可以自动把材料/产品的售价设为最优价格，使售出数量与生产数量相匹配。",
  }),
  Overclock: new Research({
    name: "Overclock",
    cost: 15e3,
    desc:
      "为员工配备使用经颅直流电刺激（tDCS）来加快神经递质传导速度的头戴设备。" +
      "该研究会使所有员工的智力和效率提高25%。",
    employeeEffMult: 1.25,
    employeeIntMult: 1.25,
  }),
  "Self-Correcting Assemblers": new Research({
    name: "Self-Correcting Assemblers",
    cost: 25e3,
    desc:
      "制造可用于通用生产的装配器。" +
      "这些装配器利用深度学习来提高自身的工作效率。" +
      "该研究会使所有产量提高10%。",
    productionMult: 1.1,
  }),
  "Sti.mu": new Research({
    name: "Sti.mu",
    cost: 30e3,
    desc:
      "升级tDCS头戴设备，以刺激大脑中控制自信和热情的区域。" +
      "该研究会使所有员工的最大士气提高10。",
  }),
  "uPgrade: Capacity.I": new Research({
    name: "uPgrade: Capacity.I",
    cost: 20e3,
    desc:
      "扩展该行业设计和制造各类产品的产能。" +
      "这会使该行业的最大产品数量增加1（从3增加到4）。",
  }),
  "uPgrade: Capacity.II": new Research({
    name: "uPgrade: Capacity.II",
    cost: 30e3,
    desc:
      "扩展该行业设计和制造各类产品的产能。" +
      "这会使该行业的最大产品数量增加1（从4增加到5）。",
  }),
  "uPgrade: Dashboard": new Research({
    name: "uPgrade: Dashboard",
    cost: 5e3,
    desc:
      "改进用于管理该行业各类产品生产线的软件。" +
      "这让你可以在产品设计完成之前就管理其生产和销售。",
  }),
  "uPgrade: Fulcrum": new Research({
    name: "uPgrade: Fulcrum",
    cost: 10e3,
    desc:
      "简化该行业各类产品的制造流程。" +
      "该研究会使你的产品产量提高5%。",
    productProductionMult: 1.05,
  }),
};
