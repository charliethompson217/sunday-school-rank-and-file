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

def verifyToken(payload_json):
    tokenPlayerId = payload_json.get('custom:playerId')
    tokenSub = payload_json.get('sub')
    tokenTeamName = payload_json.get('custom:team_name')
    if not tokenPlayerId or not tokenSub or not tokenTeamName:
        print("Missing required attributes in the token")
        return False

    env = os.environ.get('ENV')
    table_name = f'sundaySchoolPlayers-{env}'
    table = dynamodb.Table(table_name)
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('playerId').eq(tokenPlayerId)
    )
    if 'Items' in response and len(response['Items']) > 0:
        player = response['Items'][0]
        dbSub = player.get('sub')
        dbTeamName = player.get('teamName')
        if dbSub == tokenSub and dbTeamName == tokenTeamName:
            return True
        else:
            print(f"Token mismatch: sub or teamName does not match. Token sub: {tokenSub}, DB sub: {dbSub}. Token teamName: {tokenTeamName}, DB teamName: {dbTeamName}")
            return False
    else:
        print("Player not found in the database")
        return False

def handler(event, context):
    print('Received event:')
    print(event)
    headers = event['headers']
    jwt_token = headers.get('Authorization', '').split(' ')[1]
    
    if not jwt_token:
        return {
            'statusCode': 403,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Unauthorized - No token provided!')
        }
    
    parts = jwt_token.split('.')
    if len(parts) != 3:
        return {
            'statusCode': 403,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Unauthorized - Invalid token format!')
        }

    payload = parts[1]
    decoded_payload = base64.urlsafe_b64decode(payload + '===').decode('utf-8')
    payload_json = json.loads(decoded_payload)

    if verifyToken(payload_json):
        
        body = json.loads(event['body'])
        operation = body.get('operation')
        # submit-picks
            # still needs to be sanatized
        if operation == 'submit-picks':
            serverTimestamp = int(time.time())
            env = os.environ.get('ENV')
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
            grace_period = 660  # 11 minutes in seconds
            curWeekStillOpen = serverTimestamp < (unix_closeTime + grace_period)
            if(curWeekStillOpen):
                env = os.environ.get('ENV')
                table_name = f'submissions-{env}'
                table = dynamodb.Table(table_name)
                body = json.loads(event['body'])
                tokenPlayerId = payload_json.get('custom:playerId')
                tokenTeamName = payload_json.get('custom:team_name')
                tokenName = payload_json.get('name')
                item = {
                    'team': tokenTeamName,
                    'fullName': tokenName,
                    'playerId': tokenPlayerId,
                    'Timestamp': serverTimestamp,
                    'week': curWeek,
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
            else:
                return {
                    'statusCode': 418,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('The deadline has passed!')
                }
        # get-picks-for-player
        if operation == 'get-picks-for-player':
            env = os.environ.get('ENV')
            table_name = f'submissions-{env}'
            table = dynamodb.Table(table_name)
            body = json.loads(event['body'])
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
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('no entry found for week')
                }
        #edit-profile-picture
        if operation == 'edit-profile-picture':
            body = json.loads(event['body'])
            tokenPlayerId = payload_json.get('custom:playerId')
            s3 = boto3.client('s3', region_name='us-east-2')
            bucket_name = 'sunday-school-profile-pictures'
            object_name = f"{tokenPlayerId}"
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
                    'body': json.dumps({'upload_url': presigned_url})
                }
            except Exception as e:
                print({'error': str(e)})
                return {
                    'statusCode': 500,
                        'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('error')
                }
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Unkown Operation!')
        }
    else:
        return {
            'statusCode': 403,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Unauthorized!')
        }
