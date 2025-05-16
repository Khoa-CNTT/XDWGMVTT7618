const { Customer, Product, Review } = require('../model/model');

const reviewController = {
    // add reivew
    addReview: async (req, res) => {
        try {
            const newReview = new Review(req.body);
            const saveReview = await newReview.save();
            if (req.body.products) {
                const productID = await Product.findById(req.body.products)
                await productID.updateOne({
                    $push: {
                        review: saveReview._id
                    }
                })
            };
            if (req.body.customer) {
                const customerID = await Customer.findById(req.body.customer);
                await customerID.updateOne({
                    $push: {
                        review: saveReview._id
                    }
                })
            }
            res.status(200).json(saveReview);
        } catch (error) {
            console.error("Error in addReview:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // get all review
    getReview: async (req, res) => {
        try {
            const review = await Review.find().populate([
                { path: "customer", select: "name" },
                { path: "products", select: "pd_name" }
            ]);
            res.status(200).json(review)
        } catch (error) {
            console.error("error in GetReview", error);
            res.status(500).json({ message: "sever error", error: error.message || error });
        }
    },
    // delete review
    deleteReview: async (req, res) => {
        try {
            const deleteReview = await Review.findByIdAndDelete(req.params.id);
            if (!deleteReview) {
                return res.status(404).json({ message: "Review not found" });
            }
            // xoa review khoi product
            await Product.findByIdAndUpdate(deleteReview.products,
                {
                    $pull: {
                        review: deleteReview._id
                    }
                }
            ),
                // xoa review khoi customer
                await Customer.findByIdAndUpdate(deleteReview.customer, {
                    $pull: {
                        review: deleteReview._id
                    }
                })
            res.status(200).json({ message: "Review deleted successfully", deletedReview: deleteReview });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }

    },
    // UPDATE REVIEW\
    updateReview: async (req, res) => {
        try {
            const reviewID = await Review.findById(req.params.id);

            if (!reviewID) {
                return res.status(404).json("NOT FOUND");
            }
            // update customer
            if (req.body.customer && req.body.customer !== reviewID.customer?.toString()) {
                if (reviewID.customer) {
                    // xoa
                    await Customer.findByIdAndUpdate(reviewID.customer, {
                        $pull: {
                            review: reviewID._id
                        }
                    });
                    await Customer.findByIdAndUpdate(req.body.customer, {
                        $push: {
                            review: reviewID._id
                        }
                    })
                }
            };
            // UPDATE PRODUCT 
            if (req.body.products && req.body.products !== reviewID.products?.toString()) {
                if (reviewID.products) {
                    // xoa
                    await Product.findByIdAndUpdate(reviewID.products, {
                        $pull: {
                            review: reviewID._id
                        }
                    })
                };
                await Product.findByIdAndUpdate(req.body.products, {
                    $push: {
                        review: reviewID._id
                    }
                })
            };
            const updateReview = await Review.findByIdAndUpdate(reviewID, {
                $set: req.body
            },
                { new: true });

            res.status(200).json({ message: "Review update successfully", updateReview: updateReview });
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
getReviewbyOrder: async (req, res) => {
    try {
        const { order, products } = req.body;

        if (!order) {
            return res.status(400).json({ message: "id_order is required in body" });
        }

        // Tìm review theo trường "order"
        const getReview = await Review.findOne({ order: order })
            .select('products customer content');

        if (!getReview) {
            return res.status(404).json({ message: "No review found for this order" });
        }

        return res.status(200).json({
            message: "Review by order",
            review: getReview
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

}


module.exports = reviewController;