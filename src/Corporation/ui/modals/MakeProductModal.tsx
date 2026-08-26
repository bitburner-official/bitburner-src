import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { IndustriesData } from "../../data/IndustryData";
import { IndustryType } from "@enums";
import * as actions from "../../Actions";
import { useCorporation, useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { KEY } from "../../../utils/KeyboardEventKey";
import { NumberInput } from "../../../ui/React/NumberInput";
import { CityName } from "@enums";
import { getRecordKeys } from "../../../Types/Record";

interface IProps {
  open: boolean;
  onClose: () => void;
}

function productPlaceholder(type: string): string {
  if (type === IndustryType.Restaurant) {
    return "餐厅名称";
  } else if (type === IndustryType.Healthcare) {
    return "医院名称";
  } else if (type === IndustryType.RealEstate) {
    return "地产项目名称";
  }
  return "产品名称";
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
  const data = IndustriesData[division.industry];
  if (division.hasMaximumNumberProducts() || !data.product) return <></>;

  function makeProduct(): void {
    if (isNaN(design) || isNaN(marketing)) return;
    try {
      actions.makeProduct(corp, division, city, name, design, marketing);
    } catch (error) {
      dialogBoxCreate(String(error));
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
        要开始开发产品，请先选择进行设计的城市。所选城市员工的属性会影响成品的各种特性，例如质量、性能和耐久度。
        <br />
        <br />
        你还可以选择投入资金用于产品设计和市场营销。投资设计会带来更优秀的产品；为产品营销投入资金则有助于提升产品的销量。
      </Typography>
      <Select style={{ margin: "5px" }} onChange={onCityChange} defaultValue={city}>
        {availableCities.map((cityName: string) => (
          <MenuItem key={cityName} value={cityName}>
            {cityName}
          </MenuItem>
        ))}
      </Select>
      <TextField onChange={onProductNameChange} placeholder={productPlaceholder(division.industry)} />
      <br />
      <NumberInput onChange={setDesign} autoFocus={true} placeholder={"设计投资"} />
      <NumberInput onChange={setMarketing} onKeyDown={onKeyDown} placeholder={"营销投资"} />
      <Button onClick={makeProduct}>开发产品</Button>
    </Modal>
  );
}
