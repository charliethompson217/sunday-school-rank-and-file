import base64
import json
import os
import boto3
import time
import re
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

def convert_decimal(item):
    if isinstance(item, list):
        return [convert_decimal(i) for i in item]
    elif isinstance(item, dict):
        return {k: convert_decimal(v) for k, v in item.items()}
    elif isinstance(item, Decimal):
        if item % 1 == 0:
            return int(item)
        else:
            return float(item)
    else:
        return item

def handler(event, context):
    print('received event:')
    print(event)
    method = event['httpMethod']
    path_parameters = event['pathParameters']
    playerId = path_parameters['playerId']
    env = os.environ.get('ENV')
    table_name = f'sundaySchoolPlayers-{env}'
    table = dynamodb.Table(table_name)

    if method == 'GET':
        if (playerId == 'get-weekly-Leaderboards'):
            table_name = f'weeklyLeaderboards-{env}'
            table = dynamodb.Table(table_name)
            response = table.scan()
            items = response.get('Items', [])

            if items:
                most_recent_by_week = {}
                for item in items:
                    week = item['Week']
                    timestamp = item['Timestamp']
                    if week not in most_recent_by_week or timestamp > most_recent_by_week[week]['Timestamp']:
                        most_recent_by_week[week] = item
                
                result = list(most_recent_by_week.values())
                result = convert_decimal(result)

                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps(result)
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps("no weekly leaderboards found!")
                }
        else:
            print(playerId)
            response = table.scan()
            players = response['Items']
            for player in players:
                if 'Timestamp' in player:
                    player['Timestamp']=str(player['Timestamp'])
                if 'email' in player:
                    del player['email']
                if 'fullname' in player:
                    del player['fullname']
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(players)
            }
    elif method == 'POST':
        timestamp = int(time.time())
        body = json.loads(event['body'])
        item = {
            'playerId': body.get('playerId'),
            'Timestamp': timestamp,
            'teamName': body.get('teamName'),
            'email': body.get('email'),
            'fullName': body.get('fullName'),
        }
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Player Added!')
        }
    elif method == 'PUT':
        if playerId == "edit-profile-picture":
            body = json.loads(event['body'])
            jwt_token = body.get('jwt_token')
            parts = jwt_token.split('.')
            payload = parts[1]
            decoded_payload = base64.b64decode(payload + "===").decode()
            payload_json = json.loads(decoded_payload)
            tokenPlayerId = payload_json.get('custom:playerId')
            playerId = body.get('playerId')
            if(tokenPlayerId!=playerId):
                return {
                    'statusCode': 403,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps("Access Denied!")
                }
            s3 = boto3.client('s3', region_name='us-east-2')
            bucket_name = 'sunday-school-profile-pictures'
            object_name = f"{playerId}"
            content_type = body.get('contentType')

            try:
                presigned_url = s3.generate_presigned_url(ClientMethod='put_object', Params={'Bucket': bucket_name, 'Key': object_name, 'ContentType': content_type}, ExpiresIn=3600)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps({
                        'upload_url': presigned_url
                    })
                }

            except Exception as e:
                return {
                    'statusCode': 500,
                        'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps({
                        'error': str(e)
                    })
                }
        else:
            body = json.loads(event['body'])
            jwt_token = body.get('jwt_token')
            parts = jwt_token.split('.')
            payload = parts[1]
            decoded_payload = base64.b64decode(payload + "===").decode()
            payload_json = json.loads(decoded_payload)
            tokenPlayerId = payload_json.get('custom:playerId')
            playerId = body.get('playerId')
            if(tokenPlayerId!=playerId):
                return {
                    'statusCode': 403,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps("Access Denied!")
                }
            
            newTeamName = body.get('teamName')
            newEmail = body.get('email')
            newFullName = body.get('fullName')
            response = table.update_item(
                Key={
                    'playerId': playerId,
                },
                UpdateExpression='SET teamName = :teamName, email = :email, fullName = :fullName',
                ExpressionAttributeValues={
                    ':teamName': newTeamName,
                    ':email': newEmail,
                    ':fullName': newFullName,
                },
                ReturnValues='UPDATED_NEW'
            )
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(response)
            }
    return {
        'statusCode': 404,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps("Not Found")
    }