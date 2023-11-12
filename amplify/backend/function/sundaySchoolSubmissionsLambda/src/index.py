import base64
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
    table_name = f'submissions-{env}'
    table = dynamodb.Table(table_name)
    if method == 'POST':
        serverTimestamp = int(time.time())
        body = json.loads(event['body'])
        if(body.get('configId')!='1'):
            jwt_token = body.get('jwt_token')
            if(jwt_token == None):
                return {
                    'statusCode': 498,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('Invalid Token')
                }
            
            parts = jwt_token.split('.')
            payload = parts[1]
            decoded_payload = base64.b64decode(payload + "===").decode()
            payload_json = json.loads(decoded_payload)
            tokenPlayerId = payload_json.get('custom:playerId')
            tokenTeam = payload_json.get('custom:team_name')
            tokenName = payload_json.get('name')
        item = {
            'team': tokenTeam,
            'fullName': tokenName,
            'playerId': tokenPlayerId,
            'Timestamp': serverTimestamp,
            'week': body.get('week'),
            'configId': body.get('configId'),
            'rankPicks': body.get('rankPicks'),
            'rankedRanks': body.get('rankedRanks'),
            'filePicks':body.get('filePicks'),
        }
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Picks inserted secsesfully!')
        }
    elif method == 'PUT':
        body = json.loads(event['body'])
        jwt_token = body.get('jwt_token')
        parts = jwt_token.split('.')
        payload = parts[1]
        decoded_payload = base64.b64decode(payload + "===").decode()
        payload_json = json.loads(decoded_payload)
        tokenPlayerId = payload_json.get('custom:playerId')
        teamName = payload_json.get('custom:team_name')
        week = body.get("week")
        # Query to fetch items for the given ClientId, sorted by Timestamp in descending order
        response = table.query(
            KeyConditionExpression=Key('team').eq(teamName),
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
        else:
            print("No entries found.")
    return {
        'statusCode': 404,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('Not a valid method')
    }