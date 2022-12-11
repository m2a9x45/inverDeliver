
## Your Batches
Are orders that have been selected by the shopper for them to work. They'll start with an
order status of `order_received` which won't be updated to `shopping` until the shopper
has arrived at the shop.

When a shopper selects a batch to work, the `order_fulfillment` will be updated to
`assigned` and the assigned timestamp recorded. 

## Available Batches
Are all the available orders that a shopper can select to work. An available batches
is a batch that has the order status of `order_received` and a order_fulfillment status of
`assignable`