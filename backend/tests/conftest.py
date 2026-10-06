import pytest_asyncio

from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as client:
        yield client


@pytest_asyncio.fixture
async def admin_headers(client):
    response = await client.post(
        "/auth/token",
        data={
            "username": "admin",
            "password": "Admin000"
        }
    )

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


@pytest_asyncio.fixture
async def technician_headers(client):
    response = await client.post(
        "/auth/token",
        data={
            "username": "technician",
            "password": "Technician000"
        }
    )

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


@pytest_asyncio.fixture
async def auditor_headers(client):
    response = await client.post(
        "/auth/token",
        data={
            "username": "auditor",
            "password": "Auditor000"
        }
    )

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }

