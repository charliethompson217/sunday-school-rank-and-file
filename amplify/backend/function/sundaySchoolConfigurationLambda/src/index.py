from datetime import datetime
import json
import os
import re
import boto3
import time
from boto3.dynamodb.conditions import Key
from decimal import Decimal


dynamodb = boto3.resource('dynamodb')

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert Decimal to float or int, depending on the value
            return float(obj) if obj % 1 else int(obj)
        return super(DecimalEncoder, self).default(obj)
    
def increment_last_number(s):
    return re.sub(r'\d+$', lambda x: str(int(x.group()) + 1), s)

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
        if path_parameters['operation'] == "get-current-week":

            response = table.query(
                KeyConditionExpression=Key('ClientId').eq("cur-week"),
                ScanIndexForward=False,
                Limit=1
            )
            most_recent_entry = response['Items'][0]
            week = most_recent_entry['week']

            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(week)
            }

            
        elif path_parameters['operation'] == "get-game-results":            
            response = table.query(
                KeyConditionExpression=Key('ClientId').eq("game-results"),
                ScanIndexForward=False
            )
            
            items = response['Items']
            latest_items_by_week = {}
            
            for item in items:
                week = item['week']
                if week not in latest_items_by_week:
                    latest_items_by_week[week] = item 
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(latest_items_by_week, cls=DecimalEncoder)
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