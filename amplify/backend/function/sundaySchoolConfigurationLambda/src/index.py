import json
import os
import boto3
import time
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    print('received event:')
    print(event)
    method = event['httpMethod']
    env = os.environ.get('ENV')
    table_name = f'configuration-{env}'
    table = dynamodb.Table(table_name)
    path_parameters = event['pathParameters']
    client_id = path_parameters['operation']
    
    if method == 'GET':
        response = table.query(
            KeyConditionExpression=Key('ClientId').eq("cur-week"),
            ScanIndexForward=False,
            Limit=1
        )
        if 'Items' in response and len(response['Items']) > 0:
            most_recent_entry = response['Items'][0]
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(most_recent_entry['week'])
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
    elif method == 'PUT':
        body = json.loads(event['body'])
        week = body.get("week")
        # Query to fetch items for the given ClientId, sorted by Timestamp in descending order
        response = table.query(
            KeyConditionExpression=Key('ClientId').eq(client_id),
            ScanIndexForward=False  # Fetches items in descending order of Timestamp
        )

        # Iterate over the items to find the first one that matches the given week
        for item in response.get('Items', []):
            if item.get('week') == week:
                # Found the most recent item for the specified week
                if 'Timestamp' in item:
                    item['Timestamp']=str(item['Timestamp'])
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps(item)
                }
        # No matching item found
        print("No matching entries found for the specified week.")
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps("No matching entries found.")
        }
    else:
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Access Denied!')
        }