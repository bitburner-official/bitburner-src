import React from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { Tooltip, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { Settings } from "../../Settings/Settings";

import { CityName } from "@enums";

interface ICityProps {
  currentCity: CityName;
  city: CityName;
  onTravel: (city: CityName) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    travel: {
      color: theme.colors.maplocation,
      lineHeight: "1em",
      whiteSpace: "pre",
      cursor: "pointer",
    },
    currentCity: {
      color: theme.colors.currentcity,
      lineHeight: "1em",
      whiteSpace: "pre",
    },
  }),
);

function City(props: ICityProps): React.ReactElement {
  const classes = useStyles();
  if (props.city !== props.currentCity) {
    return (
      <Tooltip title={<Typography>{props.city}</Typography>}>
        <span onClick={() => props.onTravel(props.city)} className={classes.travel}>
          {props.city[0]}
        </span>
      </Tooltip>
    );
  }
  return <span className={classes.currentCity}>{props.city[0]}</span>;
}

interface IProps {
  currentCity: CityName;
  onTravel: (city: CityName) => void;
}

export function WorldMap(props: IProps): React.ReactElement {
  // prettier-ignore
  return (
    <>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>               ,_   .  ._. _.  .</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>           , _-\','|~\~      ~/      ;-'_   _-'     ,;_;_,    ~~-</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  /~~-\_/-'~'--' \~~| ',    ,'      /  / ~|-_\_/~/~      ~~--~~~~'--_</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  /              ,/'-/~ '\ ,' _  , '<City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Volhaven} />,'|~                   ._/-, /~</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  ~/-'~\_,       '-,| '|. '   ~  ,\ /'~                /    /_  /~</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>.-~      '|        '',\~|\       _\~     ,_  ,     <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Chongqing} />         /,</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>          '\     <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Sector12} />  /'~          |_/~\\,-,~  \ "         ,_,/ |</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>           |       /            ._-~'\_ _~|              \ ) <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.NewTokyo} /></Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>            \   __-\           '/      ~ |\  \_          /  ~</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  .,         '\ |,  ~-_      - |          \\_' ~|  /\  \~ ,</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>               ~-_'  _;       '\           '-,   \,' /\/  |</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                 '\_,~'\_       \_ _,       /'    '  |, /|'</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                   /     \_       ~ |      /         \  ~'; -,_.</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                   |       ~\        |    |  ,        '-_, ,; ~ ~\</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    \,   <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Aevum} />  /        \    / /|            ,-, ,   -,</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                     |    ,/          |  |' |/          ,-   ~ \   '.</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    ,|   ,/           \ ,/              \   <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Ishima} />   |</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    /    |             ~                 -~~-, /   _</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    | ,-'                                    ~    /</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    / ,'                                      ~</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    ',|  ~</Typography>
        <Typography color={Settings.theme.mapstatic} sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                      ~'</Typography>
    </>
  );
}
