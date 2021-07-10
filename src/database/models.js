const client = require("./connect.js");
const moment = require("moment-timezone");

module.exports = {
  async getOrder(order_id) {
    const orderValidate = moment.tz("America/Sao_Paulo").format("YYYY-MM-DD");
    return new Promise((resolve, reject) => {
      const query = `select * from public.orders inner join public.ordersStatus
      on public.orders.orderId = public.ordersStatus.orderId
      WHERE public.orders.orderId = ${order_id} AND public.orders.dateEmission <= '${orderValidate}' AND public.orders.dateValidate >= '${orderValidate}';`;

      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve(res.rows[0]);
      });
    });
  },
  saveOrder({
    orderId,
    sellerName,
    sellerEmail,
    dateEmission,
    dateValidate,
    price,
  }) {
    const query = `INSERT INTO public.orders(orderId, sellerName, sellerEmail, dateEmission, dateValidate, price)
    VALUES (${orderId}, '${sellerName}', '${sellerEmail}', '${dateEmission}', '${dateValidate}', ${price});`;
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve(res.rows[0]);
      });
    });
  },
  getOneOrder(orderId) {
    const query = `SELECT * FROM public.orders WHERE orderId = ${orderId}`;
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve(res.rows[0]);
      });
    });
  },
  updateOrder({
    orderId,
    sellerName,
    sellerEmail,
    dateEmission,
    dateValidate,
    price,
  }) {
    const query = `UPDATE public.orders SET  sellername = '${sellerName}', selleremail = '${sellerEmail}', dateemission = '${dateEmission}', datevalidate = '${dateValidate}', price = ${price} where orderid = ${orderId};`;
    console.log(query)
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve(true);
      });
    });
  },

  updateOrderStatus({ orderId, status }) {
    const query = `UPDATE public.ordersStatus SET status = '${status}' where orderId = ${orderId};`;
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve(res.rows[0]);
      });
    });
  },
  saveOrderStatus({ orderId, status }) {
    const query = `INSERT INTO public.ordersStatus (orderId, status) VALUES (${orderId}, '${status}');`;
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve(res.rows[0]);
      });
    });
  },
  updatePaymentId({ order_number, status }) {
    const query = `UPDATE public.ordersstatus SET status = '${status}' where payment_id = ${order_number};`;
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve('res.rows[0]');
      });
    });
  },
  updatePaymentStatusAndUrl({ payment_id, status, url, orderId }) {
    console.log({ payment_id, status, url, orderId })
    const query = `UPDATE public.ordersStatus SET status = '${status}', payment_id = '${payment_id}', url = '${url}' where orderId = ${orderId};`;
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve('res.rows[0]');
      });
    });
  },
  async getOrderbyPaymentId (payment_id) {
    const query = `select * from orders where orderid  in (select orderid from ordersstatus where payment_id = '${payment_id}');`;
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) throw reject(err);
        resolve(res.rows[0]);
      });
    })
  }
};

