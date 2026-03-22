import { AdsStatus } from "../../constants/model/model.constant";

export interface IAdvertisement {
    title: string;
    description: string;
    image: string;
    link?: string | null;
    startDate: Date;
    endDate: Date;
    status: AdsStatus;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
