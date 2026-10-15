import json
import os


def handler(event, context):
    print(json.dumps({"path": event.get("path"), "requestId": context.aws_request_id}))
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({
            "message": "SAM deploy works in Learner Lab",
            "region": os.environ.get("AWS_REGION"),
        }),
    }
