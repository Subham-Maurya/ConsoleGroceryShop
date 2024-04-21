const { createPool } = require('mysql');
const readline = require('readline');
const { promisify } = require('util');

const pool = createPool({
    host : "localhost",
    user : "root",
    password : "root123",
    database : "grocery",
    connectionLimit : 10
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify rl.question
const questionAsync = promisify(rl.question).bind(rl);

function getTable(tableName) {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM ${tableName}`, (error, result, fields) => {
            if (error) {
                reject(error);
            }
            resolve(result);
        });
    });
}

function displayTable(tableName, result) {
    console.log(`\nContents of table '${tableName}':`);
    console.table(result);
}

function updateQuantity(productID, quantity) {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE product SET quantity = quantity - ? WHERE product_id = ?`, [quantity, productID], (error, result) => {
            if (error) {
                reject(error);
            }
            console.log(`Updated Product quqntity for product ID: ${productID}`);
            resolve();
        });
    });
}

function RefillStock(threshold) {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE product SET quantity = quantity + ? WHERE quantity <= ?`, [threshold, threshold], (error, result) => {
            if (error) {
                reject(error);
            }
            console.log(`Stock Refilled SuccessFully...`);
            resolve();
        });
    });
}

function insertIntoPayment(tableName, values) {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO ${tableName} (paymentType, amount, product_id, quantity, customer_id, date, time) VALUES (?)`, [values], (error, result) => {
            if (error) {
                reject(error);
            }
            console.log(`Inserted data into table '${tableName}'`);
            resolve();
        });
    });
}

