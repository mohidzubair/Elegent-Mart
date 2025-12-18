# Debugging Products Not Showing on Frontend

## Issue Summary

- Products fetch correctly (visible in Network tab)
- Categories display correctly
- Products show in Admin Panel
- **Products NOT showing on:** Homepage, ProductPage (related), Cart (related)
- Products **DO show on:** All-Products page

## Root Cause Analysis

The issue is a **category ID mismatch** between how products and categories store their relationships.

### Backend Structure

- Products have: `category: ObjectId (reference to Category._id)`
- Categories have: `_id: ObjectId` and `id: Number`
- Backend populates products with: `{ category: { _id, name, image, slug } }`

### Frontend Mismatch

- Homepage tries to match: `product.category._id` with `category._id`
- But categories array might be using `category.id` (the Number field)

## What I Fixed

### 1. Homepage.jsx

- Added detailed logging to see exact product and category structures
- Improved category matching to handle both `_id` and `id` fields
- Added per-category product count logging

### 2. Cart.jsx

- Switched from `database.json` to backend API (`apiFetch`)
- Fixed category matching for related products
- Handles populated category objects correctly

### 3. ProductPage.jsx

- Already uses `apiFetch` and handles category correctly
- Logs added to debug related products

### 4. api.js

- Added `credentials: 'include'` by default for cookie-based auth
- Improved header merging

## Diagnostic Steps

### Step 1: Check Browser Console Logs

Open DevTools Console and look for these logs:

```
[Homepage] raw products response: { count: 50, data: [...] }
[Homepage] normalized products count: 50
[Homepage] sample product: <id> <name>
[Homepage] sample product.category: { _id: '...', name: '...' }
[Homepage] sample category: { _id: '...', id: 1, name: '...' }
[Homepage] Category "Fruits & Vegetables" has X products
```

### Step 2: Verify Category ID Match

In console, check if the IDs match:

- Product's `category._id` should equal Category's `_id` (NOT `id`)

### Step 3: Check Backend Logs

Terminal running backend should show:

```
[productRoutes] list - mongo query: {} limit= 50
[productRoutes] list - found 50 products
[productRoutes] list - sample product: <id> <name>
```

## Expected vs Actual

### Expected Product Structure

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Fresh Apple",
  "category": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Fruits & Vegetables",
    "image": "/Images/fruits.png",
    "slug": "fruits-and-vegetables"
  },
  "price": 320
}
```

### Expected Category Structure

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "id": 1,
  "name": "Fruits & Vegetables",
  "image": "/Images/fruits.png",
  "banner": "/Images/fruits-banner.png",
  "slug": "fruits-and-vegetables"
}
```

## Test Commands

### Start Backend

```powershell
cd 'C:\Users\Mohid Bin Zubair\Downloads\Elegent-Mart\backend'
npm.cmd run dev
```

### Start Frontend

```powershell
cd 'C:\Users\Mohid Bin Zubair\Downloads\Elegent-Mart\frontend'
npm run dev
```

### Test API Directly

```powershell
# Get products
Invoke-RestMethod 'http://localhost:5000/api/products?limit=5' -Method Get | ConvertTo-Json -Depth 5

# Get categories
Invoke-RestMethod 'http://localhost:5000/api/categories' -Method Get | ConvertTo-Json -Depth 5
```

## Next Steps

1. **Start both servers** and open homepage
2. **Open DevTools Console** (F12 → Console tab)
3. **Look for the debug logs** I added
4. **Copy-paste the console output** showing:
   - `[Homepage] sample product.category:`
   - `[Homepage] sample category:`
5. **Share those logs** so I can see the exact structure mismatch

## Common Fixes

### If products show 0 for all categories:

- The `_id` fields don't match
- Solution: Check if categories use `_id` or `id` field

### If some products show but others don't:

- Some products have unpopulated category (just ObjectId string)
- Solution: Ensure backend `.populate('category')` is called

### If nothing shows at all:

- Products array is empty or not set
- Check `[Homepage] normalized products count:` log

## Files Changed

1. `frontend/src/Homepage.jsx` - Added logging, improved category matching
2. `frontend/src/Cart.jsx` - Switched to backend API, fixed related products
3. `frontend/src/api.js` - Added credentials and better header handling
4. `frontend/src/ProductPage.jsx` - Already has logging
5. `frontend/src/All-products.jsx` - Already works (reference implementation)
