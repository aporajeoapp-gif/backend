export interface IBusRoute {
    busName: string;
    routeNumber: string;
    startPoint: string;
    endPoint: string;
    stops: string[];
    timings: string[];
    fare: number;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
