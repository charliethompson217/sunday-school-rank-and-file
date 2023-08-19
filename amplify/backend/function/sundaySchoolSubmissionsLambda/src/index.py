import base64
import json
import os
import boto3
import time

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    print('received event:')
    print(event)
    method = event['httpMethod']
    path_parameters = event['pathParameters']
    team = path_parameters['team']
    env = os.environ.get('ENV')
    table_name = f'submissions-{env}'
    table = dynamodb.Table(table_name)
    if method == 'POST':
        print(team)
        timestamp = int(time.time())
        body = json.loads(event['body'])
        if(body.get('configId')!='1'):
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

        item = {
            'team': body.get('team'),
            'fullName': body.get('fullName'),
            'playerId': body.get('playerId'),
            'Timestamp': timestamp,
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
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('Acess Denied!')
    }