export interface IFerryRoute {
  ferryName?: string | null;
  ferryNumber: string;
  // route: string;
  // startPoint: string;
  // endPoint: string;
  routeName: string[];
  stops: string[];
  timings: { departure: string; arrival: string }[];
  fare: number;
  createdBy: string;
  creatorName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
