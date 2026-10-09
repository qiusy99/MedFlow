import pytest
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from app.models.refresh_token import RefreshToken
from app.security import hash_refresh_token
from app.database import AsyncSessionLocal
import asyncio


# HEALTH CHECK ENDPOINTS
# python -m pytest -k "test_health" -v
@pytest.mark.asyncio
async def test_health_liveness(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_health_ready_success(client):
    response = await client.get("/health/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}

@pytest.mark.asyncio
async def test_health_ready_database_failure(client, monkeypatch):
    async def mock_check_database(db):
        return "unavailable"
    monkeypatch.setattr(
        "app.main.check_database",
        mock_check_database
    )
    response = await client.get("/health/ready")
    assert response.status_code == 503
    assert response.json() == {
        "detail": "Database unavailable"
    }

@pytest.mark.asyncio
async def test_health_detail_admin(client, admin_headers):
    response = await client.get(
        "/health/detail",
        headers=admin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["dependencies"]["database"] == "ok"
    assert data["dependencies"]["s3"] == "ok"


@pytest.mark.asyncio
async def test_health_detail_non_admin(client, auditor_headers):
    response = await client.get(
        "/health/detail",
        headers=auditor_headers
    )
    assert response.status_code == 403


# AUTH
@pytest.mark.asyncio
async def test_login_success(client):
    response = await client.post(
        "/auth/token",
        data={
            "username": "admin",
            "password": "Admin000"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    response = await client.post(
        "/auth/token",
        data={
            "username": "admin",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_valid_refresh_token(client):
    # Login and receive access + refresh tokens
    login_response = await client.post(
        "/auth/token",
        data={
            "username": "admin",
            "password": "Admin000"
        }
    )
    assert login_response.status_code == 200
    old_refresh_token = login_response.json()["refresh_token"]
    # Use refresh token to get a new token pair
    refresh_response = await client.post(
        "/auth/refresh",
        json={
            "refresh_token": old_refresh_token
        }
    )
    assert refresh_response.status_code == 200
    data = refresh_response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["refresh_token"] != old_refresh_token
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_reused_refresh_token(client):
    # Login and get refresh token A
    login_response = await client.post(
        "/auth/token",
        data={
            "username": "admin",
            "password": "Admin000"
        }
    )
    refresh_token_a = login_response.json()["refresh_token"]
    # First use of A succeeds and returns B
    first_refresh = await client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token_a
        }
    )
    assert first_refresh.status_code == 200
    refresh_token_b = first_refresh.json()["refresh_token"]
    # Reusing A should fail
    reused_response = await client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token_a
        }
    )
    assert reused_response.status_code == 401
    # Reuse of A should revoke the entire chain,
    # so B must also fail
    chain_response = await client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token_b
        }
    )
    assert chain_response.status_code == 401

@pytest.mark.asyncio
async def test_expired_refresh_token(client):
    # Login and get a valid refresh token
    login_response = await client.post(
        "/auth/token",
        data={
            "username": "admin",
            "password": "Admin000"
        }
    )
    assert login_response.status_code == 200
    refresh_token = login_response.json()["refresh_token"]
    token_hash = hash_refresh_token(refresh_token)
    # Manually expire the refresh token in the database
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash
            )
        )
        stored_token = result.scalar_one()
        stored_token.expires_at = (
            datetime.now(timezone.utc) - timedelta(minutes=1)
        )
        await session.commit()
    # An expired refresh token must be rejected
    response = await client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_after_logout(client):
    # Login and get a refresh token
    login_response = await client.post(
        "/auth/token",
        data={
            "username": "admin",
            "password": "Admin000"
        }
    )

    refresh_token = login_response.json()["refresh_token"]

    # Logout revokes the refresh token
    logout_response = await client.post(
        "/auth/logout",
        json={
            "refresh_token": refresh_token
        }
    )

    assert logout_response.status_code == 204

    # The same refresh token can no longer be used
    refresh_response = await client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token
        }
    )

    assert refresh_response.status_code == 401


# EQUIPMENT

