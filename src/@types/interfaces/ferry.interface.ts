export interface IFerryRoute {
    ferryName: string;
    route: string;
    startPoint: string;
    endPoint: string;
    timings: string[];
    fare: number;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