function insertIntoOrders(tableName, values) {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO ${tableName} (order_status, customer_id, date, time, delivery_person_id, store_id) VALUES (?)`, [values], (error, result) => {
            if (error) {
                reject(error);
            }
            console.log(`Inserted data into table '${tableName}'`);
            resolve();
        });
    });
}

function getCurrentDate() {
    return new Promise((resolve, reject) => {
        const date = new Date();
        const year = date.getFullYear();
        
        // Month starts from 0, so add 1 to get the correct month
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        resolve(formattedDate);
    });
}

function getCurrentTime() {
    return new Promise((resolve, reject) => {
        const date = new Date();
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        resolve(formattedTime);
    });
}

async function test() {
    try {
        const result = await getTable('product');
        displayTable('product', result);
    } catch (error) {
        console.error('An error occurred:', error);
    }

}

async function assignDeliveryAssistant() {
    try {
        const result = await new Promise((resolve, reject) => {
            pool.query(`SELECT assistant_id, name FROM DELIVERY_ASSISTANT`, (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });

        const randomIndex = Math.floor(Math.random() * result.length);
        return {
            id: result[randomIndex].assistant_id,
            name: result[randomIndex].name
        };
    } catch (error) {
        console.error('An error occurred while assigning delivery assistant:', error);
        return null;
    }
}

async function assignStore() {
    try {
        const result = await new Promise((resolve, reject) => {
            pool.query(`SELECT store_id, name FROM STORE`, (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });

        const randomIndex = Math.floor(Math.random() * result.length);
        return {
            id: result[randomIndex].store_id,
            name: result[randomIndex].name
        };
    } catch (error) {
        console.error('An error occurred while assigning store:', error);
        return null;
    }
}


// Function to handle user input for ordering
async function orderProduct(customer_id) {
    try {
        const result = await getTable('product');
        
        displayTable('product', result);
        
        const productID = await questionAsync("\nEnter product ID: ");
        const quantity = await questionAsync("Enter quantity: ");
        
        let productRow = result.find(row => row.product_id == productID);

        let totalCost = 0;

        if(productRow) {
            result.forEach(element => {
                if(element.product_id == productID) totalCost = element.price * quantity;
            });

            console.log("\nTotal Cost: " + totalCost);
        }

        const getPermission = await questionAsync("\nDo you want to proceed with the order? (Y/N): ");

        if (getPermission === "y") {
            console.log("\nSelect Payment Method: \n");
            console.log("1. Cash");
            console.log("2. Debit Card");
            console.log("3. Credit Card");
            console.log("4. Pay Pal");
            const paymentMethodIndex = await questionAsync("\nEnter your choice: ");
            let paymentMethod;

            if(paymentMethodIndex == 1) {
                paymentMethod = "Cash";
            } else if(paymentMethodIndex == 2) {
                paymentMethod = "Debit Card";
            } else if(paymentMethodIndex == 3) {
                paymentMethod = "Credit Card";
            } else if(paymentMethodIndex == 4) {
                paymentMethod = "Pay Pal";
            } else {
                console.error("\nInvalid payment method. Exiting...");
                return;
            }

            const result2 = await getTable('product');
            const productRow2 = result2.find(row => row.product_id == productID);
            if (!productRow2) {
                console.error("Error: Product ID not found.");
                return;
            } else if (quantity > productRow2.quantity || quantity <= 0) {
                console.error("Error: Requested quantity exceeds available quantity.");
                return;
            }
            
            // Begin transaction
            await new Promise((resolve, reject) => {
                pool.getConnection((connectionError, connection) => {
                    if (connectionError) {
                        reject(connectionError);
                        return;
                    }

                    connection.beginTransaction(async (transactionError) => {
                        if (transactionError) {
                            connection.release();
                            reject(transactionError);
                            return;
                        }

                        try {
                            console.log('\n---------------------------------------------------------------------------------------------------------------------');
                            console.log("The product identification has been successfully traced, and the available quantity meets the required threshold...");
                            console.log('---------------------------------------------------------------------------------------------------------------------');

                            let currentDate = await getCurrentDate();
                            let currentTime = await getCurrentTime();

                            const deliveryAssistant = await assignDeliveryAssistant();
                            if (!deliveryAssistant) {
                                console.error("Error: Failed to assign delivery assistant.");
                                return;
                            } else {
                                console.log(`Assigned delivery assistant: ${deliveryAssistant.name} (${deliveryAssistant.id})`);
                            }

                            const storeAssigned = await assignStore();
                            if (!deliveryAssistant) {
                                console.error("Error: Failed to assign any store.");
                                return;
                            } else {
                                console.log(`Assigned Store: ${storeAssigned.name} (${storeAssigned.id})`);
                            }


                            // Insert into payment table
                            await insertIntoPayment('payment', [`${paymentMethod}`, totalCost, productID, quantity, customer_id, `${currentDate}`, `${currentTime}`]);
                            console.log('---------------------------------------------------------------------------------------------------------------------');

                            // Insert into orders table
                            await insertIntoOrders('orders', ['processing', customer_id , `${currentDate}`, `${currentTime}`, `${deliveryAssistant.id}`, `${storeAssigned.id}`]);
                            console.log('---------------------------------------------------------------------------------------------------------------------');

                            // Update quantity in product table
                            await updateQuantity(productID, quantity);
                            console.log('---------------------------------------------------------------------------------------------------------------------');

                            // Commit transaction
                            await new Promise((resolve, reject) => {
                                connection.commit((commitError) => {
                                    if (commitError) {
                                        connection.rollback(() => {
                                            connection.release();
                                            reject(commitError);
                                        });
                                    } else {
                                        connection.release();
                                        resolve();
                                    }
                                });
                            });

                            // Display updated tables
                            displayTable('product', await getTable('product'));
                            displayTable('payment', await getTable('payment'));
                            displayTable('orders', await getTable('orders'));
                            console.log('---------------------------------------------------------------------------------------------------------------------');
                            
                            
                            console.log('---------------------------------------------------------------------------------------------------------------------');
                            console.log("Your Order has been successfully Delivered! By the Delivery Assistant: " + deliveryAssistant.name);

                            // Call to submitProductFeedback with productID
                            await submitProductFeedback(customer_id, productID);

                            resolve();
                        } catch (error) {
                            // Rollback transaction if an error occurs
                            connection.rollback(() => {
                                connection.release();
                                reject("Invalid Input");
                            });
                        }
                    });
                });
            });
        } else {
            console.log("Order Cancelled");
            return;
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function customerAnalysis(customer_id) {
    try {
        console.log("1. Customer Profile");
        console.log("2. Payment History");
        console.log("3. Product History");

        const input = await questionAsync("\nChoose Desired Option: ");
        if (input == 1) {
            // Customer profile
            const result = await new Promise((resolve, reject) => {
                pool.query(`SELECT name, houseNumber, street, city, pincode, phoneNumber, email_ID FROM customer WHERE customer_id = '${customer_id}'`, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            });

            console.log("\nCustomer's Profile: ");
            console.table(result);

        } else if (input == 2) {
            // Payment history
            const result = await new Promise((resolve, reject) => {
                pool.query(`SELECT payment_id, paymentType, amount, product_id, quantity, date, time FROM payment WHERE customer_id = '${customer_id}'`, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            });

            console.log("\nCustomer's Payment History: ");
            console.table(result);

        } else if(input == 3) {
            // Product History
            const result = await new Promise((resolve, reject) => {
                pool.query(`SELECT product.ProductName, product.description, payment.quantity, payment.amount as TotalPrice, payment.date, payment.time  FROM product JOIN payment ON product.product_id = payment.product_id WHERE payment.customer_id = '${customer_id}'`, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            });

            console.log("\nCustomer's Product History: ");
            console.table(result);

        } else {
            console.log("Invalid Input");
            return;
        }

        // After handling user's choice, return to the previous function
        return;
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


async function storeAnalysis() {
    try {
        console.log("1. Stores Available");
        console.log("2. Stores With Maximum Profit");

        const input = await questionAsync("\nChoose Desired Option: ");
        if (input == 1) {
            const result = await new Promise((resolve, reject) => {
                pool.query(`SELECT * FROM store`, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            });

            console.log("\nAvailable Store's: ");
            console.table(result);

        } else if (input == 2) {
            const result = await new Promise((resolve, reject) => {
                pool.query(`SELECT s.store_id, s.name, SUM(p.amount) AS TOTAL_PROFIT FROM ORDERS o
                            JOIN PAYMENT p ON o.customer_id = p.customer_id AND o.date = p.date AND o.time = p.time
                            JOIN STORE s ON o.store_id = s.store_id
                            GROUP BY s.store_id
                            ORDER BY TOTAL_PROFIT DESC`, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            });

            console.log("\nMaximum Profit Store: ");
            console.table(result);

        } else {
            console.log("Invalid Input");
            return;
        }

        // After handling user's choice, return to the previous function
        return;
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function productAnalysis() {
    try {
        console.log("1. Products Available");
        console.log("2. Most Sold Products");
        console.log("3. See Product Feedback");

        const input = await questionAsync("\nChoose Desired Option: ");
        if (input == 1) {
            const result = await new Promise((resolve, reject) => {
                pool.query(`SELECT * FROM product`, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            });

            console.log("\nAvailable Products's: ");
            console.table(result);

        } else if(input == 2) {
            const result = await new Promise((resolve, reject) => {
                pool.query(`SELECT p.product_id, p.productName, SUM(pm.quantity) AS Total_Sold_Quantity, SUM(pm.amount) AS Total_Profit
                            FROM PAYMENT pm
                            JOIN PRODUCT p ON pm.product_id = p.product_id
                            GROUP BY p.product_id
                            ORDER BY Total_Sold_Quantity DESC`, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            });

            console.log("\nMost Sold Products: ");
            console.table(result);

        } else if (input == 3) {
            const product_id = await questionAsync("\nEnter Product ID: ");
            const result = await getTable('product');
            const check = await result.find(row => row.product_id.toString() === product_id);
            if (check){
                console.table(check);
                const result = await new Promise((resolve, reject) => {
                    pool.query(`SELECT feedback from product_feedback where product_id = ${product_id}`, (error, result, fields) => {
                        if (error) {
                            reject(error);
                        }
                        resolve(result);
                    });
                });
    
                console.log("\nAvailable Feedbacks: ");
                console.table(result);
            }
            else{
                console.log("Error: Product ID not found");
            }
        } else {
            console.log("Invalid Input");
            return;
        }

        // After handling user's choice, return to the previous function
        return;
    } catch (error) {
        console.error('An error occurred:', error);
    }
}



// Non-Conflicting Functionalities


// Function to update customer profile
async function updateCustomerProfile(customer_id) {
    try {
        const fieldToUpdate = await questionAsync("\nEnter the field you want to update (name, houseNumber, street, city, pincode, phoneNumber, email_ID, password): ");
        const newValue = await questionAsync(`Enter new value for ${fieldToUpdate}: `);

        await new Promise((resolve, reject) => {
            pool.getConnection((connectionError, connection) => {
                if (connectionError) {
                    reject(connectionError);
                    return;
                }

                connection.beginTransaction(transactionError => {
                    if (transactionError) {
                        connection.release();
                        reject(transactionError);
                        return;
                    }

                    const query = `UPDATE customer SET ${fieldToUpdate} = ? WHERE customer_id = ?`;

                    connection.query(query, [newValue, customer_id], (queryError, result) => {
                        if (queryError) {
                            connection.rollback(() => {
                                connection.release();
                                reject("Failed to update customer profile. Please try again.");
                            });
                        } else {
                            connection.commit(commitError => {
                                if (commitError) {
                                    connection.rollback(() => {
                                        connection.release();
                                        reject(commitError);
                                    });
                                } else {
                                    console.log(`\nCustomer profile updated successfully. ${fieldToUpdate} set to ${newValue}`);
                                    connection.release();
                                    resolve();
                                }
                            });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


// Function to submit feedback for a product
async function submitProductFeedback(customer_id, productID) {
    try {
        const feedback = await questionAsync("Enter your feedback for the product: ");

        await new Promise((resolve, reject) => {
            pool.getConnection((connectionError, connection) => {
                if (connectionError) {
                    reject(connectionError);
                    return;
                }

                connection.beginTransaction(transactionError => {
                    if (transactionError) {
                        connection.release();
                        reject(transactionError);
                        return;
                    }

                    const query = `INSERT INTO PRODUCT_FEEDBACK (customer_id, product_id, feedback) VALUES (?, ?, ?)`;

                    connection.query(query, [customer_id, productID, feedback], (queryError, result) => {
                        if (queryError) {
                            connection.rollback(() => {
                                connection.release();
                                reject("Failed to submit product feedback. Please try again.");
                            });
                        } else {
                            connection.commit(commitError => {
                                if (commitError) {
                                    connection.rollback(() => {
                                        connection.release();
                                        reject(commitError);
                                    });
                                } else {
                                    console.log("\nProduct feedback submitted successfully.");
                                    connection.release();
                                    resolve();
                                }
                            });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function InsertIntoDeliveryAssistant_or_Store(tableName, values) {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO ${tableName} (name, houseNumber, street, city, pincode, phoneNumber, email_ID, password) VALUES (?)`, [values], (error, result) => {
            if (error) {
                reject(error);
            }
            console.log(`Inserted data into table '${tableName}'`);
            resolve();
        });
    });
}

