import json
import boto3
import time

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    print('received event:')
    print(event)
    method = event['httpMethod']
    path_parameters = event['pathParameters']
    playerId = path_parameters['playerId']
    table = dynamodb.Table('sundaySchoolPlayers-dev')
    if method == 'POST':
        print(playerId)
        timestamp = int(time.time())
        body = json.loads(event['body'])
        item = {
            'playerId': playerId,
            'Timestamp': timestamp,
            'teamName': body.get('teamName'),
            'email': body.get('email')
        }
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps('Team inserted secsesfully!')
        }
    elif method == 'GET':
        print(playerId)
        response = table.scan()
        players = response['Items']
        for player in players:
            if 'Timestamp' in player:
                player['Timestamp']=str(player['Timestamp'])
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(players)
        }
    elif method == 'PUT':
        print(playerId)
        body = json.loads(event['body'])
        newTeamName = body.get('teamName')
        newEmail = body.get('email')
        response = table.update_item(
            Key={
                'playerId': playerId,
            },
            UpdateExpression='SET teamName = :name, email = :email',
            ExpressionAttributeValues={
                ':name': newTeamName,
                ':email': newEmail,
            },
            ReturnValues='UPDATED_NEW'
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,PUT,GET'
            },
            'body': json.dumps('Player information updated successfully!')
        }
    elif method == 'DELETE':
        print(playerId)
        body = json.loads(event['body'])
        response = table.delete_item(
            Key={
                'playerId': playerId,
            }
        )
        return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('Player deleted successfully!')
    }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('Hello from your new Amplify Python lambda!')
    }