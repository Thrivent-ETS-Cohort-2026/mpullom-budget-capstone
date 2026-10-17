## Account API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/accounts` | POST | Create a new account |
| `/api/accounts` | GET | Retrieve all accounts for the authenticated user via token |
| `/api/accounts/{acctNo}/balance` | PUT | Update an account's balance securely using token authentication |
## Budget API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/budgets` | POST | Create a new budget |
| `/api/budgets` | GET | Retrieve all budgets for the authenticated user via token |
| `/api/budgets/{id}` | PUT | Update a budget by ID securely using token authentication |
## Transaction API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/transactions` | POST | Record a new transaction (deposit or withdrawal) |
| `/api/transactions` | GET | Retrieve filtered transactions list by date or type |
| `/api/transactions/{id}` | PUT | Update an existing transaction by ID |
| `/api/transactions/{id}` | DELETE | Delete an existing transaction by ID |
## User API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/users` | POST | Create a new user account |
| `/api/users/email` | GET | Retrieve a user by email address lookup |
| `/api/users` | PUT | Update user profile securely using token authentication |