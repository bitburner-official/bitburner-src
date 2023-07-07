import React, { useContext, useState } from "react";

import Button from "@mui/material/Button";
import { ConfirmationModal } from "../../ui/React/ConfirmationModal";
import { MD } from "../../ui/MD/MD";

import { Root, getPage } from "./root";

interface IProps {
  reactivateTutorial: () => void;
}

interface Navigator {
  navigate: (s: string) => void;
}

export const Context = {
  Navigator: React.createContext<Navigator>({ navigate: () => undefined }),
};

export const useNavigator = (): Navigator => useContext(Context.Navigator);

export function DocumentationRoot(props: IProps): React.ReactElement {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [page, setPage] = useState(Root);
  const navigator = {
    navigate(title: string) {
      setPage(getPage(title));
    },
  };
  return (
    <>
      <Button onClick={() => setConfirmResetOpen(true)}>Soft reset and Restart tutorial</Button>
      <ConfirmationModal
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={props.reactivateTutorial}
        confirmationText={"This will reset all your stats to 1 and money to 1k. Are you sure?"}
      />
      <Context.Navigator.Provider value={navigator}>
        <MD md={page.content + ""} />
      </Context.Navigator.Provider>
    </>
  );
}
