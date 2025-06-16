# Rent It Forward – Mobile App

This project is part of a multi-repository workspace for **Rent It Forward** (`RENTITFORWARD-WORKSPACE`), a peer-to-peer rental marketplace.

Workspace contains:
- `rentitforward-web/`: Next.js + Tailwind web app
- `rentitforward-mobile/`: Expo + React Native mobile app
- `rentitforward-shared/`: Shared logic (types, utils, API clients, design system)

This is the cross-platform mobile app built with **Expo**, **React Native**, and **NativeWind**.

---

## 🔧 Key Technologies

- Expo + React Native (TypeScript)
- NativeWind (Tailwind for RN)
- Supabase (auth, db, storage)
- Stripe Connect (Express accounts, escrow-style payment flow)
- Shared logic via `rentitforward-shared`

---

## 📁 Project Structure
rentitforward-mobile/
├── app/ # Screens and navigation
│ └── (tabs)/ # Tab-based nested routes
├── assets/ # Fonts, icons, images
├── src/
│ ├── components/ # Reusable React Native UI components
│ ├── lib/ # API clients, helper functions, constants
│ └── design-system.ts # Optionally imports from shared tokens
├── tailwind.config.js # Tailwind (NativeWind) config


---

## 📦 Shared Modules

Uses shared packages from `../rentitforward-shared/`, including:
- `types/`: User, Listing, Booking, etc.
- `utils/`: Pricing, validation, date helpers
- `api/`: Supabase and Typesense clients
- `design-system/`: Design tokens (colors, fonts, spacing)

---

## 🧠 Notes

- Use **shared logic** and **design system** wherever possible to ensure consistency with the web app.
- Avoid duplicating types or constants—extend shared interfaces if needed.
- Stripe Connect is used to onboard item owners (sharers) as Express accounts.
- The platform holds renter payments in escrow until the rental is completed.
- Funds are released to owners minus a 20% platform commission (see Pricing model).
- Deposits (if required) are held separately and refunded post-return confirmation.
- All design tokens come from the shared design system.
- If mobile-specific styles are needed, extend the shared tokens locally (e.g. `mobile-tokens.ts`) instead of duplicating.


## 🎨 Design System Details

Located in: `/rentitforward-shared/src/design-system/`

This directory provides a central, token-based design system for both web (Tailwind) and mobile (NativeWind) usage.

Includes:
- **Colors**: Brand palette
- **Spacing**: Margin/padding system
- **Typography**: Fonts, weights, sizes
- **Breakpoints**: Responsive design tokens
- **Tokens.ts**: Flattened export for global usage

## 🛠 Usage

In web:
import { theme } from 'rentitforward-shared/src/design-system/theme';

In mobile:
import { tokens } from 'rentitforward-shared/src/design-system/tokens';

🚫 Do not copy web components using HTML tags, `next/link`, or `className` directly.

✅ Use React Native components (`View`, `Text`, `TouchableOpacity`, etc.) or NativeWind styling in mobile.

✅ Wrap navigation with `useNavigation()` from `@react-navigation/native`.
