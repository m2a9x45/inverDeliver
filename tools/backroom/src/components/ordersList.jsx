import React from 'react';
import './ordersList.css';

function Order(props) {

    function handleChange(orderID) {
      props.handleChange(orderID);
    }
  
    function prettyTime(time){
        return new Date(time).toLocaleDateString("en-GB", {
          month: 'short',
          day: 'numeric',
          hour:'numeric',
          minute: 'numeric',
          hour12: true,
      });
    }
  
    function truncate(str) {
      return str.length > 10 ? str.substring(0, 15) + "..." : str;
    }
  
    return (
      <div className="order" onClick={() => handleChange(props.orderID)}>
        <p>Order ID: {truncate(props.orderID)}</p>
        <p>{prettyTime(props.time)}</p>
        <p>{props.status}</p>
      </div>
    )
  }

export default Order;