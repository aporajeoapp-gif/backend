export interface IDoctorSchedule {
  day?: string;
  time?: string;
  chamber?: string;
}

export interface IDoctor {
  name: string;
  specialty: string;
  personalNo?: string | null;
  location: string;
  phone: string;
  alternatePhone?: string | null;
  degree?: string | null;
  experience?: number | null;
  medicalShopLocation?: {
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  email?: string | null;
  image?: string | null;
  schedule?: IDoctorSchedule[];
  createdBy: string;
  creatorName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
