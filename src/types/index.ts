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

export const USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer",
  
} as const;
 
export type ROLES = typeof USER_ROLE[keyof typeof USER_ROLE];