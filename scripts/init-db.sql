-- PostgreSQL 初始化脚本
-- 这个脚本会在数据库首次创建时执行

-- 创建扩展（如果需要）
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 数据库已由 POSTGRES_DB 环境变量创建
-- 这里可以添加其他初始化 SQL

\echo '数据库初始化完成'
