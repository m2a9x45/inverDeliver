import React from 'react';
import './orderDetails.css'

function OrderDetails(props) {
  return(
    <div className="orderItem">
      <div className="orderItemImgAndName">
        <img src={props.image_url} alt="" />
        <p>{props.name}</p>
      </div>
      <div className="orderItemPriceAndAmount">
        <p>Quantity: {props.quantity}</p>
        <p>£{props.price}</p>
      </div>
    </div>
  )
}

export default OrderDetails;