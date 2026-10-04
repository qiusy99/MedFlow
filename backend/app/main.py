from fastapi import FastAPI
from app.routers import equipments, hospitals, technicians, workorders, auth, reportinglines, maintenanceflags, users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(equipments.router)
app.include_router(hospitals.router)
app.include_router(technicians.router)
app.include_router(workorders.router)
app.include_router(auth.router)
app.include_router(reportinglines.router)
app.include_router(maintenanceflags.router)
app.include_router(users.router)