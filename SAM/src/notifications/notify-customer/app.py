# อ่าน SNS event แล้วบันทึก log ลง CloudWatch
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    processed = 0

    for record in event.get("Records", []):
        sns_record = record.get("Sns", {})
        message = sns_record.get("Message", "{}")

        try:
            payload = json.loads(message) if isinstance(message, str) else message
        except (json.JSONDecodeError, TypeError):
            payload = {"rawMessage": str(message)}

        if not isinstance(payload, dict):
            payload = {"rawMessage": payload}

        logger.info(
            "Order notification received: eventType=%s orderId=%s "
            "previousStatus=%s status=%s queueNumber=%s subject=%s",
            payload.get("eventType", "UNKNOWN"),
            payload.get("orderId", "UNKNOWN"),
            payload.get("previousStatus", "UNKNOWN"),
            payload.get("status", "UNKNOWN"),
            payload.get("queueNumber", "UNKNOWN"),
            sns_record.get("Subject") or "",
        )

        processed += 1

    logger.info("Processed %d SNS notification(s)", processed)
    return {"processed": processed}
