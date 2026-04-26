
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
    banner_image?: string | null;
    organizationLogo?: string | null;
    contactPhone: string;
    contactEmail: string;
    description?: string;
    status: CampStatus;
    targetUnits: number;
    collectedUnits: number;
    createdBy: Types.ObjectId;
    isPublished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IDonor {
    campId: Types.ObjectId;
    name: string;
    fatherName: string;
    bloodGroup: string;
    age: number;
    phone: string;
    donatedAt?: Date | null;
    status: 'pending' | 'approved';
    approvedBy?: Types.ObjectId | null;
    expiresAt?: Date | null;
    createdAt?: Date;
}

