LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} | {levelname} | {name} | {message}',
            'style': '{',  # Используем новый стиль форматирования
        },
    },
    'handlers': {
        'db': {
            'level': 'INFO',  # Уровень логирования для этого обработчика
            'class': 'logging_config.DBLogHandler',  # Путь к нашему кастомному обработчику
            'formatter': 'verbose',  # Указываем форматирование
        },
    },
    'loggers': {
        'core': {
            'handlers': ['db'],  # Добавляем обработчик для записи в базу данных
            'level': 'INFO',  # Уровень логирования
            'propagate': True,  # Пропагируем лог в другие обработчики
        },
        'database': {
            'handlers': ['db'],
            'level': 'INFO',
            'propagate': True,
        },
        'logger': {
            'handlers': ['db'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
