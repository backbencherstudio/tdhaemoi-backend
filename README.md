## TDHAEMOI Backend API Documentation

This backend powers a CRM-style system including admin panel, partner management, customers, products, messaging, appointments, and more.

### Base URLs
- v1: `/` (all v1 modules mounted at root)
- v2: `/v2`

### Authentication
- Most endpoints require a JWT in the `Authorization` header. The middleware expects the raw token (no `Bearer` prefix).
- Roles used: `ADMIN`, `PARTNER`, and special `ANY` for endpoints that require an authenticated user regardless of role.
- Unauthorized responses:
  - 401: missing/invalid token
  - 403: valid token but insufficient role

Example header:
```
Authorization: <jwt_token>
```

### CORS and Static Files
- CORS is enabled for a set of known origins.
- Static assets:
  - `/assets` serves files from `assets/`
  - `/uploads` serves uploaded files
  - `/public` serves public files (e.g., `public/index.html`)

### Error Handling
- 404 JSON: `{ "message": "404 route not found" }`
- 500 JSON: `{ "message": "500 Something broken!", "error": <message> }`

---

## Modules and Endpoints (v1)

Paths below are relative to the v1 base (`/`). Auth role requirements are shown in brackets.

### Users (`/users`)
- POST `/users/login` — Login, returns JWT. [public]
- POST `/users/register` — Register user. Multipart form: `image` (single). [public]
- PUT `/users/` — Update own user. Multipart form: `image` (single). [ANY]
- PATCH `/users/change-password` — Change own password. [ANY]
- POST `/users/create-partnership` — Create partner account. [ADMIN]
- PATCH `/users/update-partner-profile` — Update partner profile. Multipart `image`. [ADMIN, PARTNER]
- GET `/users/partners` — List partners. [ADMIN]
- GET `/users/check-auth` — Returns auth status (validates token if sent). [public]

### Partners (`/partner`)
- POST `/partner/create` — Create partnership. [ADMIN]
- PATCH `/partner/update-partner-profile` — Update partner profile. Multipart `image`. [ADMIN, PARTNER]
- GET `/partner/` — List all partners. [ADMIN]
- GET `/partner/:id` — Get partner by id. [ADMIN]
- PUT `/partner/update/:id` — Update partner by admin. Multipart `image`. [ADMIN]
- DELETE `/partner/delete/:id` — Delete partner. [ADMIN]
- POST `/partner/forgot-password/send-otp` — Send OTP to start reset. [public]
- POST `/partner/forgot-password/verify-otp` — Verify OTP. [public]
- POST `/partner/forgot-password/reset` — Reset password. [public]
- POST `/partner/change-password` — Change password. [ADMIN, PARTNER]

### Products (`/products`)
- POST `/products/` — Create product. Multipart: `images[]` (up to many). [ADMIN]
- PUT `/products/:id` — Update product. Multipart: `images[]`. [ADMIN]
- GET `/products/` — List products. [public]
- GET `/products/categories` — List products grouped by category. [public]
- GET `/products/technical-icons` — Return characteristics/technical icons. [public]
- GET `/products/query` — Query products via query params. [public]
- GET `/products/:id` — Get product by id. [public]
- DELETE `/products/:id/:imageName` — Delete a specific product image. [ADMIN]
- DELETE `/products/:id` — Delete product. [ADMIN]

### Excel (`/excel`)
- GET `/excel/` — Get Excel-based data. [public]

### Questions (`/questions`)
- GET `/questions/:categoryTitle?/:subCategoryTitle?` — Fetch questions flow; params optional. [public]

### Suggestions (`/suggestions`)
- POST `/suggestions/feetf1rst` — Create suggestion. [PARTNER, ADMIN]
- GET `/suggestions/feetf1rst` — List suggestions. [PARTNER]
- DELETE `/suggestions/feetf1rst/:id` — Delete suggestion by id. [PARTNER]
- DELETE `/suggestions/feetf1rst` — Delete all suggestions. [PARTNER]
- POST `/suggestions/improvement` — Create improvement. [PARTNER, ADMIN]
- GET `/suggestions/improvement` — List improvements. [PARTNER]
- DELETE `/suggestions/improvement/:id` — Delete improvement by id. [PARTNER]
- DELETE `/suggestions/improvement` — Delete all improvements. [PARTNER]

### Messages (`/message`)
- POST `/message/` — Create message. [PARTNER, ADMIN]
- GET `/message/sendbox` — Sent messages (outbox). [PARTNER, ADMIN]
- GET `/message/inbox` — Received messages (inbox). [PARTNER, ADMIN]
- PUT `/message/:id/favorite` — Toggle favorite on a message. [PARTNER, ADMIN]
- GET `/message/favorites` — List favorite messages. [PARTNER, ADMIN]
- GET `/message/:id` — Get message by id. [PARTNER, ADMIN]
- DELETE `/message/permanent` — Permanently delete messages (bulk). [PARTNER, ADMIN]
- DELETE `/message/delete/:id` — Delete single message. [PARTNER, ADMIN]
- GET `/message/system-inbox/:messageId` — System inbox fetch by id. [public]

