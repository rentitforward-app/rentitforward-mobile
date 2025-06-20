🧱 DATABASE STRUCTURE


profiles

| Field               | Type      | Notes                       |
| ------------------- | --------- | --------------------------- |
| id                  | UUID (PK) | Supabase auth UID           |
| full\_name          | Text      |                             |
| email               | Text      |                             |
| phone               | Text      | Optional                    |
| photo\_url          | Text      | Profile picture             |
| points              | Integer   | Reward points               |
| referral\_code      | Text      | Unique                      |
| referred\_by        | UUID (FK) | Reference to `profiles.id`  |
| stripe\_account\_id | Text      | For Stripe Connect          |
| stripe\_onboarded   | Boolean   | Stripe KYC                  |
| identity\_verified  | Boolean   | Platform-level verification |
| role                | Enum      | user, admin                 |
| created\_at         | Timestamp | Default: now()              |


listings

| Field              | Type      | Notes          |
| ------------------ | --------- | -------------- |
| id                 | UUID (PK) |                |
| owner\_id          | UUID (FK) | → `profiles.id`|
| title              | Text      |                |
| description        | Text      |                |
| category\_id       | UUID (FK) |                |
| condition          | Text      | Enum or string |
| location           | Geography | PostGIS        |
| address\_text      | Text      |                |
| price\_hourly      | Decimal   |                |
| price\_daily       | Decimal   |                |
| price\_weekly      | Decimal   |                |
| deposit            | Decimal   | Optional       |
| insurance\_enabled | Boolean   |                |
| is\_active         | Boolean   | Default: true  |
| created\_at        | Timestamp |                |


listing_photos

| Field       | Type      |
| ----------- | --------- |
| id          | UUID (PK) |
| listing\_id | UUID (FK) |
| url         | Text      |



listing_availability
| Field         | Type      | Notes            |
| ------------- | --------- | ---------------- |
| id            | UUID (PK) |                  |
| listing\_id   | UUID (FK) |                  |
| date          | Date      | Marked available |
| is\_available | Boolean   | Default: true    |


You can mark availability explicitly per day.


categories
| id | UUID (PK) |
| name | Text |
| icon | Text |


bookings

| Field            | Type      |                                          |
| ---------------- | --------- | ---------------------------------------- |
| id               | UUID (PK) |                                          |
| item\_id         | UUID (FK) |                                          |
| renter\_id       | UUID (FK) |                                          |
| start\_date      | Date      |                                          |
| end\_date        | Date      |                                          |
| duration\_days   | Integer   |                                          |
| price\_total     | Decimal   |                                          |
| insurance\_fee   | Decimal   |                                          |
| deposit\_amount  | Decimal   |                                          |
| platform\_fee    | Decimal   |                                          |
| payment\_status  | Enum      | pending, paid, failed                    |
| deposit\_status  | Enum      | held, refunded, deducted                 |
| status           | Enum      | pending, confirmed, completed, cancelled |
| payer\_confirmed | Boolean   |                                          |
| owner\_confirmed | Boolean   |                                          |
| created\_at      | Timestamp |                                          |


payments

| Field               | Type      |                   |
| ------------------- | --------- | ----------------- |
| id                  | UUID (PK) |                   |
| booking\_id         | UUID (FK) |                   |
| stripe\_payment\_id | Text      |                   |
| amount              | Decimal   |                   |
| status              | Enum      | succeeded, failed |
| created\_at         | Timestamp |                   |


incentives
| id | UUID (PK) |
| user_id | UUID (FK) |
| booking_id | UUID (FK) | Optional |
| action | Enum | first_rental, referral, review, milestone |
| points | Integer |
| created_at | Timestamp |

reviews
| id | UUID (PK) |
| booking_id | UUID (FK) |
| reviewer_id | UUID (FK) |
| reviewee_id | UUID (FK) |
| rating | Integer |
| comment | Text |
| created_at | Timestamp |

messages
| id | UUID (PK) |
| sender_id | UUID (FK) |
| receiver_id | UUID (FK) |
| booking_id | UUID (FK) |
| content | Text |
| created_at | Timestamp |

blogs
| id | UUID (PK) |
| slug | Text | Unique |
| title | Text |
| content | Text | Markdown/HTML |
| image_url | Text |
| published | Boolean |
| published_at| Timestamp |

docs
| id | UUID (PK) |
| type | Enum | privacy, terms, faq |
| slug | Text | terms-of-use, privacy-policy, etc |
| title | Text |
| content | Text | Markdown/HTML |
| version | Text | Optional versioning |
| published | Boolean |
| created_at | Timestamp |

🔐 RLS Policies (Row-Level Security)

- profiles
```sql
SELECT, UPDATE: auth.uid() = id
```

- listings
```sql
SELECT: is_active = true OR owner_id = auth.uid()
INSERT, UPDATE, DELETE: owner_id = auth.uid()
```

- bookings
```sql
SELECT, UPDATE:
auth.uid() = renter_id OR auth.uid() = (SELECT owner_id FROM listings WHERE id = item_id)
```

- listing_availability
```sql
SELECT: true
INSERT, UPDATE, DELETE: auth.uid() = (SELECT owner_id FROM listings WHERE id = listing_id)
```

- payments, incentives, reviews, messages
```sql
SELECT: auth.uid() = sender_id OR auth.uid() = receiver_id
```


✅ ENUMS
```sql
-- user.role
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- booking.status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- payment.status
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed');

-- deposit.status
CREATE TYPE deposit_status AS ENUM ('held', 'refunded', 'deducted');

-- incentive.action
CREATE TYPE incentive_action AS ENUM ('first_rental', 'referral', 'review', 'milestone');

-- docs.type
CREATE TYPE doc_type AS ENUM ('privacy', 'terms', 'faq');
```


🧠 Supabase Edge Functions to Add

| Function                                         | Purpose                                                  |
| ------------------------------------------------ | -------------------------------------------------------- |
| `createStripeAccount(user_id)`                   | Onboard sharer to Stripe Connect                         |
| `createPaymentIntent(booking_id)`                | Create Stripe payment intent with fees and transfer data |
| `releaseDeposit(booking_id)`                     | Trigger refund when item returned                        |
| `deductDeposit(booking_id, amount)`              | Admin-initiated deduction                                |
| `grantIncentive(action, user_id, booking_id?)`   | Add points                                               |
| `verifyListingAvailability(item_id, start, end)` | Prevent double bookings                                  |
