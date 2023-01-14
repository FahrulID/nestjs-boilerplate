export type HttpResponse = {
    statusCode: number;
    success: boolean;
    message: string;
    data?: any;
}