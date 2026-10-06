import asyncio
import boto3
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import ServiceReport

BUCKET_NAME = "medflow-servicereport-02-sq"
DIAGNOSTIC_PREFIX = "diagnostics/"

def extract_s3_key(file_url: str) -> str:
    without_schema = file_url.removeprefix("s3://")
    _,_, key = without_schema.partition("/")
    return key


def list_s3_keys(bucket_name: str, prefix: str) -> set[str]:
    s3_client = boto3.client("s3")
    paginator = s3_client.get_paginator("list_objects_v2")
    keys: set[str] = set()
    for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
        for obj in page.get("Contents", []):
            keys.add(obj["Key"])
    return keys


async def fetch_service_reports() -> list[ServiceReport]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(ServiceReport))
        return list(result.scalars().all())

    
async def main() -> None:
    s3_keys = list_s3_keys(BUCKET_NAME, DIAGNOSTIC_PREFIX)
    reports = await fetch_service_reports()
    healthy: list[ServiceReport] = []
    broken: list[ServiceReport] = []
    reference_keys: set[str] = set()
    for report in reports:
        key = extract_s3_key(report.file_url)
        reference_keys.add(key)
        if key in s3_keys:
            healthy.append(report)
        else:
            broken.append(report)
    orphaned_keys = s3_keys - reference_keys
    print("== Healthy (database row + matching s3 file)==")
    if not healthy:
        print(" None Found ")
    for report in healthy:
        print(f"ServiceReport {report.id}: {report.file_url}")
    print("== Broken (database row, no matching file) ==")
    if not broken:
        print(" None Found ")
    for report in broken:
        print(f"ServiceReport {report.id}: {report.file_url}")
    print("== Orphaned (file in s3, but no matching database row) == ")
    if not orphaned_keys:
        print(" None Found ")
    for key in orphaned_keys:
        print(f"s3://{BUCKET_NAME}/{key}")
if __name__ == "__main__":
    asyncio.run(main())
