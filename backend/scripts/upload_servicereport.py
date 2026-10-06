import asyncio
import boto3
from app.database import AsyncSessionLocal
from app.models import ServiceReport

BUCKET_NAME = "medflow-servicereport-02-sq"
LOCAL_FILE_PATH = "scripts/sample_services.txt"
S3_KEY = "diagnostics/equipment-test-001.txt"

def upload_to_s3() -> str:
    s3_client = boto3.client("s3")
    s3_client.upload_file(LOCAL_FILE_PATH, BUCKET_NAME, S3_KEY)
    return f"s3://{BUCKET_NAME}/{S3_KEY}"


async def record_service_report(file_url: str) -> None:
    async with AsyncSessionLocal() as session:
        log = ServiceReport(
            work_order_id=1,
            file_url=file_url,
            notes="Uploaded via the medflow boto3 demo script.",
        )
        session.add(log)
        await session.commit()
        await session.refresh(log)
        print(f"Created ServiceReport id={log.id}, file_url={log.file_url}")


async def main() -> None:
    file_url = upload_to_s3()
    print(f"Uploaded to {file_url}")
    await record_service_report(file_url)


if __name__ == "__main__":
    asyncio.run(main())
