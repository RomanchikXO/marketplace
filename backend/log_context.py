# marketplace/backend/log_context.py

import contextvars

task_context = contextvars.ContextVar("task_context", default={})
