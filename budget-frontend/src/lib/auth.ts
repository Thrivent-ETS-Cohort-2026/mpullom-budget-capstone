import { User } from "@/types/DataTypes";
import { fetchUser } from "./api";

export async function validatePassword(email: string, password: string): Promise<Boolean> {
    try {
        const user: User = await fetchUser(email);
        return user.password === password ? true : false;
    } catch (error) {
        console.error("Failed to load user:", error);
    }
    return false;
}
