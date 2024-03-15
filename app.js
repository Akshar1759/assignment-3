const express = require("express");
const path = require("path");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const uri = "mongodb://127.0.0.1:27017/Juices";
mongoose.connect(uri).then(() => {
    console.log("connected to db!");
});

const Order = mongoose.model(
    "Order",
    new mongoose.Schema(
        {
            name: String,
            
            phone: String,
            product1: Number,
            product2: Number,
            product3: Number,
            grossAmt: Number,
            taxAmount: Number,
            totalCost: Number,
        },
        { collection: "orders" }
    )
);

const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
});

app.post(
    "/receipt",
    [
        check("name", "Please Enter your valid Name").notEmpty(),
        
        check("phone", "Please Enter your valid Phonenumber").matches(/^\d{3}-\d{3}-\d{4}$/),
        
        check("product1", "Please Enter Mango Juice quantity").isNumeric(),
        check("product2", "Please Enter Berry Juice quantity").isNumeric(),
        check("product3", "Please Enter Apple Juice quantity").isNumeric(),
    ],
    (req, res) => {
        var name = req.body.name;
        
        var phone = req.body.phone;
        
        var product1 = parseInt(req.body.product1);
        var product2 = parseInt(req.body.product2);
        var product3 = parseInt(req.body.product3);

        let errors = validationResult(req);
        console.log(req.body);

        if (!errors.isEmpty()) {
            res.render("home", { errors: errors.array() });
        } else {
            const taxRate = 13 || 0;

            var i1Prize = 2.99;
            var i2Prize = 1.99;
            var i3Prize = 2.49;

            var i1Qnt = product1;
            var i2Qnt = product2;
            var i3Qnt = product3;
            var netAmount = (i1Qnt * i1Prize) + (i2Qnt * i2Prize) + (i3Qnt * i3Prize);
            var tax = netAmount * taxRate / 100;
            var netCost = netAmount + tax;

            var newOrder = new Order({
                name: name,
                
                phone: phone,
               
                product1: product1,
                product2: product2,
                product3: product3,
               
                grossAmt: netAmount,
                taxAmount: tax,
                totalCost: netCost,
            });

            newOrder
                .save()
                .then(function (savedOrder) {
                    console.log("Order saved successfully");
                    res.render("receipt", { order: savedOrder });
                })
                .catch(function (error) {
                    console.log("Error saving order: ", error);
                    res.render("error", {
                        message: "There was an error processing your order. Please try again later.",
                    });
                });
        }
    }
);

app.get("/alldata", function (req, res) {
    Order.find({})
        .then((orders) => {
            console.log("Retrieved orders:", orders);
            res.render("alldata", { orders: orders });
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            res.status(500).render("error", { message: "Error fetching data from the database." });
        });
});

app.listen(port, () => {
    console.log(`Click the link to open App in Browser http://localhost:${port}`);
});
