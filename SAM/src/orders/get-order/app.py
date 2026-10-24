import json
import os
from decimal import Decimal

import boto3

dynamodb = boto3.resource("dynamodb")
orders_table = dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def lambda_handler(event, context):
    try:
        order_id = (event.get("pathParameters") or {}).get("orderId")
        if not order_id:
            return response(400, {"error": "Invalid order ID"})

        item = orders_table.get_item(Key={"orderId": order_id}).get("Item")
        if not item:
            return response(404, {"error": "Order not found"})

        return response(200, {"order": item})
    except Exception as e:  # noqa: BLE001
        print(f"ERROR get-order: {e!r}")
        return response(500, {"error": "Internal server error"})


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
