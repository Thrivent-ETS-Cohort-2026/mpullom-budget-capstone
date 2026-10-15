import { BudgetType, User, UserRequest } from "@/types/DataTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function fetchUser(email: string): Promise<User> {
  try {
    const params = new URLSearchParams({ email });
    const url = `${BASE_URL}/users/email?${params.toString()}`;
    console.log("Fetching URL:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed user data successfully:", data);
    return data;

  } catch (err: any) {
    console.error("CRITICAL ERROR inside fetchUser line 7:", err);
    throw err;
  }
}

// Untested (Landing)
export async function createUser(newUser: UserRequest): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    if (!response.ok) {
      throw new Error("Post request failed.");
    }
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred.");
  }
}

export async function updateUser(changes: UserRequest, token: string): Promise<void> {
  try {
    console.log(changes)
    const changeRequest: UserRequest = {
      firstName: changes.firstName,
      lastName: changes.lastName,
      email: changes.email,
      phoneNumber: changes.phoneNumber,
      password: changes.password
    }
    console.log(changeRequest)
    const response = await fetch(`${BASE_URL}/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(changeRequest)
    });

    if (!response.ok) {
      throw new Error("Post request failed.");
    }
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred.");
  }
}