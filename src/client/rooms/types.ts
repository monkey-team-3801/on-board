import { UserDataResponseType } from "../../types";

export type UserData = Omit<UserDataResponseType, "courses"> & {
    allocated?: boolean;
};
