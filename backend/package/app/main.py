from fastapi import FastAPI, Depends, HTTPException, Request, status
from sqlalchemy import text
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, require_role
from app.routers import equipments, hospitals, technicians, workorders, auth, reportinglines, maintenanceflags, users, servicereports
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
import asyncio
from app.models.user import User, UserRole
import boto3

app = FastAPI(
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(equipments.router)
app.include_router(hospitals.router)
app.include_router(technicians.router)
app.include_router(workorders.router)
app.include_router(users.router)
app.include_router(servicereports.router)
app.include_router(auth.router)
app.include_router(reportinglines.router)
app.include_router(maintenanceflags.router)


async def check_database(db: AsyncSession) -> str:
    try:
        await asyncio.wait_for(
            db.execute(text("SELECT 1")),
            timeout=3.0
        )
        return "ok"
    except Exception:
        return "unavailable"


async def check_s3() -> str:
    try:
        s3_client = boto3.client("s3")

        await asyncio.wait_for(
            asyncio.to_thread(
                s3_client.head_bucket,
                Bucket=settings.s3_bucket_name
            ),
            timeout=3.0
        )

        return "ok"
    except Exception:
        return "unavailable"


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/health/ready", tags=["health"])
async def readiness_check(
    db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    database_status = await check_database(db)

    if database_status == "unavailable":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable"
        )
    return {"status": "ready"}

@app.get("/health/detail", tags=["health"])
async def health_detail(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.CLINICAL_ADMIN)
    )
) -> dict:
    database_status, s3_status = await asyncio.gather(
        check_database(db),
        check_s3()
    )
    overall_status = (
        "ok"
        if database_status == "ok" and s3_status == "ok"
        else "degraded"
    )
    return {
        "status": overall_status,
        "dependencies": {
            "database": database_status,
            "s3": s3_status
        }
    }

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error has occurred."},
    )