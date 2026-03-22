import { model } from "mongoose";
import { IAdvertisement } from "../@types/interfaces/ads.interface";
import adsSchema from "./schemaDefinitions/ads.schema";

const AdsModel = model<IAdvertisement>('Advertisements', adsSchema);

export default AdsModel;
