export interface IBusRoute {
    busName?: string | null;
    routeNumber: string;
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
