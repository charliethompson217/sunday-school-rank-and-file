import base64
import json
import os
import boto3
import time
from botocore.exceptions import ClientError
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import re

dynamodb = boto3.resource('dynamodb')

def get_secret():
    secret_name = "sundayschoolrankandfile_googlesheet"
    region_name = "us-east-2"

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
            return json.loads(secret)
        raise Exception("Secret not found or is not a string.")

def update_configuration_table(env, client_id, data):
    table = dynamodb.Table(f'configuration-{env}')
    timestamp = int(time.time())
    item = {
        'ClientId': client_id,
        'Timestamp': timestamp,
        **data
    }
    table.put_item(Item=item)

def get_player_submissions(env, players, week):
    table = dynamodb.Table(f'submissions-{env}')
    most_recent_entries = []

    for player in players:
        response = table.query(
            KeyConditionExpression='team = :tid',
            ExpressionAttributeValues={
                ':tid': player
            },
            ScanIndexForward=False
        )
        
        if 'Items' in response and len(response['Items']) > 0:
            week_entries = [entry for entry in response['Items'] if entry.get('week') == week]
            if week_entries:
                most_recent_entry = week_entries[0]
                if 'Timestamp' in most_recent_entry:
                    most_recent_entry['Timestamp'] = str(most_recent_entry['Timestamp'])
                most_recent_entries.append(most_recent_entry)
    
    return most_recent_entries

def update_season_leaderboard(env, player_updates):
    table = dynamodb.Table(f'sundaySchoolPlayers-{env}')
    
    for player in player_updates:
        playerId, rankPoints, fileWins, playoffsBucks, totalDollarPayout = player
        
        try:
            table.update_item(
                Key={'playerId': playerId},
                UpdateExpression='SET RankPoints = :rankPoints, FileWins = :fileWins, PlayoffsBucks = :playoffsBucks, TotalDollarPayout = :totalDollarPayout',
                ExpressionAttributeValues={
                    ':rankPoints': rankPoints,
                    ':fileWins': fileWins,
                    ':playoffsBucks': playoffsBucks,
                    ':totalDollarPayout': totalDollarPayout,
                }
            )
        except Exception as e:
            print(f"Error updating player {playerId}: {e}")
            raise

def get_all_players(env):
    table = dynamodb.Table(f'sundaySchoolPlayers-{env}')
    response = table.scan()
    players = response['Items']
    
    for player in players:
        if 'Timestamp' in player:
            player['Timestamp'] = str(player['Timestamp'])
    
    return players

def update_weekly_leaderboard(env, week_number, data):
    table = dynamodb.Table(f'weeklyLeaderboards-{env}')
    timestamp = int(time.time())
    item = {
        'Timestamp': timestamp,
        'Week': f'Week {week_number}',
        'data': data,
    }
    table.put_item(Item=item)

def get_google_sheet_data(sheet_name):
    creds = get_secret()
    creds_json = json.dumps(creds)
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(
        json.loads(creds_json),
        ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    )
    gc = gspread.authorize(credentials)
    spreadsheet_url = "https://docs.google.com/spreadsheets/d/1sLEqJF3xtKneBczD37eaMvMexlHCC1INcOlQZeacJOQ/edit"
    return gc.open_by_url(spreadsheet_url).worksheet(sheet_name).get_values()

def create_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body)
    }

def validate_admin(headers):
    jwt_token = headers['Authorization'].split(' ')[1]
    parts = jwt_token.split('.')
    payload = parts[1]
    decoded_payload = base64.b64decode(payload + "===").decode()
    payload_json = json.loads(decoded_payload)
    groups = payload_json.get('cognito:groups', [])
    return 'Admin' in groups

def handler(event, context):
    print('received event:', event)
    
    method = event['httpMethod']
    headers = event['headers']
    path_parameters = event['pathParameters']
    action = path_parameters['action']
    env = os.environ.get('ENV')

    if not validate_admin(headers):
        return create_response(403, 'Unauthorized!')

    try:
        if method == 'POST':
            body = json.loads(event['body'])
            
            if action == "set-cur-week":
                update_configuration_table(env, body.get('ClientId'), {'week': body.get('week')})
                return create_response(200, 'Current Week Updated!')
                
            elif action == "upload-game-results":
                update_configuration_table(env, "game-results", {
                    'week': body.get('week'),
                    'rankResults': body.get('rankResults'),
                    'fileResults': body.get('fileResults')
                })
                return create_response(200, 'Matchups Updated!')
                
            elif action == "upload-matchups":
                week = body.get('week')
                data = body.get('data')
                # regular season
                if week and re.match(r"Week \d+$", week):
                    update_configuration_table(env, body.get('ClientId'), {
                        'week': week,
                        'closeTime': body.get('closeTime'),
                        'rankMatchups': data.get('rankMatchups'),
                        'fileMatchups': data.get('fileMatchups'),
                    })
                # playoffs
                else:
                    update_configuration_table(env, body.get('ClientId'), {
                        'week': week,
                        'closeTime': body.get('closeTime'),
                        # rest of playoffs data
                    })
                return create_response(200, 'Matchups Updated!')

        elif method == 'PUT':
            body = json.loads(event['body'])
            
            if action == "pull-picks":
                entries = get_player_submissions(env, body.get('players'), body.get('week'))
                return create_response(200, entries)
                
            elif action == "edit-season-leaderboard":
                update_season_leaderboard(env, body.get('players'))
                return create_response(200, "Player Stats Updated!")
                
            else:
                pattern = r"^edit-Week%20(\d{1,2})leaderboard$"
                match = re.match(pattern, action)
                if match:
                    week_number = match.group(1)
                    update_weekly_leaderboard(env, week_number, body.get('data'))
                    return create_response(200, f'Week {week_number} leaderboard updated')

        elif method == 'GET':
            if action == "get-players":
                players = get_all_players(env)
                return create_response(200, players)
                
            elif action == 'fetch-season-leaderboard':
                data = get_google_sheet_data('Season Leaderboard')
                return create_response(200, data)
                
            else:
                pattern = r"^fetch-Week%20(\d{1,2})leaderboard$"
                match = re.match(pattern, action)
                if match:
                    week_number = match.group(1)
                    data = get_google_sheet_data(f'Week {week_number} Leaderboard')
                    return create_response(200, data)

    except Exception as e:
        print(f"Error processing request: {e}")
        return create_response(500, f"Internal server error: {str(e)}")