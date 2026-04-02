// MongoDB initialization script
// This script runs when MongoDB container starts for the first time

// Create database 
db = db.getSiblingDB('NNPTUD-C5');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('carts');
db.createCollection('roles');
db.createCollection('inventories');
db.createCollection('payments');
db.createCollection('reservations');
db.createCollection('messages');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ name: 1 });
db.categories.createIndex({ name: 1 });
db.carts.createIndex({ userId: 1 });

print('MongoDB initialization completed for NNPTUD-C5 database');