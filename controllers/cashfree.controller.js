import { createOrder } from "../services/cashfree.js";
import Payment from "../models/payment.model.js";

export const paymentProcess = async(req, res)=>{
    const orderId = `ORDER_${Math.floor(Math.random()*1000000)}`;
    const orderAmount = 2000;
    const customerID = "1";
    const customerPhone = "9090407368";
    const orderCurrency = "INR";

    try{
        const paymentSessionId = await createOrder(
            orderId,
            orderAmount,
            orderCurrency,
            customerID,
            customerPhone,
        );

        await Payment.create({
            orderId,
            orderAmount,
            paymentSessionId,
            orderCurrency,
            paymentStatus: "Success",
            UserId: req.user.id
        })

        res.json({paymentSessionId, orderId});
    } catch(error){
        res.status(500).json({message: "Error cashfree controller",error: error.message});
    }
}

export const getPremiumStatus = async(req, res)=>{
    try {
        const payment = await Payment.findOne({where: {UserId: req.user.id}});
        if(payment){
            res.status(200).json({paymentStatus: payment.paymentStatus});
        } else {
            res.status(404).json({message: "No payment record found"});
        }
    } catch (error) {
        res.status(500).json({message: "Error fetching premium status", error: error.message});
    }
}