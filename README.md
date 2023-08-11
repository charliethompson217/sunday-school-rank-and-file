Built with rectjs and amazon web services, this is a webapp for managing player's picks for a rank and file pool.

Unlike other pools, participants do not rank each and every game. Instead, the pool is divided into a “Rank” portion and a “File” portion. Players rank only Sunday games—the “Rank.” Participants also predict the winner of the Monday Night Football (“MNF”) games—the “File.”

The site has an admin console where admins add, edit, and remove players. As well as change the site's configuration each week.

To eddit the configuration for the weekly matchups, the admin uploads a CSV file which is then parssed and the information is sent through a rest api to an aws lambda function which stores it in a DynamoDB table. Players' team names as well as their picks are stored in the same manner using aws.

In the admin conslole, the admin can download a CSV of the players' weekly picks