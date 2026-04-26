export interface IBusRoute {
  busName?: string | null;
  routeName: string[];
  stops: string[];
  timings: { departure: string; arrival: string }[];
  fare: number;
  createdBy: string;
  creatorName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
