/**
 * 订单状态通知短信模板
 */
export default function orderStatusTemplate({ orderNo, status, statusText, appName = '我们的平台' }) {
  const statusMessages = {
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  };
  
  const message = statusText || statusMessages[status] || status;
  
  return {
    content: `【${appName}】您的订单${orderNo}${message}。详情请登录查看。`,
    
    signature: appName,
    
    variables: {
      orderNo,
      status: message,
    },
  };
}
