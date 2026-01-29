# Gemini Context File

## Project Overview

This is a **Multi-Warehouse Inventory Management System** built for GreenSupply Co, a sustainable product distribution company. The system helps track inventory across multiple warehouse locations throughout North America, manage stock movements, monitor inventory values, and prevent stockouts.

## Tech Stack

- **Framework**: Next.js 15.0.3
- **UI Library**: Material-UI (MUI) v6.1.7
- **Styling**: @emotion/react, @emotion/styled
- **Icons**: @mui/icons-material v6.1.7
- **Language**: JavaScript (React 18)
- **Data Storage**: JSON files (file-based persistence)

## Project Structure

```
inventory-management-task/
├── data/                         # JSON data files for persistence
│   ├── products.json             # Product catalog
│   ├── warehouses.json           # Warehouse locations
│   └── stock.json                # Stock levels per product/warehouse
├── src/
│   ├── components/
│   │   └── dashboard/            # Dashboard-specific components
│   ├── pages/
│   │   ├── _app.js               # Next.js App component
│   │   ├── _document.js          # Next.js Document component
│   │   ├── index.js              # Dashboard/Home page
│   │   ├── products/             # Product management pages
│   │   │   ├── index.js          # Product listing
│   │   │   ├── add.js            # Add new product
│   │   │   └── edit/[id].js      # Edit product
│   │   ├── warehouses/           # Warehouse management pages
│   │   │   ├── index.js          # Warehouse listing
│   │   │   ├── add.js            # Add new warehouse
│   │   │   └── edit/[id].js      # Edit warehouse
│   │   ├── stock/                # Stock level management pages
│   │   │   ├── index.js          # Stock listing
│   │   │   ├── add.js            # Add stock entry
│   │   │   └── edit/[id].js      # Edit stock entry
│   │   └── api/                  # API routes
│   │       ├── products/         # Products CRUD API
│   │       ├── warehouses/       # Warehouses CRUD API
│   │       └── stock/            # Stock CRUD API
│   └── styles/
│       └── globals.css           # Global styles
├── package.json
├── next.config.mjs
└── README.md                     # Project documentation & assessment tasks
```

## Current Features

- ✅ **Products Management**: Full CRUD operations for eco-friendly products
- ✅ **Warehouse Management**: Full CRUD operations for warehouse locations
- ✅ **Stock Level Tracking**: Track stock quantities per product per warehouse
- ✅ **Dashboard**: Basic overview with summary cards and inventory table
- ✅ **Navigation**: AppBar-based navigation between pages
- ✅ **Data Persistence**: JSON file-based storage

## Data Models

### Product

```json
{
  "id": 1,
  "sku": "ECO-UTN-001",
  "name": "Bamboo Spork Set",
  "category": "Utensils",
  "unitCost": 2.5,
  "reorderPoint": 100
}
```

### Warehouse

```json
{
  "id": 1,
  "name": "Main Distribution Center",
  "location": "Newark, NJ",
  "code": "NDC-01"
}
```

### Stock

```json
{
  "id": 1,
  "productId": 1,
  "warehouseId": 1,
  "quantity": 250
}
```

## API Endpoints

| Endpoint               | Method         | Description                   |
| ---------------------- | -------------- | ----------------------------- |
| `/api/products`        | GET/POST       | List/Create products          |
| `/api/products/[id]`   | GET/PUT/DELETE | Single product operations     |
| `/api/warehouses`      | GET/POST       | List/Create warehouses        |
| `/api/warehouses/[id]` | GET/PUT/DELETE | Single warehouse operations   |
| `/api/stock`           | GET/POST       | List/Create stock entries     |
| `/api/stock/[id]`      | GET/PUT/DELETE | Single stock entry operations |

## Assessment Tasks (From README)

The codebase is designed as an assessment with 3 main tasks:

1. **Dashboard Redesign**: Transform the basic dashboard into a professional, insightful command center with charts and modern UI
2. **Stock Transfer System**: Build a complete stock transfer workflow between warehouses with history tracking
3. **Low Stock Alert System**: Create an alert and reorder recommendation system for inventory management

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Key Architectural Notes

- Uses Next.js Pages Router (not App Router)
- API routes use file-based JSON storage via Node.js `fs` module
- MUI components are used throughout for consistent UI
- State management is done via React's useState/useEffect hooks
- No TypeScript - plain JavaScript implementation

## Component Reusability Protocol

To prevent code duplication and ensure a maintainable codebase, you **MUST** follow this protocol before creating any new component.

### 1. The "Search First" Mandate
**BEFORE** creating any new component, you must demonstrably search the codebase for existing solutions.
- **Rule**: You cannot reuse what you don't see. You must actively look.
- **Action**: Use `find_by_name` or `grep_search` to look for similar existing names or functionality.
    - *Example*: If building a `UserCard`, search for "Card", "User", "Profile".
    - *Strictness*: Any PR/Code that introduces a duplicate simple component without this search trace will be rejected.

### 2. Decision Tree for Reusability

When needing a UI element, follow this decision tree:

1.  **Does a similar component exist?**
    *   (Search `src/components` using broad keywords)
    *   **YES**: Go to step 2.
    *   **NO**: Go to step 4 (Create New).

2.  **Can the existing component be used *exactly* as is?**
    *   **YES**: Import and use it. DO NOT duplicate.
    *   **NO**: Go to step 3.

3.  **Can the existing component be easily extended?**
    *   (e.g., adding a prop, a variant, or a slot? Is it < 300 lines?)
    *   **YES**: Refactor the existing component to support the new use case.
        *   *Constraint*: Must not break existing usages (verify with `grep_search` for usages).
    *   **NO**: (It's too different or too complex/rigid). Go to step 4.

4.  **Create New Component**
    *   **Action**: Create the new file.
    *   **Location**:
        *   If used in multiple features -> `src/components/common/` or `src/components/shared/`
        *   If specific to a feature -> `src/components/[feature_name]/`
    *   **Post-Action**: Adhere to the "Micro-Files" rule (~300 lines).

### 5. Mandate on Reusability
**CRITICAL**: Avoid using or creating new components unless there's no components that can be reuse. Always prioritize refactoring existing components over creating new ones.

