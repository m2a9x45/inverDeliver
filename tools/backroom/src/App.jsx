import React, { useState, useEffect  } from 'react';
import Order from './components/ordersList';
import OrderDetails from './components/orderDetails';
import './App.css';

function App() {

  const [data, setData] = useState([]);
  const [displayOrder, setDisplayOrder] = useState([]);

  function handleChange(orderID) {

    const getOrderContent = async () => {
      const result = await fetch(`http://localhost:3002/order/${orderID}`);
      const json = await result.json();
      console.log(json);
      setDisplayOrder(json);
    }

    getOrderContent();
  }

  useEffect(() => {

    const fecthData = async () => {
      const result = await fetch('http://localhost:3002/order/all');
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
            <Order key={order.order_id} handleChange={handleChange} orderID={order.order_id} status={order.status} time={order.time}/>
          ))}
        </div>
        <div className="Content">
          <div className="orderContent">
            {displayOrder.map(product => (
              <OrderDetails key={product.product_id} name={product.name} image_url={product.image_url} quantity={product.quantity} price={product.price}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
