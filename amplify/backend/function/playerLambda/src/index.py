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
    playerId = path_parameters['playerId']
    env = os.environ.get('ENV')
    table_name = f'sundaySchoolPlayers-{env}'
    table = dynamodb.Table(table_name)
    if method == 'GET':
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
    if method == 'POST':
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
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps("Access Denied!")
    }