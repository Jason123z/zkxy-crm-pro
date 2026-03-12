import jwt
from fastapi import Header, HTTPException
from .config import settings

def get_current_user_id(authorization: str = Header(None)) -> str:
    print(f"DEBUG: Authorization Header: {authorization}")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        token = authorization.replace("Bearer ", "")
        print(f"DEBUG: Extracted Token: {token[:20]}...")
        
        payload = jwt.decode(token, options={"verify_signature": False})
        print(f"DEBUG: Decoded Payload: {payload}")
        user_id = payload.get("sub")
        print(f"DEBUG: Resolved User ID: {user_id}")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid User ID in Token")
        
        return user_id
    except Exception as e:
        print(f"DEBUG: Auth Error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")
