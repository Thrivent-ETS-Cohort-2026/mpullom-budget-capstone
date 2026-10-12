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