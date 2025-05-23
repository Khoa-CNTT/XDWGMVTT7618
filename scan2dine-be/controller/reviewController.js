
const { Customer, Product, Review, Order } = require('../model/model');
const reviewController = {
    // add reivew
    addReview: async (req, res) => {
        try {
            console.log("Review payload:", req.body);
            const newReview = new Review(req.body);
            const saveReview = await newReview.save();
            if (req.body.product) {
                const productID = await Product.findById(req.body.product)

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
                { path: "product", select: "pd_name" }
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
            await Product.findByIdAndUpdate(deleteReview.product,
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
            if (req.body.product && req.body.product !== reviewID.product?.toString()) {
                if (reviewID.product) {
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
    },
    getReviewByCustomerId: async (req, res) => {

        const { orderId, customerId } = req.body;
        if (!orderId ||!customerId) {
            return res.status(400).json({ message: "customerId là bắt buộc" });
        }
        try {
            const order = await Order.findById(orderId)
                .populate({
                    path: 'orderdetail',
                    populate: {
                        path: 'products',
                        model: 'Product',
                        populate: {
                            path: 'review',
                            model: 'Review',
                            populate: {
                                path: 'customer',
                                model: 'Customer',
                                select: 'name'
                            }
                        }
                    }
                });

            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
            }

            const result = order.orderdetail.map(detail => {
                const product = detail.products;
                // Lọc review chỉ của khách hàng hiện tại và đúng orderId
                const customerReviews = (product.review || []).filter(r =>
                    r.customer && r.customer._id && r.customer._id.toString() === customerId
                    && r.order && r.order.toString() === orderId
                );
                console.log('Product:', product.pd_name, 'CustomerReviews:', customerReviews);
                return {
                    _id: product._id,
                    pd_name: product.pd_name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    reviews: customerReviews.map(r => ({
                        _id: r._id,
                        content: r.content,
                        date: r.date,
                        rating: r.rating,
                        customerName: r.customer?.name || 'Ẩn danh'
                    }))
                };
            });

            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm và đánh giá.' });
        }
    }
}
module.exports = reviewController;