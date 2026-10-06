# Puff & Pastel

Cute pastel/kawaii e-commerce website for Tunisia.

## Main pages
- `index.html` — customer storefront
- `admin.html` — product manager dashboard
- `styles.css` — storefront styles
- `products.js` — default products
- `app.js` — storefront logic and email orders
- `admin.js` — admin product management
- `assets/products/` — product photos

## Add products without editing code
1. Open `admin.html`.
2. Fill in Product name, price, category and description.
3. Choose a product photo.
4. Click **Add product**.
5. Open `index.html`: the new product appears automatically.

Products added from the admin page are saved in browser `localStorage`. The dashboard can edit/delete them and export/import the custom product list.

## Email orders
Orders are sent to `puffsandpastel@gmail.com` using FormSubmit, with a `mailto:` fallback. The first FormSubmit use may require email activation/confirmation.

## Important limitation
This is a static website. Admin-added products are saved only in the browser where they were added. They are not automatically shared across devices. For a production store, connect Supabase/Firebase or another database and add real admin authentication.
