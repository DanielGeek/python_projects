from fastmcp import FastMCP
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import JSONResponse
# from fastmcp.server.auth import BearerAuthProvider # old version for BearerAuthProvider
from fastmcp.server.auth.providers.jwt import JWTVerifier
from fastmcp.server.dependencies import get_access_token, AccessToken
import os

load_dotenv()

auth = JWTVerifier(
    jwks_uri=f"{os.getenv('STYTCH_DOMAIN')}/.well-known/jwks.json",
    issuer=os.getenv("STYTCH_DOMAIN"),
    algorithm="RS256",
    audience=os.getenv("STYTCH_PROJECT_ID")
)

# old version
# auth = BearerAuthProvider(
#     jwks_uri=f"{os.getenv('STYTCH_DOMAIN')}/.well-known/jwks.json",
#     issuer=os.getenv("STYTCH_DOMAIN"),
#     algorithm="RS256",
#     audience=os.getenv("STYTCH_PROJECT_ID")
# )

mcp = FastMCP(name="Notes App", auth=auth)

@mcp.tool()
def get_my_notes(_ctx) -> str:
    """Get all notes for a user"""
    return "no notes"

@mcp.tool()
def add_note(_ctx, content: str) -> str:
    """Add a note for a user"""
    return f"added note: {content}"

@mcp.custom_route("/.well-known/oauth-protected-resource", methods=["GET", "OPTIONS"])
def oauth_metadata(request: StarletteRequest) -> JSONResponse:
    base_url = str(request.base_url).rstrip("/")

    return JSONResponse(
        {
            "resource": base_url,
            "authorization_servers": [os.getenv("STYTCH_DOMAIN")],
            "scopes_supported": ["read", "write"],
            "bearer_methods_supported": ["header", "body"]
        }
    )

if __name__ == "__main__":
    mcp.run(
        transport="http",
        host="127.0.0.1",
        port=8000,
        middleware=[
            Middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"]
            )
        ]
    )
