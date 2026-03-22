export interface IDoctorSchedule {
    day: string;
    time: string;
    chamber: string;
}

export interface IDoctor {
    name: string;
    specialty: string;
    experience: number;
    location: string;
    phone: string;
    email?: string | null;
    image?: string | null;
    schedule: IDoctorSchedule[];
    createdBy: string;
    creatorName: string;
    createdAt?: Date;
    updatedAt?: Date;
}
