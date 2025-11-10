'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * TimeAgo 组件 - 显示相对时间
 * @param {string} date - ISO 日期字符串
 * @param {string} className - 可选的 CSS 类名
 * @param {boolean} showTooltip - 是否在悬停时显示完整时间（默认 true）
 * @param {string} format - 完整时间的格式（默认 'YYYY-MM-DD HH:mm:ss'）
 */
export default function TimeAgo({ 
  date, 
  className = '', 
  showTooltip = true,
  format = 'YYYY-MM-DD HH:mm:ss'
}) {
  const [timeAgo, setTimeAgo] = useState('');
  const [fullTime, setFullTime] = useState('');

  useEffect(() => {
    if (!date) return;

    const updateTime = () => {
      const dayjsDate = dayjs(date);
      setTimeAgo(dayjsDate.fromNow());
      setFullTime(dayjsDate.format(format));
    };

    // 立即更新一次
    updateTime();

    // 每分钟更新一次
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [date, format]);

  if (!date) return null;

  return (
    <time
      dateTime={date}
      title={showTooltip ? fullTime : undefined}
      className={className}
    >
      {timeAgo}
    </time>
  );
}
