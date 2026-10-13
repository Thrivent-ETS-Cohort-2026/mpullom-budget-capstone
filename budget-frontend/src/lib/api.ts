import { User } from "@/types/DataTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
// export async function fetchAccounts(userId?: number): Promise<Account[]> {
//   const url = userId 
//     ? `${BASE_URL}/accounts?userId=${userId}` 
//     : `${BASE_URL}/accounts`;

//   const response = await fetch(url, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(userId && { 'X-User-Id': userId.toString() }),
//     },
//     cache: 'no-store',
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`);
//   }

//   return response.json();
// }

//Untested (Landing)
export async function fetchUser(email: string): Promise<User> {
  if ((email == "") || (email == null)) {
    throw new Error("User ID for fetch request was null or invalid");
  }

const url = `${BASE_URL}/users/email/${encodeURIComponent(email)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': email,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Response failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch user");
  }
}

// Untested (Landing)
async function createUser(newUser: User): Promise<void> {
  try {
    const response = await fetch("/api/users", {
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