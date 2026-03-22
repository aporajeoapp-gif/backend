import { model } from "mongoose";
import { IEvent } from "../@types/interfaces/event.interface";
import eventSchema from "./schemaDefinitions/event.schema";

const EventModel = model<IEvent>('Events', eventSchema);

export default EventModel;