async function addDeliveryAssistant_or_Store(tableName) {
    try {
        const values = [];

        const name = await questionAsync(`Enter ${tableName} name: `);
        values.push(name);

        const houseNumber = await questionAsync("Enter house number: ");
        values.push(houseNumber);

        const street = await questionAsync("Enter street: ");
        values.push(street);

        const city = await questionAsync("Enter city: ");
        values.push(city);

        const pincode = await questionAsync("Enter pincode: ");
        values.push(pincode);

        const phoneNumber = await questionAsync("Enter phone number: ");
        values.push(phoneNumber);

        const email_ID = await questionAsync("Enter email ID: ");
        values.push(email_ID);

        const password = await questionAsync("Enter password: ");
        if (password.length < 8) {
            console.log('---------------------------------------------------------------------------------------------------------------------');
            console.error("\nError: Length of password must be >= 8 characters");
            console.log('---------------------------------------------------------------------------------------------------------------------');
            return;
        } else{
            values.push(password);
        }
        console.log('---------------------------------------------------------------------------------------------------------------------');
        await InsertIntoDeliveryAssistant_or_Store(tableName, values);
        console.log('---------------------------------------------------------------------------------------------------------------------');

    } catch (error) {
        console.log('---------------------------------------------------------------------------------------------------------------------');
        console.error('An error occurred:', error);
        console.log('---------------------------------------------------------------------------------------------------------------------');
    }
}


