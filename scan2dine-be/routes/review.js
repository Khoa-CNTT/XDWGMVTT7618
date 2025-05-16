var express = require('express');
const reviewController = require('../controller/reviewController');
var router = express.Router();

// add review
router.post('/', reviewController.addReview);
// GET REVIEW
router.get('/', reviewController.getReview);
// get review by order
router.get('/', reviewController.getReviewbyOrder);
// DELETE REVIEW
router.delete('/:id', reviewController.deleteReview);
// UPDATE REVIEW
router.patch('/:id', reviewController.updateReview);
module.exports = router;