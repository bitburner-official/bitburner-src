import { registerPage } from "../ui/root";
import servers from "!!raw-loader!./servers.md";
import learn from "!!raw-loader!./learn_to_program.md";
import v1migration from "!!raw-loader!./v1.0.0_migration_guide.md";
import v2migration from "!!raw-loader!./v2.0.0_migration_guide.md";

export const registerPages = () => {
  registerPage("servers", servers);
  registerPage("learn", learn);
  registerPage("v1migration", v1migration);
  registerPage("v2migration", v2migration);
};
