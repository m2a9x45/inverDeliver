import React, { useState, useEffect  } from 'react';
import Order from './components/ordersList';
import OrderDetails from './components/orderDetails';
import OrderInfo from './components/orderInfo';
import './App.css';

function App() {

  const [data, setData] = useState([]);
  const [displayOrder, setDisplayOrder] = useState([]);
  const [orderData, setOrderData] = useState('');
  const [selected, setSelected] = useState('blue');

  function handleChange(data) {

    setSelected(data.orderID);

    const getOrderContent = async () => {
      const result = await fetch(`http://localhost:3002/order/${data.orderID}`);
      const json = await result.json();
      console.log(json);
      setDisplayOrder(json);
      setOrderData(data);
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
            <Order key={order.order_id} handleChange={handleChange} orderID={order.order_id} status={order.status} time={order.time} colour={selected === order.order_id ? '#474747' : '#292929'}/>
          ))}
        </div>
        <div className="Content">
          <div className="orderContent">
            {displayOrder.map(product => (
              <OrderDetails key={product.product_id} name={product.name} image_url={product.image_url} quantity={product.quantity} price={product.price}/>
            ))
            }
            <OrderInfo orderData={orderData}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
