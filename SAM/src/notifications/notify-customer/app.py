# อ่าน SNS event แล้วบันทึก log ลง CloudWatch
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    records = event.get("Records", [])
    processed = 0

    for record in records:
        sns_record = record.get("Sns") or record.get("Sns", {})
        message = sns_record.get("Message", "{}")
        try:
            payload = json.loads(message) if isinstance(message, str) else message
        except json.JSONDecodeError:
            payload = {"rawMessage": message}

        logger.info(
            "Order notification received: eventType=%s orderId=%s status=%s subject=%s",
            payload.get("eventType", "UNKNOWN"),
            payload.get("orderId", "UNKNOWN"),
            payload.get("status", "UNKNOWN"),
            sns_record.get("Subject", ""),
        )
        processed += 1

    return {"processed": processed}
