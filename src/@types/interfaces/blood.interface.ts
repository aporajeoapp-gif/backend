
import { Types } from "mongoose";
import { CampStatus } from "../constant/bloodDonationCampStatus.constant";

export interface IBloodCamp {
    campName: string;
    organizer: string;
    date: string;
    time: string;
    location: string;
    address: string;
    city: string;
    bloodGroupsNeeded: string[];
    contactPhone: string;
    contactEmail: string;
    description?: string;
    status: CampStatus;
    targetUnits: number;
    collectedUnits: number;
    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IDonor {
    campId: Types.ObjectId;
    name: string;
    bloodGroup: string;
    age: number;
    phone: string;
    donatedAt?: Date | null;
    createdAt?: Date;
}
