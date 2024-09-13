import base64
import json
import os
import boto3
import time
from botocore.exceptions import ClientError
import gspread
from oauth2client.service_account import ServiceAccountCredentials

dynamodb = boto3.resource('dynamodb')

def get_secret():

    secret_name = "sundayschoolrankandfile_googlesheet"
    region_name = "us-east-2"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        print("Couldn't get secret", e)
        raise e
    else:
        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
            return json.loads(secret)  # returns the credentials from the secret
        raise Exception("Secret not found or is not a string.")

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
    env = os.environ.get('ENV')
    is_admin = 'Admin' in groups
    if is_admin:
        if method == 'POST':
            if(action == "set-cur-week"):
                table_name = f'configuration-{env}'
                table = dynamodb.Table(table_name)
                timestamp = int(time.time())
                body = json.loads(event['body'])
                item = {
                    'ClientId': "cur-week",
                    'Timestamp': timestamp,
                    'week': body.get('week'),
                }
                table.put_item(Item=item)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('Current Week Updated!')
                }
            if(action == "upload-game-results"):
                table_name = f'configuration-{env}'
                table = dynamodb.Table(table_name)
                timestamp = int(time.time())
                body = json.loads(event['body'])
                item = {
                    'ClientId': "game-results",
                    'Timestamp': timestamp,
                    'week': body.get('week'),
                    'rankResults': body.get('rankResults'),
                    'fileResults':body.get('fileResults'),
                }
                table.put_item(Item=item)

                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('Matchups Updated!')
                }
            if(action == "upload-matchups"):
                table_name = f'configuration-{env}'
                table = dynamodb.Table(table_name)
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

                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps('Matchups Updated!')
                }
        elif method == 'PUT':
            if(action == "pull-picks"):
                table_name = f'submissions-{env}'
                table = dynamodb.Table(table_name)
                body = json.loads(event['body'])
                players = body.get('players')
                most_recent_entries = []
                for player in players:
                    response = table.query(
                        KeyConditionExpression='team = :tid',
                        ExpressionAttributeValues={
                            ':tid': player
                        },
                        ScanIndexForward=False,
                        Limit=1
                    )
                    if 'Items' in response and len(response['Items'])>0:
                        most_recent_entry = response['Items'][0]
                        if 'Timestamp' in most_recent_entry:
                            most_recent_entry['Timestamp']=str(most_recent_entry['Timestamp'])
                        most_recent_entries.append(most_recent_entry)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps(most_recent_entries)
                }
            if(action == "edit-player-stats"):
                table_name = f'sundaySchoolPlayers-{env}'
                table = dynamodb.Table(table_name)
                body = json.loads(event['body'])
                players = body.get('players')
                for player in players:
                    playerId = player[0]
                    rankPoints = player[1]
                    fileWins = player[2]
                    playoffsBucks = player[3]
                    totalDollarPayout = player[4]

                    try:
                        response = table.update_item(
                            Key={
                                'playerId': playerId,
                            },
                            UpdateExpression='SET RankPoints = :rankPoints, FileWins = :fileWins, PlayoffsBucks = :playoffsBucks, TotalDollarPayout = :totalDollarPayout',
                            ExpressionAttributeValues={
                                ':rankPoints': rankPoints,
                                ':fileWins': fileWins,
                                ':playoffsBucks': playoffsBucks,
                                ':totalDollarPayout': totalDollarPayout,
                            },
                            ReturnValues='UPDATED_NEW'
                        )
                    except Exception as e:
                        print(f"Error updating player {playerId}: {e}")
                        # Output the exact update expression and values for debugging
                        print("Update Expression:")
                        print('SET RankPoints = :rankPoints, FileWins = :fileWins, PlayoffsBucks = :playoffsBucks, TotalDollarPayout = :totalDollarPayout')
                        print("Expression Attribute Values:")
                        print({
                            ':rankPoints': rankPoints,
                            ':fileWins': fileWins,
                            ':playoffsBucks': playoffsBucks,
                            ':totalDollarPayout': totalDollarPayout,
                        })
                        raise
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps("Player Stats Updated!")
                }
        elif method == 'GET':
            if(action == "get-players"):
                table_name = f'sundaySchoolPlayers-{env}'
                table = dynamodb.Table(table_name)
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
            elif(action == 'update-leaderboard'):
                # Retrieve the secret
                creds = get_secret()
                # Authorize with the Google Sheets and Drive API
                creds_json = json.dumps(creds)  # gspread requires credentials as a file-like object
                credentials = ServiceAccountCredentials.from_json_keyfile_dict(json.loads(creds_json), [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive',
                ])
                # Use creds to create a client to interact with the Google Drive API
                gc = gspread.authorize(credentials)
                # Make sure you use the right url here.
                spreadsheet_url = "https://docs.google.com/spreadsheets/d/1sLEqJF3xtKneBczD37eaMvMexlHCC1INcOlQZeacJOQ/edit"
                sheet = gc.open_by_url(spreadsheet_url).worksheet('Season Leaderboard')

                # Extract and print all of the values
                list_of_values = sheet.get_values()
                print(list_of_values)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps(list_of_values)
                }            
    return {
        'statusCode': 403,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('Unautherized!')
    }