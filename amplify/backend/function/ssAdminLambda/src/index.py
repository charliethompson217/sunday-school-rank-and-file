import base64
import json
import boto3
import time

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    print('received event:')
    print(event)
    method = event['httpMethod']
    headers = event['headers']
    path_parameters = event['pathParameters']
    action = path_parameters['action']
    jwt_token = headers['Authorization'].split(' ')[1]
    parts = jwt_token.split('.')
    payload = parts[1]
    decoded_payload = base64.b64decode(payload + "===").decode()
    payload_json = json.loads(decoded_payload)
    groups = payload_json.get('cognito:groups', [])
    is_admin = 'Admin' in groups
    if is_admin:
        if method == 'POST':
            if(action == "upload-matchups"):
                table = dynamodb.Table('configuration-dev')
                timestamp = int(time.time())
                body = json.loads(event['body'])
                item = {
                    'ClientId': body.get('ClientId'),
                    'Timestamp': timestamp,
                    'week': body.get('week'),
                    'closeTime': body.get('closeTime'),
                    'rankMatchups': body.get('rankMatchups'),
                    'fileMatchups':body.get('fileMatchups'),
                }
                table.put_item(Item=item)
                print('Rank Matchups:')
                print(body.get('rankMatchups'))
                print('File Matchups:')
                print(body.get('fileMatchups'))
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('Matchups Updated!')
                }
            if(action == "add-player"):
                table = dynamodb.Table('sundaySchoolPlayers-dev')
                timestamp = int(time.time())
                body = json.loads(event['body'])
                item = {
                    'playerId': body.get('playerId'),
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
                    'body': json.dumps('Player Added!')
                }
        elif method == 'PUT':
            if(action == "edit-player"):
                table = dynamodb.Table('sundaySchoolPlayers-dev')
                body = json.loads(event['body'])
                newTeamName = body.get('teamName')
                newEmail = body.get('email')
                playerId = body.get('playerId')
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
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps(response)
                }
        elif method == 'DELETE':
            if(action == "delete-player"):
                table = dynamodb.Table('sundaySchoolPlayers-dev')
                body = json.loads(event['body'])
                playerId = body.get('playerId')
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
                    'body': json.dumps('Player Deleted!')
                }
        elif method == 'GET':
            if(action == "get-players"):
                table = dynamodb.Table('sundaySchoolPlayers-dev')
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
            else:
                table = dynamodb.Table('submissions-dev')
                response = table.query(
                    KeyConditionExpression='team = :tid',
                    ExpressionAttributeValues={
                        ':tid': action
                    },
                    ScanIndexForward=False,
                    Limit=1
                )
                if 'Items' in response:
                    most_recent_entry = response['Items'][0]
                    print(most_recent_entry)
                    if 'Timestamp' in most_recent_entry:
                        most_recent_entry['Timestamp']=str(most_recent_entry['Timestamp'])
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Access-Control-Allow-Headers': '*',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                        },
                        'body': json.dumps(most_recent_entry)
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
        'body': json.dumps('Unautherized!')
    }