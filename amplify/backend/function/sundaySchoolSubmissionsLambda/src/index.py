import base64
import json
import os
import boto3
import time
from datetime import datetime
from collections import defaultdict
from boto3.dynamodb.conditions import Key
from decimal import Decimal


dynamodb = boto3.resource('dynamodb')

def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    else:
        return obj

def handler(event, context):
    print('received event:')
    print(event)
    method = event['httpMethod']
    path_parameters = event['pathParameters']
    env = os.environ.get('ENV')
    table_name = f'submissions-{env}'
    table = dynamodb.Table(table_name)
    if method == 'GET':
        serverTimestamp = int(time.time())
        
        table_name = f'configuration-{env}'
        table = dynamodb.Table(table_name)
        response = table.query(
            KeyConditionExpression=Key('ClientId').eq("cur-week"),
            ScanIndexForward=False,
            Limit=1
        )
        most_recent_entry = response['Items'][0]
        curWeek = most_recent_entry['week']
        response = table.query(
            KeyConditionExpression=Key('ClientId').eq('matchups'),
            ScanIndexForward=False
        )
        for item in response.get('Items', []):
            if item.get('week') == curWeek:
                closeTime = item['closeTime']
                dt_object = datetime.strptime(closeTime, "%Y-%m-%dT%H:%M:%S.%fZ")
                unix_closeTime = int(dt_object.timestamp())

        curWeekStillOpen = serverTimestamp < unix_closeTime
        table_name = f'submissions-{env}'
        table = dynamodb.Table(table_name)
        response = table.scan()
        items = response['Items']

        data_by_week = defaultdict(lambda: defaultdict(list))
        for item in items:
            team = item.get('team')
            week = item.get('week')
            if week == curWeek and curWeekStillOpen:
                continue
            data_by_week[week][team].append(item)
        result = []
        for week, players in data_by_week.items():
            week_data = []
            for team, submissions in players.items():
                latest_submission = max(submissions, key=lambda x: x['Timestamp'])
                week_data.append(latest_submission)
            result.append(week_data)
        result = convert_decimals(result)
        print(json.dumps(result, indent=2))
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(result)
        }

    elif method == 'POST':
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
        response = table.query(
            KeyConditionExpression=Key('team').eq(teamName),
            ScanIndexForward=False  
        )

        for item in response.get('Items', []):
            if item.get('week') == week:
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