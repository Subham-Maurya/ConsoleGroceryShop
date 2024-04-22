# ConsoleGroceryShop

## How to Setup ?
1. Install node js and mysql along with mysql workbenck
2. Use the terminal and create a folder named - `SHOP` at your desired location
3. Move inside the `SHOP` folder and run these terminal commands:
  ```bash
  npm init
  npm install mysql
  ```
4. open mysql workbench and create a localhost for holding the database
5. Use that server and run the Database.sql file in it to create your database
6. Open the Application.js inside `SHOP` and update the username and password which you have used for the creation of localhost
7. Now Just use the below command to run the Application:
  ```bash
  node Application.js
  ```

## User Guide for Console Grocery Shop
Welcome to the user guide for the Console Grocery Shop. This guide will help you navigate through the functionalities available in the application.

### Initial Options
When you start the application, you will be presented with the following options:

1. **Exit**: Choose this option to exit the application.
2. **Login as Customer**: Use this option if you are a registered customer and want to access customer-specific functionalities.
3. **Login as Admin**: Select this option if you are an administrator and want access to admin-specific features.

### Customer Menu
If you choose to login as a customer, you will have access to the following functionalities:

1. **Ordering**: Place an order for products available in the store.
2. **Customer Analysis**: View your profile, payment history, and product history.
3. **Updating Customer Profile**: Update your personal information like name, address, phone number, etc.

### Admin Menu
If you choose to login as an admin, you will have access to the following functionalities:

1. **Add Delivery Assistant**: Add a new delivery assistant to the system.
2. **Add Store**: Add a new store to the system.
3. **Store Analysis**: View available stores or see stores with maximum profit.
4. **Product Analysis**: View available products, most sold products, or see feedback for a specific product.
5. **Refill Stock**: Refill stock for products when the quantity falls below a certain threshold.

### Additional Information
- To log in, you need to provide your registered email ID and password. If you enter incorrect credentials, you will be prompted to try again. After three failed attempts, you will be notified about exceeding the maximum login attempts for your email ID.
- You can exit the application at any time by selecting the "Exit" option from the main menu.
- Password must be at least 8 characters long.
- When placing an order, you can choose from various payment methods such as Cash, Debit Card, Credit Card, or Pay Pal.
- After placing an order, you will receive confirmation along with details about the delivery assistant assigned and the store from which the order will be fulfilled.
- You can submit feedback for a product after receiving your order.

### Contributors
- Subham Maurya (subham22510@iiitd.ac.in)
- Wasif Ali (wasif22583@iiitd.ac.in)
