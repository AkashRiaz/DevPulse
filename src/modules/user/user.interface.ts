export type TUser = {
    id: number;
    name: string;
    email: string;
    password: string;
    role: "maintainer" | "contributor";
    created_at: Date;
    updated_at: Date;
}


export type RUser = {
    name: string;
    email: string;
    role: "maintainer" | "contributor";
    created_at: Date;
    updated_at: Date;
}