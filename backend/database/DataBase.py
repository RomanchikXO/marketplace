import os

import psycopg2
import asyncpg



DATABASE_CONFIG = {
    'dbname': os.environ.get('POSTGRES_DB'),
    'user': os.environ.get('POSTGRES_USER'),
    'password': os.environ.get('POSTGRES_PASSWORD'),
    'host': 'postgres',
    'port': 5432,
}


def connect_to_database():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        return conn
    except psycopg2.Error as e:
        # logger.error(f"Ошибка подключения к базе данных: {e}")
        print(f"Ошибка подключения к базе данных: {e}")
        return None


async def async_connect_to_database():
    """
    Асинхронное подключение к базе данных с использованием пула соединений.
    """
    try:
        return await asyncpg.create_pool(
            user=DATABASE_CONFIG['user'],
            password=DATABASE_CONFIG['password'],
            database=DATABASE_CONFIG['dbname'],
            host=DATABASE_CONFIG['host'],
            port=DATABASE_CONFIG['port']
        )
    except Exception as e:
        print(f"Ошибка подключения к базе данных: {e}")
        return None


def close_connection(conn):
    if conn:
        conn.close()

