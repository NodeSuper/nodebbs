/**
 * 支付通知短信模板
 */
export default function paymentNotificationTemplate({ amount, orderNo, time, appName = '我们的平台' }) {
  return {
    content: `【${appName}】您于${time}支付${amount}元成功，订单号：${orderNo}。如有疑问请联系客服。`,
    
    signature: appName,
    
    variables: {
      amount,
      orderNo,
      time,
    },
  };
}
