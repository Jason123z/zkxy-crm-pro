import uvicorn
import os
import sys

# Add current directory and venv_fix to sys.path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'venv_fix'))

if __name__ == "__main__":
    # Start uvicorn pointing to main:app
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

