import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './orderInfo.css';

function OrderInfo(props) {

    const updateOrderStatus = async (orderID) => {
        const response  = await fetch(`http://localhost:3002/order/status/${orderID}`, {
            method: 'PATCH',
        });
        if (response.status === 204) {
            return toast.success("🙌 Order Status Updated");
        }
        toast.error("🚨 Order Status wasn't updated, please try again", {autoClose: false})
      }

    function fomatStatus(status) {
        switch (status) {
            case 1:
                return 'Order Recived';
            case 2:
                return 'Awaiting Shopping';
            case 3:
                return 'Shopping';
            case 4:
                return 'Shopping Complete';
            case 5:
                return 'Out for Delivery';
            default:
                return 'Status not reconised';
        }
    }

  return(
    <div>
        <div>
            <div className="orderInfo">
                <p>Order Status:</p>
                <p>{fomatStatus(props.orderData.status)}</p>
            </div>
            <div>
                <p>OrderID: {props.orderData.orderID}</p>
            </div>
        </div>
        <div>
        <button onClick={() => updateOrderStatus(props.orderData.orderID)}>Change Status to: {fomatStatus(props.orderData.status + 1)}</button>
        </div>
        <ToastContainer />
    </div>
  )
}

export default OrderInfo;