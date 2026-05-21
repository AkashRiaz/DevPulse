export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};


export type IJwtPayLoad = {
  id: number;
  name: string;
  role: string;
}