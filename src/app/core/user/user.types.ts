export interface User {
    userId: string;
    userName: string;
    descript: string;
    ORGID: string;
    ORGDESC: string;
    roles: [];
    fgrant: UserFunctionGrant[];
}
export interface UserFunctionGrant {
    functionId: string;
    functionName: string;
    grantInsert: boolean;
    grantUpdate: boolean;
    grantDel: boolean;
    grantExt: string[];
}
