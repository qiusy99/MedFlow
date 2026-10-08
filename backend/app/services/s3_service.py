import uuid

import boto3
from fastapi import UploadFile

from app.config import settings


s3_client = boto3.client("s3")


async def upload_service_report(file: UploadFile) -> str:
    extension = ""

    if file.filename and "." in file.filename:
        extension = "." + file.filename.rsplit(".", 1)[1]

    object_key = f"service-reports/{uuid.uuid4()}{extension}"

    s3_client.upload_fileobj(
        file.file,
        settings.s3_bucket_name,
        object_key,
        ExtraArgs={
            "ContentType": file.content_type or "application/octet-stream"
        },
    )

    return f"s3://{settings.s3_bucket_name}/{object_key}"