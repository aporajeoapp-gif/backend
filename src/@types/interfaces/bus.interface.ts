export interface IBusRoute {
  busName?: string | null;
  routeName: string[];
  stops: string[];
  timings: { departure: string; arrival: string }[];
  departureStopageTime?: string | null;
  arrivalStopageTime?: string | null;
  intermediateStops?: { stopName: string; time: string }[];
  fare: number;
  createdBy: string;
  creatorName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
