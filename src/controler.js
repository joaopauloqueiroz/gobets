const axios = require("axios");
const model = require("./database/models");
const { generateAuth, createLink } = require("./cielo");
const moment = require("moment-timezone");
const status = require("./status.json");
const path = require("path");

const { sendEmail } = require('./mail/mail')

function getNumberOfInstallments(value) {
  if(value < 200) {
    return 1;
  }
  if(value > 200 && value < 500) {
    return 2;
  }else {
    if(value > 500) {
      return 3;
    }
  }
}

function formatDate(date) {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  return `${year}-${month}-${day}`;
}
module.exports = {
  async store(req, res) {
    const {
      orderId,
      sellerName,
      sellerEmail,
      dateEmission,
      dateValidate,
      price,
    } = req.body;

    console.log(JSON.stringify(req.body));
    try {
      const orderData = await model.getOneOrder(orderId);
      if (orderData) {
        await model.updateOrder({
          orderId,
          sellerName,
          sellerEmail,
          dateEmission: formatDate(dateEmission),
          dateValidate: moment(formatDate(dateEmission))
            .add(10, "days")
            .format("YYYY-MM-DD"),
          price,
        });
        await model.updateOrderStatus({ orderId, status: "open" });
      } else {
        await model.saveOrder({
          orderId,
          sellerName,
          sellerEmail,
          dateEmission: formatDate(dateEmission),
          dateValidate: moment(formatDate(dateEmission))
            .add(10, "days")
            .format("YYYY-MM-DD"),
          price,
        });
        await model.saveOrderStatus({ orderId, status: "open" });
      }
      return res.send({
        orderId,
        sellerName,
        sellerEmail,
        dateEmission: formatDate(dateEmission),
        dateValidate: moment(formatDate(dateEmission))
          .add(10, "days")
          .format("YYYY-MM-DD"),
        price,
      });
    } catch (error) {
      return res.status(500).send({ error: "Erro ao gerar link de pagamento" });
    }
  },

  async get(req, res) {
    const { token } = req.query;
    const buff = new Buffer.from(token, "base64");
    try {
      const orderData = await model.getOrder(buff.toString("ascii"));
      console.log(JSON.stringify(orderData))
      if (orderData && orderData.status === "current") {
        return res.redirect(orderData.url);
      }
      if (orderData && orderData.status === "open") {
        const result = await generateAuth();
        const objectOrder = {
          type: "Digital",
          name: `Orçaento numero: ${orderData.orderid}`,
          description: "Orçamento dos pedidos da loja pronto socorro do vidro",
          showDescription: true,
          price: orderData.price.replace(/[,.]/, ""),
          expirationDate: moment(orderData.datevalidate).format("YYYY-MM-DD"),
          maxNumberOfInstallments: getNumberOfInstallments(orderData.price) ,
          shipping: {
            type: "WithoutShipping",
            name: "Pronto socorro do Vidro",
            price: 0,
          },
        };
        const response = await createLink(objectOrder, result.access_token);
        await model.updatePaymentStatusAndUrl({
          payment_id: response.id,
          status: "current",
          url: response.shortUrl,
          orderId: orderData.orderid,
        });
        return res.redirect(response.shortUrl);
      }
      return res.sendFile(path.join(__dirname+'/public/index.html'));
    } catch (error) {
      return res.status(500).send({ error: "Erro ao gerar link de pagamento" });
    }
  },
  async update(req, res) {
    console.log('req.body status')
    console.log(JSON.stringify(req.body))
    try {
      const { order_number, payment_status } = req.body;
      if(order_number) {
        await model.updatePaymentId({
          order_number,
          status: status[payment_status],
        });
        const order = await model.getOrderbyPaymentId(order_number);
        if(payment_status === 2) {
          console.log('ENVIAR EMAIL')
          await sendEmail(`O pedido numero: ${order.orderid} foi pago`, order.selleremail)
        }
      }
      return res.status(200).send({ order_number: 'success' });
    } catch (error) {
      console.log(error)
      return res.status(200).send("Erro ao enviar dados para a status!");
    }
  },

  async notification(req, res) {
    try {
      console.log('req.body notification')
    console.log(JSON.stringify(req.body))
      const { order_number, payment_status } = req.body;
      if(order_number) {
        await model.updatePaymentId({
          order_number,
          status: status[payment_status],
        });
        const order = await model.getOrderbyPaymentId(order_number);
        if(payment_status === 2) {
          console.log('ENVIAR EMAIL')
          await sendEmail(`O pedido numero: ${order.orderid} foi pago`, order.selleremail)
        }
      }
      return res.status(200).send({ order_number: 'success' });
    } catch (error) {
      console.log(error)
      return res.status(200).send("Erro ao enviar dados para a status!");
    }
  },
};
