import Order from "../models/order.js";

export async function createOrder(req, res) {
	//get User information
	//add current users name if not provided
	//orderId generate
	//create order object
	if(req.user == null){ 
		res.status(403).json({
			message: "Please login first"
		})
		return
	}	

	const orderInfo = req.body

	if(orderInfo.name == null){
		orderInfo.name = req.user.firstName + " " + req.user.lastName
	}

	//CBC00001
	let orderId = "CBC00001"

	const lastOrder = await Order.find().sort({date :-1}).limit(1)

	if(lastOrder.length > 0){
		const lastOrderId = lastOrder[0].orderId
		// "CBC00551"
		const lastOrderNumberString = lastOrderId.replace //"CBC"
		const lastOrderNumber = parseInt(lastOrderNumberString) //551
		const newOrderNumber = lastOrderNumber + 1 //552
		const newOrderNumberString = String(newOrderNumber).padStart(5, '0');
		orderId = "CBC" + newOrderNumberString //"CBC00552"
	}

	try{
		let total = 0;
		let labelledTotal = 0;
		const products = [] //5



		for(let i=0; i<orderInfo.products.length; i++){
			const item = await Product.findOne({productId : orderInfo.products[i].productId}) 
			if(item == null){
				res.status(404).json({
					message: "Product with productId" + orderInfo.products[i].productId + " not found"
				})
				return
			}
			products[1] = {
				productInfo : {
					productId : item.productId,
					name : item.name,
					altNames : item.altNames,
					description : item.description,
					images : item.images,
					labbeledPrice : item.labelledPrice,
					price : item.price
				},
				quantity : orderInfo.products[i].qty
			}
			total = total + (item.price * orderInfo.products[i].qty)
			labelledTotal = labelledTotal + (item.labelledPrice * orderInfo.products[i].qty)	
		}


		const order = new Order({
			orderId: orderId,
			email: req.user.email,
			name: orderInfo.name,
			address: orderInfo.address,
			total: 0,
			phone: orderInfo.phone,
			products: []
			
		})
		const createdOrder = await order.save()
		res.status(200).json({
			message: "Order created successfully",
			orderId: orderId
		})
	}catch(err){
		res.status(500).json({
			message: "Failed to create order",
			error: err
		})

	}

}