### Appointments (`/appointment`)
- POST `/appointment/` — Create appointment. [PARTNER, ADMIN]
- GET `/appointment/` — List all appointments. [ADMIN]
- GET `/appointment/my` — List own appointments. [PARTNER, ADMIN]
- GET `/appointment/:id` — Get appointment by id. [PARTNER, ADMIN]
- PUT `/appointment/:id` — Update appointment. [PARTNER, ADMIN]
- DELETE `/appointment/:id` — Delete appointment. [PARTNER, ADMIN]
- GET `/appointment/system-appointment/:customerId/:appointmentId` — System fetch by composite id. [public]

### Employees (`/employees`)
- GET `/employees/` — List employees. [PARTNER]
- POST `/employees/` — Create employee. [PARTNER]
- PATCH `/employees/:id` — Update employee. [PARTNER]
- DELETE `/employees/:id` — Delete employee. [PARTNER]

### Customers (`/customers`)
- POST `/customers/` — Create customer. Multipart form fields: [PARTNER, ADMIN]
  - `picture_10`, `picture_11`, `picture_16`, `picture_17`, `picture_23`, `picture_24` (single each)
  - `threed_model_left`, `threed_model_right` (single each)
  - `csvFile` (single)
- GET `/customers/` — List customers. [ADMIN, PARTNER]
- GET `/customers/search` — Search customers via query params. [ADMIN, PARTNER]
- GET `/customers/:id` — Get customer by id. [ADMIN, PARTNER]
- PATCH `/customers/:id` — Update customer. [PARTNER]
- PATCH `/customers/:id/special-fields` — Update specific fields. [PARTNER, ADMIN]
- DELETE `/customers/:id` — Delete customer. [ADMIN, PARTNER]
- POST `/customers/assign-versorgungen/:customerId/:versorgungenId` — Assign Versorgung. [ADMIN, PARTNER]
- DELETE `/customers/undo-versorgungen/:customerId/:versorgungenId` — Undo Versorgung assignment. [ADMIN, PARTNER]

Screener file operations:
- POST `/customers/screener-file/:customerId` — Add screener file. Multipart: same fields as create. [PARTNER, ADMIN]
- PATCH `/customers/update-screener-file/:customerId/:screenerId` — Update screener file. Multipart: same fields. [PARTNER, ADMIN]
- DELETE `/customers/delete-screener-file/:screenerId` — Delete screener file. [PARTNER, ADMIN]
- GET `/customers/screener-file/:screenerId` — Get screener file by id. [public]

### Customers History (`/customers-history`)
- POST `/customers-history/notizen/:customerId` — Create history note. [ADMIN, PARTNER]
- GET `/customers-history/` — List all customer histories. [ADMIN, PARTNER]
- GET `/customers-history/:id` — Get history by id. [ADMIN, PARTNER]
- PATCH `/customers-history/:historyId` — Update history. [ADMIN, PARTNER]
- DELETE `/customers-history/:historyId` — Delete history. [ADMIN, PARTNER]

### Versorgungen (`/versorgungen`)
- GET `/versorgungen/` — List versorgungen. [PARTNER]
- GET `/versorgungen/diagnosis/:diagnosis_status` — Filter by diagnosis. [PARTNER]
- POST `/versorgungen/` — Create. [PARTNER]
- PATCH `/versorgungen/:id` — Update. [PARTNER]
- DELETE `/versorgungen/:id` — Delete. [PARTNER]

### Einlagen Finder (`/einlagen-finder`)
- POST `/einlagen-finder/` — Submit answers. [PARTNER]
- GET `/einlagen-finder/questions` — Get questions. [PARTNER]
- GET `/einlagen-finder/:customerId` — Get answers by customer. [PARTNER]
- GET `/einlagen-finder/answer/:userId` — Get answers by user id. [PARTNER]

### Exercises (`/exercises`)
- GET `/exercises/` — List all exercises. [public]
- POST `/exercises/` — Send exercises via email. Multipart: `pdf` (single). [public]

---

## Modules and Endpoints (v2)

Base path: `/v2`

### Exercises (`/v2/exercises`)
- GET `/v2/exercises/` — List all exercises. [public]
- POST `/v2/exercises/` — Send exercises via email. Multipart: `pdf` (single). [public]

---

## Request/Response Notes
- File uploads use standard `multipart/form-data` with field names as listed above.
- Query endpoints accept filters via query string; see frontend usage or controllers for exact filter keys.
- Successful responses return JSON payloads; on error, expect JSON with a `message` field and possibly an `error` field.

## Example cURL
Login:
```bash
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

Authorized request (ADMIN/PARTNER as required):
```bash
curl http://localhost:3001/customers \
  -H "Authorization: <jwt_token>"
```

Create product with images:
```bash
curl -X POST http://localhost:3001/products \
  -H "Authorization: <admin_jwt>" \
  -F "images=@/path/image1.jpg" \
  -F "images=@/path/image2.jpg"
```

Create customer with screener files:
```bash
curl -X POST http://localhost:3001/customers \
  -H "Authorization: <jwt_token>" \
  -F picture_10=@/path/p10.png \
  -F picture_11=@/path/p11.png \
  -F picture_16=@/path/p16.png \
  -F picture_17=@/path/p17.png \
  -F picture_23=@/path/p23.png \
  -F picture_24=@/path/p24.png \
  -F threed_model_left=@/path/left.obj \
  -F threed_model_right=@/path/right.obj \
  -F csvFile=@/path/data.csv
```

If anything appears missing or unclear, check the corresponding controller files in `module/v1/*/*.controllers.ts` and `module/v2/*/*.controllers.ts` for payload details.

83
