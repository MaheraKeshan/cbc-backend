import Order from "../models/order.js";
import Product from "../models/product.js"; // ✅ Make sure you import Product model!

// ✅ Create a new order
export async function createOrder(req, res) {
	if (!req.user) {
		return res.status(403).json({ message: "Please login first" });
	}

	const orderInfo = req.body;

	// Auto-fill name if not provided
	if (!orderInfo.name) {
		orderInfo.name = `${req.user.firstName} ${req.user.lastName}`;
	}

	// Generate unique Order ID (e.g., CBC00552)
	let orderId = "CBC00001";
	const lastOrder = await Order.find().sort({ date: -1 }).limit(1);
	if (lastOrder.length > 0) {
		const lastOrderId = lastOrder[0].orderId; // "CBC00551"
		const lastOrderNumber = parseInt(lastOrderId.replace("CBC", "")); // 551
		const newOrderNumber = lastOrderNumber + 1;
		orderId = "CBC" + String(newOrderNumber).padStart(5, "0"); // CBC00552
	}

	try {
		// Validate product list
		if (!orderInfo.products || !Array.isArray(orderInfo.products) || orderInfo.products.length === 0) {
			return res.status(400).json({ message: "No products provided in order" });
		}

		let total = 0;
		let labelledTotal = 0;
		const products = [];

		for (let i = 0; i < orderInfo.products.length; i++) {
			const productData = orderInfo.products[i];

			const item = await Product.findOne({ productId: productData.productId });
			if (!item) {
				return res.status(404).json({
					message: `Product with productId ${productData.productId} not found`,
				});
			}

			products.push({
				productInfo: {
					productId: item.productId,
					name: item.name,
					altNames: item.altNames,
					description: item.description,
					image: item.image,
					labelledPrice: item.labelledPrice,
					price: item.price,
				},
				quantity: productData.qty,
			});

			total += item.price * productData.qty;
			labelledTotal += item.labelledPrice * productData.qty;
		}

		// Create order
		const order = new Order({
			orderId,
			email: req.user.email,
			name: orderInfo.name,
			address: orderInfo.address,
			phone: orderInfo.phone,
			total,
			labelledTotal,
			products,
			date: new Date()
		});

		const createdOrder = await order.save();

		return res.status(200).json({
			message: "Order created successfully",
			orderId: createdOrder.orderId,
		});
	} catch (err) {
		console.error("Error creating order:", err);
		return res.status(500).json({
			message: "Failed to create order",
			error: err.message,
		});
	}
}

// ✅ Get order(s)
export async function getOrder(req, res) {
	if (!req.user) {
		return res.status(403).json({ message: "Please login first" });
	}

	try {
		if (req.user.role === "admin") {
			// Admin gets all orders
			const orders = await Order.find().sort({ date: -1 });
			return res.json(orders);
		} else {
			// Regular user gets only their most recent order
			const order = await Order.findOne({ email: req.user.email }).sort({ date: -1 });
			return res.json(order);
		}
	} catch (err) {
		console.error("Error fetching orders:", err);
		return res.status(500).json({
			message: "Failed to fetch order(s)",
			error: err.message,
		});
	}
}
function isAdmin(req) {
  return req.user && req.user.role === "admin";
}
export async function updateOrderStatus(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Please login as admin to update orders",
    });
  }
  
  try {
    const orderId = req.params.orderId;
	const status = req.params.status;

	await Order.updateOne(
		{
			orderId: orderId,
		},
		{
			
				status: status,
			},	
		
	)

	res.json({
		message: `Order status updated successfully`,
	});

  }catch (err) {
	res.status(500).json({
	  message: "Failed to update order status",
	  error: err.message,
	});

	return;

  
  }
}
