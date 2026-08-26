import React from "react";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PaletteSharpIcon from "@mui/icons-material/PaletteSharp";
import { Settings } from "../../Settings/Settings";
import { IPredefinedTheme } from "../Themes";
import { Link, Card, CardHeader, CardContent, CardMedia, Button } from "@mui/material";

interface IProps {
  theme: IPredefinedTheme;
  onActivated: () => void;
  onImageClick: (src: string) => void;
}

export function ThemeEntry({ theme, onActivated, onImageClick }: IProps): React.ReactElement {
  if (!theme) return <></>;
  return (
    <Card key={theme.screenshot} sx={{ width: 400, mr: 1, mb: 1 }}>
      <CardHeader
        action={
          <Tooltip title="使用此主题">
            <Button startIcon={<PaletteSharpIcon />} onClick={onActivated} variant="outlined">
              使用
            </Button>
          </Tooltip>
        }
        title={theme.name}
        subheader={
          <>
            作者：{theme.credit}{" "}
            {theme.reference && (
              <>
                （
                <Link href={theme.reference} target="_blank">
                  参考
                </Link>
                ）
              </>
            )}
          </>
        }
        sx={{
          color: Settings.theme.primary,
          "& .MuiCardHeader-subheader": {
            color: Settings.theme.secondarydark,
          },
          "& .MuiButton-outlined": {
            backgroundColor: "transparent",
          },
        }}
      />
      <CardMedia
        component="img"
        width="400"
        image={theme.screenshot}
        alt={`“${theme.name}”的主题截图`}
        sx={{
          borderTop: `1px solid ${Settings.theme.welllight}`,
          borderBottom: `1px solid ${Settings.theme.welllight}`,
          cursor: "zoom-in",
        }}
        onClick={() => onImageClick(theme.screenshot)}
      />
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            color: Settings.theme.primarydark,
          }}
        >
          {theme.description}
        </Typography>
      </CardContent>
    </Card>
  );
}
