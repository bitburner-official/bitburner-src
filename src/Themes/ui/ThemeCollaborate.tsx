import React from "react";
import Typography from "@mui/material/Typography";
import { Link } from "@mui/material";

export function ThemeCollaborate(): React.ReactElement {
  return (
    <>
      <Typography sx={{ my: 1 }}>
        如果你自己创建了主题，并且认为它应该被收录到游戏的主题浏览器中，欢迎{" "}
        <Link
          href="https://github.com/bitburner-official/bitburner-src/blob/stable/src/Themes/README.md"
          target="_blank"
        >
          提交 pull request
        </Link>
        。
      </Typography>
      <Typography sx={{ my: 1 }}>
        前往{" "}
        <Link href="https://discord.com/channels/415207508303544321/921991895230611466" target="_blank">
          theme-sharing
        </Link>{" "}
        Discord 频道了解更多。
      </Typography>
    </>
  );
}
