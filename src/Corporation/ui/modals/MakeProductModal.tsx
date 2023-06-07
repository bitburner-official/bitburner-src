import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { IndustriesData } from "../../data/IndustryData";
import { IndustryType } from "../../data/Enums";
import { MakeProduct } from "../../Actions";
import { useCorporation, useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { KEY } from "../../../utils/helpers/keyCodes";
import { NumberInput } from "../../../ui/React/NumberInput";
import { CityName } from "../../../Enums";
import { getRecordKeys } from "../../../Types/Record";

interface IProps {
  open: boolean;
  onClose: () => void;
}

function productPlaceholder(type: string): string {
  if (type === IndustryType.Restaurant) {
    return "Restaurant Name";
  } else if (type === IndustryType.Healthcare) {
    return "Hospital Name";
  } else if (type === IndustryType.RealEstate) {
    return "Property Name";
  }
  return "Product Name";
}

// Create a popup that lets the player create a product for their current industry
export function MakeProductModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const availableCities = getRecordKeys(division.offices);
  const [city, setCity] = useState(availableCities.length > 0 ? availableCities[0] : CityName.Sector12);
  const [name, setName] = useState("");
  const [design, setDesign] = useState<number>(NaN);
  const [marketing, setMarketing] = useState<number>(NaN);
  const data = IndustriesData[division.type];
  if (division.hasMaximumNumberProducts() || !data.product) return <></>;

  function makeProduct(): void {
    if (isNaN(design) || isNaN(marketing)) return;
    try {
      MakeProduct(corp, division, city, name, design, marketing);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    props.onClose();
  }

  function onCityChange(event: SelectChangeEvent): void {
    setCity(event.target.value as CityName);
  }

  function onProductNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) makeProduct();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        <br />
        {data.product.desc}
        <br />
        <br />
        To begin developing a product, first choose the city in which it will be designed. The stats of your employees
        in the selected city affect the properties of the finished product, such as its quality, performance, and
        durability.
        <br />
        <br />
        You can also choose to invest money in the design and marketing of the product. Investing money in its design
        will result in a superior product. Investing money in marketing the product will help the product's sales.
      </Typography>
      <Select style={{ margin: "5px" }} onChange={onCityChange} defaultValue={city}>
        {availableCities.map((cityName: string) => (
          <MenuItem key={cityName} value={cityName}>
            {cityName}
          </MenuItem>
        ))}
      </Select>
      <TextField onChange={onProductNameChange} placeholder={productPlaceholder(division.type)} />
      <br />
      <NumberInput onChange={setDesign} autoFocus={true} placeholder={"Design investment"} />
      <NumberInput onChange={setMarketing} onKeyDown={onKeyDown} placeholder={"Marketing investment"} />
      <Button onClick={makeProduct}>Develop Product</Button>
    </Modal>
  );
}
