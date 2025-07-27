const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Cart = require('../models/cart');
const Product = require('../models/product');

const router = express.Router();

// @route   POST /api/cart
// @desc    Add an item to the cart or update its quantity
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ user: userId });
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (cart) {
            // Cart exists for user, check if product exists
            const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

            if (itemIndex > -1) {
                // Product exists in the cart, update quantity
                let productItem = cart.items[itemIndex];
                productItem.quantity += quantity;
            } else {
                // Product does not exist in cart, add new item
                cart.items.push({ 
                    productId, 
                    name: product.name, 
                    price: product.price, 
                    quantity,
                    imageUrl: product.imageUrl
                });
            }
            cart = await cart.save();
            return res.status(200).json(cart);
        } else {
            // No cart for user, create new cart
            const newCart = await Cart.create({
                user: userId,
                items: [{ 
                    productId, 
                    name: product.name, 
                    price: product.price, 
                    quantity,
                    imageUrl: product.imageUrl
                }]
            });
            return res.status(201).json(newCart);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;