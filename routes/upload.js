var express = require("express");
var router = express.Router();
let { uploadExcel, uploadImage } = require('../utils/uploadHandler')
let path = require('path')
let excelJs = require('exceljs')
let categoriesModel = require('../schemas/categories')
let productsModel = require('../schemas/products')
let inventoriesModel = require('../schemas/inventories')
let mongoose = require('mongoose')
let slugify = require('slugify')
let usersModel = require('../schemas/users')
let cartsModel = require('../schemas/carts')
let rolesModel = require('../schemas/roles')
let { generateRandomPassword } = require('../utils/passwordHandler')
let { sendUserCredentials } = require('../utils/mailHandler')

router.post('/one_file', uploadImage.single('file'), function (req, res, next) {
    res.send({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
    })
})
router.post('/multiple_file', uploadImage.array('files', 5), function (req, res, next) {
    console.log(req.body);
    res.send(req.files.map(f => {
        return {
            filename: f.filename,
            path: f.path,
            size: f.size
        }
    }))
})
router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, '../uploads', req.params.filename)
    res.sendFile(pathFile)
})
router.post('/excel', uploadExcel.single('file'), async function (req, res, next) {
    //workbook->worksheet->row/column->cell
    let workBook = new excelJs.Workbook();
    let pathFile = path.join(__dirname, '../uploads', req.file.filename)
    await workBook.xlsx.readFile(pathFile)
    let worksheet = workBook.worksheets[0];
    let categories = await categoriesModel.find({})
    let categoriesMap = new Map();
    for (const category of categories) {
        categoriesMap.set(category.name, category.id);
    }
    let getProducts = await productsModel.find({})
    let getSKU = getProducts.map(p => p.sku)
    let getTitle = getProducts.map(p => p.title)
    let result = [];
    for (let index = 2; index <= worksheet.rowCount; index++) {
        let rowError = [];
        const row = worksheet.getRow(index)
        let sku = row.getCell(1).value;
        let title = row.getCell(2).value;
        let category = row.getCell(3).value;
        let price = Number.parseInt(row.getCell(4).value);
        let stock = Number.parseInt(row.getCell(5).value);

        if (price < 0 || isNaN(price)) {
            rowError.push("price phai la so duong")
        }
        if (stock < 0 || isNaN(stock)) {
            rowError.push("stock phai la so duong")
        }
        if (!categoriesMap.has(category)) {
            rowError.push("category khong hop le")
        }
        if (getSKU.includes(sku)) {
            rowError.push("sku da ton tai")
        }
        if (getTitle.includes(title)) {
            rowError.push("title da ton tai")
        }
        if (rowError.length > 0) {
            result.push({
                success: false,
                data: rowError
            })
            continue;
        }
        let session = await mongoose.startSession();
        session.startTransaction()
        try {
            let newProduct = new productsModel({
                sku: sku,
                title: title,
                slug: slugify(title, {
                    replacement: '-',
                    remove: undefined,
                    lower: true,
                    strict: true
                }),
                price: price,
                description: title,
                category: categoriesMap.get(category),
            })
            await newProduct.save({ session })
            let newInventory = new inventoriesModel({
                product: newProduct._id,
                stock: stock
            })
            await newInventory.save({ session })
            await newInventory.populate('product')
            await session.commitTransaction();
            await session.endSession()
            result.push({
                success: true,
                data: newInventory
            })
        } catch (error) {
            await session.abortTransaction();
            await session.endSession()
            result.push({
                success: false,
                data: error.message
            })
        }
    }
    res.send(result)
})

router.post('/users-excel', uploadExcel.single('file'), async function (req, res, next) {
    // Workbook -> worksheet -> row/column -> cell
    let workBook = new excelJs.Workbook();
    let pathFile = path.join(__dirname, '../uploads', req.file.filename);
    await workBook.xlsx.readFile(pathFile);
    let worksheet = workBook.worksheets[0];
    
    // Get existing users for validation
    let existingUsers = await usersModel.find({});
    let existingUsernames = existingUsers.map(u => u.username);
    let existingEmails = existingUsers.map(u => u.email);
    
    // Get default USER role
    let userRole = await rolesModel.findOne({ name: 'USER' });
    if (!userRole) {
        return res.status(400).send({ error: 'USER role not found in database' });
    }
    
    let result = [];
    
    // Process each row starting from row 2 (skip header)
    for (let index = 2; index <= worksheet.rowCount; index++) {
        let rowError = [];
        const row = worksheet.getRow(index);
        
        // Extract data from columns (assuming column 1: username, column 2: email)
        let username = row.getCell(1).value;
        let email = row.getCell(2).value;
        
        // Validate required fields
        if (!username || typeof username !== 'string') {
            rowError.push("username khong duoc de trong hoac sai dinh dang");
        }
        if (!email || typeof email !== 'string') {
            rowError.push("email khong duoc de trong hoac sai dinh dang");
        }
        
        // Validate email format
        if (email && typeof email === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                rowError.push("email sai dinh dang");
            }
        }
        
        // Check for duplicates
        if (existingUsernames.includes(username)) {
            rowError.push("username da ton tai");
        }
        if (existingEmails.includes(email)) {
            rowError.push("email da ton tai");
        }
        
        // If there are validation errors, skip this row
        if (rowError.length > 0) {
            result.push({
                success: false,
                row: index,
                username: username || '',
                email: email || '',
                errors: rowError
            });
            continue;
        }
        
        // Start MongoDB transaction
        let session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // Generate random password
            let randomPassword = generateRandomPassword();
            
            // Create new user
            let newUser = new usersModel({
                username: username,
                email: email,
                password: randomPassword, // Will be hashed by pre-save hook
                role: userRole._id,
                status: false, // Default status
                fullName: '',
                avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                loginCount: 0
            });
            
            await newUser.save({ session });
            
            // Create cart for the user
            let newCart = new cartsModel({
                user: newUser._id,
                products: []
            });
            
            await newCart.save({ session });
            
            // Commit transaction
            await session.commitTransaction();
            await session.endSession();
            
            // Send welcome email
            try {
                await sendUserCredentials(email, username, randomPassword);
            } catch (mailError) {
                console.error("Failed to send email to", email, ":", mailError.message);
                // Continue even if email fails
            }
            
            // Add to result
            result.push({
                success: true,
                row: index,
                username: username,
                email: email,
                message: "User created successfully"
            });
            
            // Update existing arrays to prevent duplicates in same batch
            existingUsernames.push(username);
            existingEmails.push(email);
            
        } catch (error) {
            // Rollback transaction on error
            await session.abortTransaction();
            await session.endSession();
            
            result.push({
                success: false,
                row: index,
                username: username || '',
                email: email || '',
                errors: [error.message]
            });
        }
    }
    
    res.send(result);
});

module.exports = router;