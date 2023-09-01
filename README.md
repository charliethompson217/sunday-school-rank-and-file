# About
Built with rectjs and amazon web services, this is a webapp for managing players' picks for a rank and file pool.

Unlike other pools, participants do not rank each and every game. Instead, the pool is divided into a “Rank” portion and a “File” portion. Players rank only Sunday games—the “Rank.” Participants also predict the winner of the Monday Night Football (“MNF”) games—the “File.”

The site has an admin console where admins configure the weekly matchups and download players' picks

# Setup
Instructions are for MacOS    
Linux should be the same exept for aws cli install    
Instructions can be found [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Be sure you have Python@3.8 and Node installed on your machine
- Create an aws account
- Install the aws cli and log in

```
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
```
```
sudo installer -pkg ./AWSCLIV2.pkg -target /
```
```
aws configure
```
- Install the amplify cli and log in
```
npm install -g @aws-amplify/cli
```
```
amplify configure
```
# Install

- Clone the repository
```
git clone https://github.com/charliethompson217/sunday-school-rank-and-file.git
```
- cd into project directory
- Initialize amplify
```
amplify init
```
- Install dependencies
```
npm install 
```
- Create virtual env
```
python3.8 -m venv venv
```
- Activate virtual environment
```
source venv/bin/activate
```
- Push to aws to create and deploy backend resources
```
amplify push
```
- Deploy the front end
```
amplify publish
```
# run project
- to run locally,
```
npm start
```
- Create an account
- In aws cognito, create a group called 'Admin'
- Add yourself to the admin group
- Configure the site    
  Create a csv file with the headers 'Type', 'Home', 'Away', and optionaly 'Description'.    
  Where Type is either 'Rank', 'File', 'Christmas File', or 'Thanksgiving File'.    
  Home an Away must be valid nfl teams for logos to be rendered.    
  Uplad The CSV on the admin page.
- Once players fill out their picks, they will be avalibile for download in a CSV file on the admin page