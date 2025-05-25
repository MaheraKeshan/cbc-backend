import express from 'express';
import { addReview, getReviewsByProduct } from '../controllers/reviewController.js';


const reviewRouter = express.Router();

reviewRouter.post('/', addReview);
reviewRouter.get('/:productId', getReviewsByProduct);
reviewRouter.delete('/:reviewId', authenticate, deleteReview); // admin only and Users' can delete their own reviews

export default reviewRouter;
