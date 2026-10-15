import { User } from "@/types/DataTypes";
import { fetchUser } from "./userApi";

export async function validatePassword(email: string, password: string): Promise<User|null> {
    try {
        const user: User = await fetchUser(email);
        return user.password === password ? user : null;
    } catch (error) {
        console.error("Failed to load user:", error);
    }
    return null;
}
