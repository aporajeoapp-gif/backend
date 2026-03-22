export interface IEmergencyService {
    serviceName: string;
    category: "Ambulance" | "Fire" | "Police" | "Hospital" | "Other";
    address: string;
    contactPhone: string[];
    location?: {
        lat: number;
        lng: number;
    };
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
