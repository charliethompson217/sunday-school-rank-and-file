import json
import boto3
import time

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    print('received event:')
    print(event)
    method = event['httpMethod']
    table = dynamodb.Table('configuration-dev')
    if method == 'GET':
        client_id = "matchups"
        response = table.query(
            KeyConditionExpression='ClientId = :cid',
            ExpressionAttributeValues={
                ':cid': client_id
            },
            ScanIndexForward=False,
            Limit=1
        )
        if 'Items' in response and len(response['Items']) > 0:
            most_recent_entry = response['Items'][0]
            print(most_recent_entry)
            if 'Timestamp' in most_recent_entry:
                most_recent_entry['Timestamp']=str(most_recent_entry['Timestamp'])
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(most_recent_entry)
            }
        else:
            print("No entries found.")
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps("No entries found.")
            }
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('Access Denied!')
    }