// ---------------------------- Login Functionality ----------------------------
// Drivers Code

// Function available for customer
async function CustomerMenu(customer_id) {
    while (true) {
        console.log('---------------------------------------------------------------------------------------------------------------------');
        console.log("Customer Menu");
        console.log('---------------------------------------------------------------------------------------------------------------------');
        const answer = await questionAsync(
            `\nPress 0 to Exit\n` +
            `Press 1 for Ordering\n` +
            `Press 2 for Customer Analysis\n` +
            `Press 3 for Updating Customer Profile\n` +
            `\nEnter your choice: `
        );

        if (answer === "0") {
            console.log("Exiting...");
            rl.close();
            break;
        } else if (answer === "1") {
            await orderProduct(customer_id);
        } else if (answer === "2") {
            await(customerAnalysis(customer_id));
        } else if(answer === "3") {
            await(updateCustomerProfile(customer_id));
        } else {
            console.log("\nInvalid input");
        }
    }
}

// Function available to admin
async function AdminMenu(admin_id) {
    while (true) {
        console.log('---------------------------------------------------------------------------------------------------------------------');
        console.log("Admin Menu");
        console.log('---------------------------------------------------------------------------------------------------------------------');
        const answer = await questionAsync(
            `\nPress 0 to Exit\n` +
            `Press 1 to Add Delivery Assistant\n` +
            `Press 2 to Add Store\n` +
            `Press 3 for Store Analysis\n` +
            `Press 4 for Product Analysis\n` +
            `Press 5 to Refill Stock\n` +
            `\nEnter your choice: `
        );

        if (answer === "0") {
            console.log("Exiting...");
            rl.close();
            break;
        } else if (answer === "1") {
            await addDeliveryAssistant_or_Store('delivery_assistant');
        } else if (answer === "2") {
            await(addDeliveryAssistant_or_Store('store'));
        } else if(answer === "3") {
            await(storeAnalysis());
        } else if(answer === "4") {
            await(productAnalysis());
        } else if (answer === "5") {
            const threshold = await questionAsync("\nEnter Threshold: ");
            await (RefillStock(threshold));
        } else {
            console.log("\nInvalid input");
        }
    }
}