@pytest.mark.asyncio
async def test_get_equipments(client, admin_headers):
    response = await client.get(
        "/equipments",
        headers=admin_headers
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_low_charge_equipment(client, admin_headers):
    response = await client.get(
        "/equipments?max_charge_level=20",
        headers=admin_headers
    )

    assert response.status_code == 200

    equipments = response.json()

    for equipment in equipments:
        assert float(equipment["charge_level"]) < 20
        assert equipment["status"] != "Offline"


@pytest.mark.asyncio
async def test_admin_can_create_equipment(client, admin_headers):
    serial_number = f"TEST-{uuid.uuid4().hex[:8]}"

    response = await client.post(
        "/equipments",
        json={
            "serial_number": serial_number,
            "model": "Test Model",
            "status": "Available",
            "charge_level": 80,
            "facility_id": 1
        },
        headers=admin_headers
    )

    assert response.status_code == 201

    data = response.json()

    assert data["serial_number"] == serial_number
    assert data["model"] == "Test Model"


@pytest.mark.asyncio
async def test_auditor_cannot_create_equipment(
    client,
    auditor_headers
):
    response = await client.post(
        "/equipments",
        json={
            "serial_number": "TEST-002",
            "model": "Test Model",
            "status": "Available",
            "charge_level": 80,
            "facility_id": 1
        },
        headers=auditor_headers
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_technician_can_update_equipment(
    client,
    technician_headers
):
    response = await client.patch(
        "/equipments/1",
        json={
            "status": "Maintenance",
            "charge_level": 50
        },
        headers=technician_headers
    )

    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "Maintenance"


@pytest.mark.asyncio
async def test_auditor_cannot_update_workorder(
    client,
    auditor_headers
):
    response = await client.patch(
        "/workorders/1/status",
        json={
            "status": "Completed"
        },
        headers=auditor_headers
    )

    assert response.status_code == 403


# HOSPITAL

@pytest.mark.asyncio
async def test_get_hospitals(client, admin_headers):
    response = await client.get(
        "/hospitals",
        headers=admin_headers
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


# WORK ORDERS

@pytest.mark.asyncio
async def test_get_workorders(client, admin_headers):
    response = await client.get(
        "/workorders",
        headers=admin_headers
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_technician_can_update_workorder_status(
    client,
    technician_headers
):
    response = await client.patch(
        "/workorders/1/status",
        json={
            "status": "In-Progress"
        },
        headers=technician_headers
    )

    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "In-Progress"


@pytest.mark.asyncio
async def test_auditor_cannot_update_workorder(
    client,
    auditor_headers
):
    response = await client.patch(
        "/workorders/1/status",
        json={
            "status": "Completed"
        },
        headers=auditor_headers
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_auditor_cannot_update_workorder(
    client,
    auditor_headers
):
    response = await client.patch(
        "/workorders/1/status",
        json={
            "status": "Completed"
        },
        headers=auditor_headers
    )

    assert response.status_code == 403


# CO-LOCATION DISCREPANCY

@pytest.mark.asyncio
async def test_get_discrepancies(client, admin_headers):
    response = await client.get(
        "/workorders/discrepancies",
        headers=admin_headers
    )

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    if data:
        assert "work_order_id" in data[0]
        assert "technician_hospital_id" in data[0]
        assert "equipment_hospital_id" in data[0]


# RELIABILITY METRICS

@pytest.mark.asyncio
async def test_get_reliability_metrics(client, auditor_headers):
    response = await client.get(
        "/workorders/reliabilitymetrics",
        headers=auditor_headers
    )

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    if data:
        assert "device_model" in data[0]
        assert "completion" in data[0]
        assert "failure" in data[0]
        assert "completion_failure_ratio" in data[0]


# REPORTING LINES

@pytest.mark.asyncio
async def test_reporting_lines(client, admin_headers):
    response = await client.get(
        "/reportinglines/101",
        headers=admin_headers
    )

    assert response.status_code == 200

    data = response.json()
    assert data["supervisor_id"] == 101
    assert "total_technician" in data



# MAINTENANCE FLAGS
@pytest.mark.asyncio
async def test_maintenance_flags(client, auditor_headers):
    response = await client.get(
        "/maintenanceflag",
        headers=auditor_headers
    )

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    for hospital in data:
        assert float(hospital["maintenance_percentage"]) > 30