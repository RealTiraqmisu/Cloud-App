import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
orders_table = dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])

STATUS_INDEX = "status-createdAt-index"
VALID_STATUSES = {"PENDING", "QUEUED", "PREPARING", "READY", "COMPLETED", "CANCELLED"}

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


class ValidationError(Exception):
    """Bad request from client -> 400."""


def lambda_handler(event, context):
    try:
        statuses = get_statuses(event)

        orders = []
        for status in statuses:
            orders.extend(query_by_status(status))
        orders.sort(key=lambda o: o["createdAt"])  # เก่า -> ใหม่

        return response(200, {"orders": orders})
    except ValidationError as e:
        return response(400, {"error": str(e)})
    except Exception as e:  # noqa: BLE001
        print(f"ERROR list-orders: {e!r}")
        return response(500, {"error": "Internal server error"})


def get_statuses(event):
    """?status=QUEUED,PREPARING,READY -> ['QUEUED', 'PREPARING', 'READY']."""
    raw = (event.get("queryStringParameters") or {}).get("status")
    if not raw:
        # ไม่รองรับ list ทั้งตาราง (ต้อง scan) บังคับให้ระบุ status
        raise ValidationError("status query parameter is required")

    statuses = []
    for s in raw.split(","):
        s = s.strip()
        if s not in VALID_STATUSES:
            raise ValidationError(f"Invalid status: {s}")
        if s not in statuses:
            statuses.append(s)
    return statuses


def query_by_status(status):
    """query GSI ทีละสถานะ (วนหน้าถ้าข้อมูลเกิน 1 MB)."""
    kwargs = {
        "IndexName": STATUS_INDEX,
        "KeyConditionExpression": Key("status").eq(status),
    }
    items = []
    while True:
        resp = orders_table.query(**kwargs)
        items.extend(resp["Items"])
        last_key = resp.get("LastEvaluatedKey")
        if not last_key:
            return items
        kwargs["ExclusiveStartKey"] = last_key


def to_jsonable(obj):
    """DynamoDB ให้ Decimal กลับมา; แปลงเป็น int/float ก่อน json.dumps."""
    if isinstance(obj, Decimal):
        return int(obj) if obj == obj.to_integral_value() else float(obj)
    raise TypeError(f"Not serializable: {type(obj)}")


def response(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(payload, default=to_jsonable, ensure_ascii=False),
    }