let arr = [];

function countFrequency(arr, target) {
    return arr.reduce((count, str) => {
        return count + (str === target ? 1 : 0);
    }, 0);
}

async function login(tableName) {
    try {
        const email = await questionAsync("Enter Email-ID: ");
        const result = await getTable(tableName);
        const user = result.find(row => row.email_ID === email);
        
        if(user) {
            if(countFrequency(arr, email) >= 3) {
                console.error("\nMaximum login attempts exceeded for this Email-ID\n");
                await login();
            } else {
                const password = await questionAsync("Enter password: ");
                if(user.password === password) {
                    console.log("\nLogin successful");
                    console.log("\nWelcome " + user.name + "!\n");
                    if (tableName === "customer"){
                        CustomerMenu(user.customer_id);
                    } else {
                        AdminMenu(user.admin_id);
                    }
                } else {
                    console.error("\nInvalid password. Please try again.\n");
                    arr.push(email);
                    await login();
                }
            }
        }

        else {
            console.error("\nInvalid Email-ID. Please try again.\n");
            await login();
        }

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function dashboard() {
    while (true) {
        const answer = await questionAsync(
            `\nPress 0 to Exit\n` +
            `Press 1 to Login as Customer\n` +
            `Press 2 to Login as Admin\n` +
            `\nEnter your choice: `
        );

        if (answer === "0") {
            console.log("Exiting...");
            rl.close();
            break;
        } else if (answer === "1") {
            await (login('customer'));
        } else if (answer === "2") {
            await (login('admin'));
        } else {
            console.log("\nInvalid input");
        }
    }
}


dashboard();

