import json
import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from botocore.exceptions import BotoCoreError, ClientError

import boto3

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")

orders_table = dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])
TOPIC_ARN = os.environ["ORDER_EVENTS_TOPIC_ARN"]

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}

TRANSITIONS = {
    "PENDING": ["QUEUED", "CANCELLED"],
    "QUEUED": ["PREPARING", "CANCELLED"],
    "PREPARING": ["READY"],
    "READY": ["COMPLETED"],
    "COMPLETED": [],
    "CANCELLED": [],
}


class ValidationError(Exception):
    """Bad request from client -> 400."""


class NotFoundError(Exception):
    """Order does not exist -> 404."""


class ConflictError(Exception):
    """Status change not allowed -> 409."""


def lambda_handler(event, context):
    try:
        order_id = get_order_id(event)
        new_status = get_new_status(event)

        order = update_status(order_id, new_status)

        if new_status == "READY":
            publish_ready_event(order)

        return response(200, {"order": order})
    except ValidationError as e:
        return response(400, {"error": str(e)})
    except NotFoundError as e:
        return response(404, {"error": str(e)})
    except ConflictError as e:
        return response(409, {"error": str(e)})
    except Exception as e:  # noqa: BLE001
        print(f"ERROR update-order-status: {e!r}")
        return response(500, {"error": "Internal server error"})


def get_order_id(event):
    order_id = (event.get("pathParameters") or {}).get("orderId")
    if not order_id:
        raise ValidationError("Invalid order ID")
    return order_id


def get_new_status(event):
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        raise ValidationError("Invalid JSON body")
    if not isinstance(body, dict):
        raise ValidationError("Body must be a JSON object")

    new_status = body.get("status")
    if not isinstance(new_status, str) or new_status not in TRANSITIONS:
        raise ValidationError("Invalid Status")
    return new_status


def update_status(order_id, new_status):
    """update_item แบบมีเงื่อนไข: order ต้องมีอยู่ และสถานะเดิมต้องเปลี่ยนมาเป็น new_status ได้."""
    allowed_from = [s for s, nxt in TRANSITIONS.items() if new_status in nxt]
    now = utc_now()

    if not allowed_from:
        # ไม่มีสถานะไหนเปลี่ยนมา new_status ได้ (เช่น PENDING) และ IN () ว่างใช้ไม่ได้
        raise_not_found_or_conflict(order_id, new_status)

    values = {
        ":new": new_status,
        ":now": now,
        ":h": [{"status": new_status, "at": now}],
    }
    placeholders = []
    for idx, s in enumerate(allowed_from):
        key = f":f{idx}"
        values[key] = s
        placeholders.append(key)

    try:
        resp = orders_table.update_item(
            Key={"orderId": order_id},
            UpdateExpression="SET #s = :new, updatedAt = :now, "
                             "statusHistory = list_append(statusHistory, :h)",
            ConditionExpression=f"attribute_exists(orderId) AND #s IN ({', '.join(placeholders)})",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues=values,
            ReturnValues="ALL_NEW",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise_not_found_or_conflict(order_id, new_status)
        raise
    return resp["Attributes"]


def raise_not_found_or_conflict(order_id, new_status):
    item = orders_table.get_item(Key={"orderId": order_id}).get("Item")
    if not item:
        raise NotFoundError("Order not found")
    raise ConflictError(f"Cannot change status from {item['status']} to {new_status}")


def publish_ready_event(order):
    """ส่ง SNS เมื่อ READY ถ้าล้มเหลวให้ย้อนสถานะกลับแล้ว raise ต่อ (-> 500)."""
    try:
        sns.publish(
            TopicArn=TOPIC_ARN,
            Message=json.dumps(
                {
                    "orderId": order["orderId"],
                    "queueNumber": order.get("queueNumber"),
                    "customerName": order["customerName"],
                    "contact": order.get("contact", ""),
                    "status": "READY",
                },
                default=to_jsonable,
                ensure_ascii=False,
            ),
        )
    except (ClientError, BotoCoreError) as e:
        print(f"ERROR publish SNS orderId={order['orderId']}: {e!r}")
        rollback_status(order)
        raise


def rollback_status(order):
    """ย้อนสถานะ READY กลับเป็นสถานะก่อนหน้า (ถ้า rollback เองล้มเหลวแค่ log)."""
    try:
        previous = order["statusHistory"][-2]["status"]
        orders_table.update_item(
            Key={"orderId": order["orderId"]},
            UpdateExpression="SET #s = :prev, updatedAt = :now "
                             "REMOVE statusHistory[" + str(len(order["statusHistory"]) - 1) + "]",
            ConditionExpression="#s = :ready",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":prev": previous,
                ":now": utc_now(),
                ":ready": "READY",
            },
        )
    except Exception as e:  # noqa: BLE001
        print(f"ERROR rollback orderId={order['orderId']}: {e!r}")


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
