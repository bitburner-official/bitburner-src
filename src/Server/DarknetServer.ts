import { IConstructorParams, Server } from "./Server";
import { DnetServer } from "../DarkNet/models/DarknetServerData";

export class DarknetServer extends Server {
  override darknetData: DnetServer;

  constructor(props: IConstructorParams & { darknetData: DnetServer }) {
    super(props);
    this.darknetData = props.darknetData;
  }
}
