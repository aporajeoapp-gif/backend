import { EventStatus } from "../../constants/model/model.constant";

export interface IEvent {
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    organizer: string;
    image?: string | null;
    status: EventStatus;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
