import json
import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from botocore.exceptions import BotoCoreError, ClientError

import boto3

dynamodb = boto3.resource("dynamodb")
sqs = boto3.client("sqs")

menu_table = dynamodb.Table(os.environ["MENU_TABLE_NAME"])
orders_table = dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])
ORDER_QUEUE_URL = os.environ["ORDER_QUEUE_URL"]

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


class ValidationError(Exception):
    """Bad request from client -> 400."""


def lambda_handler(event, context):
    try:
        body = parse_body(event)
        validate_body(body)

        items = build_order_items(body["items"])
        order = build_order(body, items)

        orders_table.put_item(Item=order, CondtionExpression="attribute_not_exists(orderId)")
        send_to_queue(order["orderId"])

        return response(201, {"order": order})
    except ValidationError as e:
        return response(400, {"error": str(e)})
    except Exception as e:  # noqa: BLE001
        print(f"ERROR create-order: {e!r}")
        return response(500, {"error": "Internal server error"})


def parse_body(event):
    try:
        return json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        raise ValidationError("Invalid JSON body")


def validate_body(body):
    """required: customerName, items (>= 1, qty >= 1)."""
    if not isinstance(body, dict):
        raise ValidationError("Body must be a JSON object")
    
    name = body.get("customerName")
    if not (isinstance(name, str)) or not name.strip():
        raise ValidationError("customerName is required")

    item = body.get("items")
    if not (isinstance(item, list)) or (len(item) < 1):
        raise ValidationError("items must be a non-empty list")
    for i in item:
        if not (isinstance(i, dict)) or not i.get("menuId"):
            raise ValidationError("Each item requires menuId")
        qty = i.get("qty")
        if isinstance(qty, bool) or not isinstance(qty, int) or qty < 1:
            raise ValidationError("qty must be an integer >= 1")

def build_order_items(request_items):
    """ดึงชื่อ/ราคาจาก Menu เอง (ห้ามเชื่อราคาจาก client) และปฏิเสธเมนูที่ available: false."""
    result = []
    for it in request_items:
        resp = menu_table.get_item(Key={"menuId": it["menuId"]})
        menu = resp.get("Item")
        if not menu or not menu.get("available"):
            raise ValidationError("Invalid Menu")
        result.append({"menuId": menu["menuId"], "name": menu["name"], "price": menu["price"], "qty": it["qty"]})
        
    return result


def build_order(body, items):
    now = utc_now()
    total = sum(i["price"] * i["qty"] for i in items)
    return {
        "orderId": generate_order_id(),
        "queueNumber": None,
        "customerName": body["customerName"],
        "contact": body.get("contact", ""),
        "note": body.get("note", ""),
        "items": items,
        "total": total,
        "status": "PENDING",
        "statusHistory": [{"status": "PENDING", "at": now}],
        "createdAt": now,
        "updatedAt": now,
    }


def generate_order_id():
    date = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"o-{date}-{uuid.uuid4().hex[:4]}"


def send_to_queue(order_id):
    try:
        sqs.send_message(
            QueueUrl=ORDER_QUEUE_URL,
            MessageBody=json.dumps({"orderId": order_id}),
        )
    except (ClientError, BotoCoreError) as e:
        print(f"ERROR send SQS orderId={order_id}: {e!r}")
        orders_table.delete_item(Key={"orderId": order_id})
        raise


def utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


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
