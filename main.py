#!/usr/bin/env python3
import uvicorn

from backend.app.core import config


if __name__ == "__main__":
    uvicorn.run(
        "backend.app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
    ) 