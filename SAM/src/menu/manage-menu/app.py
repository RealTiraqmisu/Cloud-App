import json
import logging
import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

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


def _now():
    return datetime.now(timezone.utc).isoformat()


def _parse_fields(body):
    """Validate the request body. Returns (fields, error_message)."""
    name = str(body.get("name") or "").strip()
    if not name:
        return None, "กรุณาระบุชื่อเมนู"

    try:
        price = Decimal(str(body.get("price")))
    except Exception:
        return None, "ราคาไม่ถูกต้อง"
    if not price.is_finite() or price < 0:
        return None, "ราคาไม่ถูกต้อง"

    return {
        "name": name,
        "description": str(body.get("description") or "").strip(),
        "price": price,
        "category": str(body.get("category") or "").strip(),
        "imageKey": body.get("imageKey") or None,
        "available": body.get("available") is not False,
    }, None


def _create(table, body):
    fields, err = _parse_fields(body)
    if err:
        return _response(400, {"error": err})

    now = _now()
    item = {"menuId": str(uuid.uuid4()), **fields, "createdAt": now, "updatedAt": now}
    if not item["category"]:
        # DynamoDB rejects an empty string for an index key attribute
        del item["category"]
    table.put_item(Item=item)
    return _response(201, {"item": _with_image_url(item)})


def _update(table, menu_id, body):
    fields, err = _parse_fields(body)
    if err:
        return _response(400, {"error": err})

    values = {
        ":name": fields["name"],
        ":description": fields["description"],
        ":price": fields["price"],
        ":imageKey": fields["imageKey"],
        ":available": fields["available"],
        ":updatedAt": _now(),
    }
    set_clause = (
        "#n = :name, description = :description, price = :price, "
        "imageKey = :imageKey, available = :available, updatedAt = :updatedAt"
    )
    remove_clause = ""
    if fields["category"]:
        set_clause += ", category = :category"
        values[":category"] = fields["category"]
    else:
        remove_clause = " REMOVE category"

    try:
        res = table.update_item(
            Key={"menuId": menu_id},
            UpdateExpression=f"SET {set_clause}{remove_clause}",
            ExpressionAttributeNames={"#n": "name"},
            ExpressionAttributeValues=values,
            ConditionExpression="attribute_exists(menuId)",
            ReturnValues="ALL_NEW",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return _response(404, {"error": "ไม่พบเมนูนี้"})
        raise
    return _response(200, {"item": _with_image_url(res["Attributes"])})


def _delete(table, menu_id):
    try:
        table.delete_item(
            Key={"menuId": menu_id},
            ConditionExpression="attribute_exists(menuId)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return _response(404, {"error": "ไม่พบเมนูนี้"})
        raise
    return _response(200, {"ok": True})


def lambda_handler(event, context):
    method = event.get("httpMethod")
    menu_id = (event.get("pathParameters") or {}).get("menuId")

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        body = None
    if not isinstance(body, dict):
        return _response(400, {"error": "รูปแบบข้อมูลไม่ถูกต้อง"})

    try:
        table = dynamodb.Table(MENU_TABLE_NAME)
        if method == "POST" and not menu_id:
            return _create(table, body)
        if method == "PUT" and menu_id:
            return _update(table, menu_id, body)
        if method == "DELETE" and menu_id:
            return _delete(table, menu_id)
        return _response(405, {"error": "ไม่รองรับ method นี้"})
    except Exception:
        logger.exception("manage-menu failed")
        return _response(500, {"error": "จัดการเมนูไม่สำเร็จ"})
