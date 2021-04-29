import React, { useState, useEffect  } from 'react';
import './App.css';

function App() {

  const [data, setData] = useState([]);
  const [order, setOrder] = useState('');

  useEffect(() => {

    const fecthData = async () => {
      const result = await fetch('http://localhost:3001/order/all');
      const json = await result.json();
      setData(json);
    }

    fecthData();
  }, []);

  return (
    <div className="App">
      <div className="Layout">
        <div className="Sidebar">
          {data.map(order => (
            <Order key={order.order_id} orderID={order.order_id} status={order.status} time={order.time} setOrder={setOrder}/>
          ))}
        </div>
        <div className="Content">
            <p>Content {order}</p>
        </div>
      </div>
    </div>
  );
}

function Order(props) {

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
    <div className="order" onClick={() => props.setOrder(props.orderID)}>
      <p>Order ID: {truncate(props.orderID)}</p>
      <p>{prettyTime(props.time)}</p>
      <p>{props.status}</p>
    </div>
  )
}

export default App;
