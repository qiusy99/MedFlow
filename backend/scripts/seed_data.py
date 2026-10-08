import asyncio
from decimal import Decimal
import argparse
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models.hospital import Hospital
from app.models.equipment import Equipment
from app.models.technician import Technician
from app.models.workorder import WorkOrder
from app.models.servicereport import ServiceReport
from app.models.enums import EquipmentStatus, WorkOrderPriority, WorkOrderStatus

async def seed_hospitals(session) -> None:
    hospitals = [
        Hospital(
            id=1,
            name="Tampa Hospital",
            location_region="Tampa",
            capacity=50,
            supervisor_id=101,
        ),
        Hospital(
            id=2,
            name="Orlando Hospital",
            location_region="Orlando",
            capacity=100,
            supervisor_id=102,
        ),
        Hospital(
            id=3,
            name="Miami Hospital",
            location_region="Miami",
            capacity=200,
            supervisor_id=103,
        ),
    ]

    for hospital in hospitals:
        existing = await session.get(Hospital, hospital.id)

        if existing is None:
            session.add(hospital)
            print(f"Added hospital: {hospital.name}")
        else:
            print(f"Hospital already exists: {hospital.name}")


async def seed_equipments(session) -> None:
    equipments = [
        Equipment(
            id=1,
            serial_number="Equi-1001",
            model="Model-1",
            status=EquipmentStatus.AVAILABLE,
            charge_level=Decimal("100.00"),
            facility_id=1,
        ),
        Equipment(
            id=2,
            serial_number="Equi-1002",
            model="Model-2",
            status=EquipmentStatus.IN_USE,
            charge_level=Decimal("80.00"),
            facility_id=2,
        ),
        Equipment(
            id=3,
            serial_number="Equi-1003",
            model="Model-1",
            status=EquipmentStatus.MAINTENANCE,
            charge_level=Decimal("40.00"),
            facility_id=3,
        ),
        Equipment(
            id=4,
            serial_number="Equi-1004",
            model="Model-3",
            status=EquipmentStatus.MAINTENANCE,
            charge_level=Decimal("50.00"),
            facility_id=1,
        ),
        Equipment(
            id=5,
            serial_number="Equi-1005",
            model="Model-3",
            status=EquipmentStatus.OFFLINE,
            charge_level=Decimal("10.00"),
            facility_id=3,
        ),
        Equipment(
            id=6,
            serial_number="Equi-1006",
            model="Model-2",
            status=EquipmentStatus.IN_USE,
            charge_level=Decimal("15.00"),
            facility_id=2,
        ),
    ]

    for equipment in equipments:
        existing = await session.get(Equipment, equipment.id)

        if existing is None:
            session.add(equipment)
            print(f"Added equipment: {equipment.serial_number}")
        else:
            print(f"Equipment already exists: {equipment.serial_number}")


async def seed_technicians(session) -> None:
    technicians = [
        Technician(
            id=201,
            name="Jason",
            facility_id=1,
            supervisor_id=101,
        ),
        Technician(
            id=202,
            name="Tom",
            facility_id=2,
            supervisor_id=102,
        ),
        Technician(
            id=203,
            name="Jerry",
            facility_id=3,
            supervisor_id=103,
        ),
        Technician(
            id=204,
            name="Bob",
            facility_id=1,
            supervisor_id=101,
        ),
        Technician(
            id=205,
            name="Lee",
            facility_id=3,
            supervisor_id=103,
        ),
    ]

    for technician in technicians:
        existing = await session.get(Technician, technician.id)

        if existing is None:
            session.add(technician)
            print(f"Added technician: {technician.name}")
        else:
            print(f"Technician already exists: {technician.name}")


async def seed_work_orders(session) -> None:
    work_orders = [
        WorkOrder(
            id=1,
            title="Inspect Infusion Pump",
            priority=WorkOrderPriority.CRITICAL,
            status=WorkOrderStatus.PENDING,
            equipment_id=3,
            technician_id=203,
        ),
        WorkOrder(
            id=2,
            title="Replace Ventilator Battery",
            priority=WorkOrderPriority.MEDIUM,
            status=WorkOrderStatus.IN_PROGRESS,
            equipment_id=5,
            technician_id=202,
        ),
        WorkOrder(
            id=3,
            title="Repair Patient Monitor",
            priority=WorkOrderPriority.CRITICAL,
            status=WorkOrderStatus.PENDING,
            equipment_id=4,
            technician_id=201,
        ),
        WorkOrder(
            id=4,
            title="Run Equipment Diagnostic",
            priority=WorkOrderPriority.MEDIUM,
            status=WorkOrderStatus.COMPLETED,
            equipment_id=1,
            technician_id=204,
        ),
        WorkOrder(
            id=5,
            title="Perform Preventive Maintenance",
            priority=WorkOrderPriority.LOW,
            status=WorkOrderStatus.FAILED,
            equipment_id=2,
            technician_id=202,
        ),
    ]

    for work_order in work_orders:
        existing = await session.get(WorkOrder, work_order.id)

        if existing is None:
            session.add(work_order)
            print(f"Added work order: {work_order.title}")
        else:
            print(f"Work order already exists: {work_order.title}")


async def seed_service_reports(session) -> None:
    service_reports = [
        ServiceReport(
            id=1,
            work_order_id=1,
            file_url="s3://medflow-service-reports/report-001.pdf",
            notes=(
                "Patient monitor inspected. Device requires additional "
                "maintenance before returning to service."
            ),
        ),
    ]

    for report in service_reports:
        existing = await session.get(ServiceReport, report.id)

        if existing is None:
            session.add(report)
            print(f"Added service report: {report.id}")
        else:
            print(f"Service report already exists: {report.id}")


async def reset_seed_data(session) -> None:
    print("Clearing existing seed data...")

    await session.execute(delete(ServiceReport))
    await session.execute(delete(WorkOrder))
    await session.execute(delete(Technician))
    await session.execute(delete(Equipment))
    await session.execute(delete(Hospital))

    print("Existing seed data cleared.")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Seed the MedFlow database."
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear existing seed data before seeding.",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Skip confirmation when resetting seed data.",
    )

    return parser.parse_args()


def confirm_reset() -> bool:
    print("WARNING: This will clear and reload the MedFlow seed data.")
    answer = input("Continue? [y/N]: ").strip().lower()

    return answer in ("y", "yes")

async def main() -> None:
    args = parse_args()

    if args.reset and not args.yes:
        if not confirm_reset():
            print("Reset cancelled.")
            return

    async with AsyncSessionLocal() as session:
        if args.reset:
            await reset_seed_data(session)

        await seed_hospitals(session)
        await seed_equipments(session)
        await seed_technicians(session)
        await seed_work_orders(session)
        await seed_service_reports(session)
        await session.commit()

    print("Seed completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())