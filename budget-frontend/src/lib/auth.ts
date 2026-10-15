import { User } from "@/types/DataTypes";
import { fetchUser } from "./userApi";

export async function validatePassword(email: string, password: string): Promise<User|null> {
    try {
        const user: User | null = await fetchUser(email);
        
        if (!user) {
            return null;
        } 
        
        return user.password === password ? user : null;
    } catch (error) {
        console.error("Failed to load user:", error);
    }
    return null;
}
