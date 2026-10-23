import json
import os
from datetime import datetime, timezone, timedelta

import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
orders = dynamodb.Table(os.environ["ORDERS_TABLE_NAME"])
counters = dynamodb.Table(os.environ["COUNTERS_TABLE_NAME"])

THAI_TZ = timezone(timedelta(hours=7))


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def counter_name():
    # เลขคิวรีเซ็ตทุกเที่ยงคืนเวลาไทย
    return "queue-" + datetime.now(THAI_TZ).strftime("%Y-%m-%d")


def lambda_handler(event, context):
    for record in event["Records"]:
        order_id = json.loads(record["body"])["orderId"]
        process_order(order_id)


def process_order(order_id):
    order = orders.get_item(Key={"orderId": order_id}).get("Item")

    # ยังไม่เจอ order: ให้ error เพื่อให้ SQS ลองใหม่ (ครบ 3 ครั้งเข้า DLQ)
    if order is None:
        raise RuntimeError(f"order {order_id} not found")

    # ไม่ใช่ PENDING (ทำไปแล้ว/ถูกยกเลิก): ข้าม ไม่ต้อง retry และไม่เปลืองเลขคิว
    if order["status"] != "PENDING":
        print(f"skip {order_id}: status is {order['status']}")
        return

    # ออกเลขคิว (atomic ไม่ซ้ำแม้มีสองคำขอพร้อมกัน)
    counter = counters.update_item(
        Key={"counterName": counter_name()},
        UpdateExpression="ADD #v :one",
        ExpressionAttributeNames={"#v": "value"},
        ExpressionAttributeValues={":one": 1},
        ReturnValues="UPDATED_NEW",
    )
    queue_number = int(counter["Attributes"]["value"])

    ts = now_iso()
    try:
        orders.update_item(
            Key={"orderId": order_id},
            UpdateExpression=(
                "SET #s = :queued, queueNumber = :n, updatedAt = :t, "
                "statusHistory = list_append(if_not_exists(statusHistory, :empty), :h)"
            ),
            ConditionExpression="#s = :pending",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":queued": "QUEUED",
                ":pending": "PENDING",
                ":n": queue_number,
                ":t": ts,
                ":h": [{"status": "QUEUED", "at": ts}],
                ":empty": [],
            },
        )
    except ClientError as e:
        # มีใครเปลี่ยนสถานะตัดหน้าไปแล้ว: ถือว่าจบ
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            print(f"skip {order_id}: status changed concurrently")
            return
        raise

    print(f"order {order_id} -> QUEUED, queueNumber={queue_number}")