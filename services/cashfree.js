import { Cashfree, CFEnvironment } from "cashfree-pg"; 

const cashfree = new Cashfree(CFEnvironment.SANDBOX, "TEST430329ae80e0f32e41a393d78b923034", "TESTaf195616268bd6202eeb3bf8dc458956e7192a85");

export const createOrder = async (
    orderId,
    orderAmount,
    orderCurrency='INR',
    customerID,
    customerPhone,
) => {
    try {
        const expiryDate = new Date(Date.now()+60*60*1000).toISOString();

        const request = {
            "order_amount": orderAmount,
            "order_currency": orderCurrency,
            "order_id": orderId,
            "customer_details": {
                "customer_id": customerID,
                "customer_phone": customerPhone,
                "customer_name": "Harshith",
                "customer_email": "test@cashfree.com"
            },
            "order_meta": {
                "return_url": `http://localhost:3000/payment/${orderId}`,
                "payment_methods": "cc,dc,upi"
            },
            "order_expiry_time": expiryDate
        };

        const response = await cashfree.PGCreateOrder(request);
        return response.data.payment_session_id;
    } catch (error) {
        console.error('Error creating order:', error.response.data.message);
    }
}


export const getPaymentStatus = async(orderId)=>{
    try {
        const response = await cashfree.PGOrderFetchPayments(orderId);

        let getOrderRes = response.data;
        let orderStatus;

        if (getOrderResponse.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
            orderStatus = "Success"
        } else if (getOrderResponse.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
            orderStatus = "Pending"
        } else {
            orderStatus = "Failure"
        }
    } catch (error) {
        console.error('Error fetching payment status:',)
    }
}