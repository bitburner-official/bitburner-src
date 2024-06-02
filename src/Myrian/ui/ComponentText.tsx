import React from "react";
import { Component } from "@enums";
import { getComponentColor } from "./common";

interface IComponent {
  component: Component;
}

export const ComponentText = ({ component }: IComponent): React.ReactElement => (
  <span style={{ color: getComponentColor(component) }}>
    {component}
    <br />
  </span>
);
