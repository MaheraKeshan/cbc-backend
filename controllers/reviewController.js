import Review from '../models/review.js';
import Product from '../models/product.js';

// POST /reviews
export async function addReview(req, res) {
	if (!req.user) {
		return res.status(403).json({ message: "Please login to submit a review" });
	}

	const { productId, rating, comment } = req.body;

	if (!rating || !comment) {
		return res.status(400).json({ message: "Rating and comment are required" });
	}

	try {
		const product = await Product.findOne({ productId });
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const review = new Review({
			productId,
			userEmail: req.user.email,
			userName: `${req.user.firstName} ${req.user.lastName}`,
			rating,
			comment
		});

		await review.save();
		res.status(200).json({ message: "Review added successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Failed to submit review" });
	}
}

// GET /reviews/:productId
export async function getReviewsByProduct(req, res) {
	const { productId } = req.params;

	try {
		const reviews = await Review.find({ productId }).sort({ date: -1 });
		res.status(200).json(reviews);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Failed to fetch reviews" });
	}
}

// DELETE /reviews/:reviewId (admin only)
// DELETE /reviews/:reviewId
export async function deleteReview(req, res) {
	if (!req.user) {
		return res.status(403).json({ message: "You must be logged in to delete a review" });
	}

	const { reviewId } = req.params;

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		// Admins can delete any review; users can delete their own
		const isAdmin = req.user.role === "admin";
		const isOwner = req.user.email === review.userEmail;

		if (!isAdmin && !isOwner) {
			return res.status(403).json({ message: "You are not authorized to delete this review" });
		}

		await Review.deleteOne({ _id: reviewId });

		res.status(200).json({ message: "Review deleted successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Failed to delete review" });
	}
}

