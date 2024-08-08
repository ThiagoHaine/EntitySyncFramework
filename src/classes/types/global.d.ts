import { IDictionary } from "../../interface/IDictionary";
import { Constructor } from "./types/global";

declare global{
    var dictionary:Constructor<IDictionary>
};