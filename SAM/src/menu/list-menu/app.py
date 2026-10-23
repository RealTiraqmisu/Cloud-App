import json
import logging
import os
from decimal import Decimal

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

MENU_TABLE_NAME = os.environ["MENU_TABLE_NAME"]
MENU_IMAGES_BUCKET = os.environ["MENU_IMAGES_BUCKET"]
IMAGE_URL_EXPIRES = 3600

HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def _json_default(o):
    if isinstance(o, Decimal):
        return int(o) if o == o.to_integral_value() else float(o)
    raise TypeError


def _response(status, body):
    return {
        "statusCode": status,
        "headers": HEADERS,
        "body": json.dumps(body, default=_json_default, ensure_ascii=False),
    }


def _with_image_url(item):
    # category is a GSI key, so it is omitted from the table when empty
    item.setdefault("category", "")
    key = item.get("imageKey")
    item["imageUrl"] = (
        s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": MENU_IMAGES_BUCKET, "Key": key},
            ExpiresIn=IMAGE_URL_EXPIRES,
        )
        if key
        else None
    )
    return item


def lambda_handler(event, context):
    try:
        table = dynamodb.Table(MENU_TABLE_NAME)
        items = []
        kwargs = {}
        while True:
            res = table.scan(**kwargs)
            items.extend(res.get("Items", []))
            if "LastEvaluatedKey" not in res:
                break
            kwargs["ExclusiveStartKey"] = res["LastEvaluatedKey"]

        items = [_with_image_url(i) for i in items]
        items.sort(key=lambda i: i.get("createdAt", ""))
        return _response(200, {"items": items})
    except Exception:
        logger.exception("list-menu failed")
        return _response(500, {"error": "ดึงเมนูไม่สำเร็จ"})
