import json
import logging
import os
import uuid

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")

MENU_IMAGES_BUCKET = os.environ["MENU_IMAGES_BUCKET"]
UPLOAD_URL_EXPIRES = 300
DOWNLOAD_URL_EXPIRES = 3600

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}

HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def _response(status, body):
    return {
        "statusCode": status,
        "headers": HEADERS,
        "body": json.dumps(body, ensure_ascii=False),
    }


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        body = None
    if not isinstance(body, dict):
        return _response(400, {"error": "รูปแบบข้อมูลไม่ถูกต้อง"})

    content_type = body.get("contentType")
    ext = ALLOWED_TYPES.get(content_type)
    if not ext:
        return _response(400, {"error": "รองรับเฉพาะไฟล์รูป (jpg, png, webp, gif)"})

    try:
        image_key = f"menu/{uuid.uuid4()}.{ext}"
        upload_url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": MENU_IMAGES_BUCKET,
                "Key": image_key,
                "ContentType": content_type,
            },
            ExpiresIn=UPLOAD_URL_EXPIRES,
        )
        image_url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": MENU_IMAGES_BUCKET, "Key": image_key},
            ExpiresIn=DOWNLOAD_URL_EXPIRES,
        )
        return _response(
            200,
            {"uploadUrl": upload_url, "imageKey": image_key, "imageUrl": image_url},
        )
    except Exception:
        logger.exception("get-upload-url failed")
        return _response(500, {"error": "สร้างลิงก์อัปโหลดไม่สำเร็จ"})
