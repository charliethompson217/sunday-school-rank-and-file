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
        item = {
            'team': body.get('team'),
            'fullName': body.get('fullName'),
            'playerId': team,
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