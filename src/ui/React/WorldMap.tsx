import React from "react";
import { Tooltip, Typography } from "@mui/material";
import { CityName } from "@enums";

interface ICityProps {
  currentCity: CityName;
  city: CityName;
  onTravel: (city: CityName) => void;
}

function City(props: ICityProps): React.ReactElement {
  if (props.city !== props.currentCity) {
    return (
      <Tooltip title={<Typography>{props.city}</Typography>}>
        <Typography
          component="span"
          onClick={() => props.onTravel(props.city)}
          sx={{ color: (theme) => theme.colors.maplocation, lineHeight: "1em", whiteSpace: "pre", cursor: "pointer" }}
        >
          {props.city[0]}
        </Typography>
      </Tooltip>
    );
  }
  return (
    <Typography component="span" sx={{ color: (theme) => theme.colors.disabled, lineHeight: "1em", whiteSpace: "pre" }}>
      {props.city[0]}
    </Typography>
  );
}

interface IProps {
  currentCity: CityName;
  onTravel: (city: CityName) => void;
}

export function WorldMap(props: IProps): React.ReactElement {
  // prettier-ignore
  return (
    <>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>               ,_   .  ._. _.  .</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>           , _-\','|~\~      ~/      ;-'_   _-'     ,;_;_,    ~~-</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  /~~-\_/-'~'--' \~~| ',    ,'      /  / ~|-_\_/~/~      ~~--~~~~'--_</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  /              ,/'-/~ '\ ,' _  , '<City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Volhaven} />,'|~                   ._/-, /~</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  ~/-'~\_,       '-,| '|. '   ~  ,\ /'~                /    /_  /~</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>.-~      '|        '',\~|\       _\~     ,_  ,     <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Chongqing} />         /,</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>          '\     <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Sector12} />  /'~          |_/~\\,-,~  \ "         ,_,/ |</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>           |       /            ._-~'\_ _~|              \ ) <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.NewTokyo} /></Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>            \   __-\           '/      ~ |\  \_          /  ~</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>  .,         '\ |,  ~-_      - |          \\_' ~|  /\  \~ ,</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>               ~-_'  _;       '\           '-,   \,' /\/  |</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                 '\_,~'\_       \_ _,       /'    '  |, /|'</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                   /     \_       ~ |      /         \  ~'; -,_.</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                   |       ~\        |    |  ,        '-_, ,; ~ ~\</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    \,   <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Aevum} />  /        \    / /|            ,-, ,   -,</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                     |    ,/          |  |' |/          ,-   ~ \   '.</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    ,|   ,/           \ ,/              \   <City onTravel={props.onTravel} currentCity={props.currentCity} city={CityName.Ishima} />   |</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    /    |             ~                 -~~-, /   _</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    | ,-'                                    ~    /</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    / ,'                                      ~</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                    ',|  ~</Typography>
        <Typography sx={{lineHeight: '1em',whiteSpace: 'pre'}}>                      ~'</Typography>
    </>
  );
}
