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
            response = table.scan()
            players = response['Items']
            for player in players:
                if 'Timestamp' in player:
                    player['Timestamp']=str(player['Timestamp'])
                if 'email' in player:
                    del player['email']
                if 'fullname' in player:
                    del player['fullname']
                if 'sub' in player:
                    del player['sub']
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
        response = table.scan()
        players = response['Items']
        playerExists = False
        for player in players:
            if 'playerId' in player:
                if body.get('playerid') == player['playerId']:
                    playerExists = True
            if 'teamName' in player:
                if body.get('teamName') == player['teamName']:
                    playerExists = True
            if 'email' in player:
                if body.get('email') == player['email']:
                    playerExists = True
            if 'sub' in player:
                if body.get('sub') == player['sub']:
                    playerExists = True
        if playerExists:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps("Error")
            }
        
        teamName = body.get('teamName')
        teamNameValid = False
        teamNameRegex = r'^[a-zA-Z0-9_\-]+$'
        if teamName and re.match(teamNameRegex, teamName) and len(teamName) <= 20:
            teamNameValid = True
        if not teamNameValid:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps("Invalid teamName")
            }

        playerId = body.get('playerId')
        playerIdValid = False
        playerIdRegex = r'^SSP[a-zA-Z0-9]{7}$'
        if playerId and re.match(playerIdRegex, playerId):
            playerIdValid = True
        if not playerIdValid:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps("Invalid playerId")
            }

        email = body.get('email')
        emailValid = False
        emailRegex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if email and re.match(emailRegex, email):
            emailValid = True
        if not emailValid:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps("Invalid email")
            }
        
        fullName = body.get('fullName')
        fullNameValid = False
        fullNameRegex = r'^[a-zA-Z\s\-]+$'
        if fullName and re.match(fullNameRegex, fullName) and len(fullName) <= 100:
            fullNameValid = True
        if not fullNameValid:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps("Invalid fullName")
            }
        item = {
            'playerId': playerId,
            'Timestamp': timestamp,
            'teamName': teamName,
            'email': email,
            'fullName': fullName,
            'sub': body.get('sub'),
            'FileWins': '0',
            'PlayoffsBucks': '0',
            'RankPoints': '0',
            'TotalDollarPayout': '$0.00',
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
        'statusCode': 400,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps("Unown operation!")
    }