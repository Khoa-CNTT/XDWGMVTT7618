const express = require("express");
const axios = require("axios");
const moment = require("moment");
const CryptoJS = require("crypto-js");


const config = {
    app_id: "2554",
    key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
    key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
}

const paymentzalo = {
    payment: async (req, res) => {
        try {
            const { amount } = req.body;
            const transID = `${moment().format('YYMMDD')}_${Math.floor(Math.random() * 1000000)}`;
            const items = [{}];
            const embed_data = {
                preferred_payment_method: ['zalopay_wallet'],
            };
            const order = {
                app_id: config.app_id,
                app_trans_id: transID,
                app_user: "Anhquyen123",
                app_time: Date.now(),
                item: JSON.stringify(items),
                embed_data: JSON.stringify(embed_data),
                amount: amount,
                description: `Lazada - Payment for the order #${transID}`,
                bank_code: "",
            };
            const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
            order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

            const response = await axios.post(config.endpoint, null, {
                params: order
            });

            return res.status(200).json({ data: response.data });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
};
module.exports = paymentzalo;