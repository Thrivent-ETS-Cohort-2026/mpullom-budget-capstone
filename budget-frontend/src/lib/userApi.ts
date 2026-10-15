import { User, UserRequest } from "@/types/DataTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/users';

export async function fetchUser(email: string): Promise<User | null> {
  try {
    const params = new URLSearchParams({ email });
    const url = `${BASE_URL}/email?${params.toString()}`;
    
    const response = await fetch(url);
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data: User = await response.json();
    return data;

  } catch (err: any) {
    console.error("CRITICAL ERROR inside fetchUser:", err);
    throw err; 
  }
}

export async function createUser(newUser: UserRequest): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create user.");
    }
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred.");
  }
}

export async function updateUser(changes: UserRequest, token: string): Promise<void> {
  try {
    const changeRequest: UserRequest = {
      firstName: changes.firstName,
      lastName: changes.lastName,
      email: changes.email,
      phoneNumber: changes.phoneNumber,
      password: changes.password
    };

    const response = await fetch(`${BASE_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(changeRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update user.");
    }
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred.");
  }
}