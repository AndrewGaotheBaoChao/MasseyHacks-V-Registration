# 'dev' or 'production'
NODE_ENV= 'dev  '

# Connection string URI for your MongoDB database
DATABASE=''

# Port that this app runs on
PORT='3005'

# Long random string used to verify JWT tokens for user authentication
JWT_SECRET='something super secret and super long'

# Root URL for this app
ROOT_URL=''

# Used to send verification, registration, and confirmation emails
EMAIL_CONTACT=''
EMAIL_HOST=''
EMAIL_USER=''
EMAIL_PASS=''
EMAIL_PORT=''

# Limits the number of users that can join a team
TEAM_MAX_SIZE=4

# Used to send error messages to your Slack team when the API catches an error
SLACK_HOOK='https://hooks.slack.com/services/yourapikey'

# UIDs of admins on Slack so they can be @ messaged
ADMIN_UIDS=''

# Slack auto invite address
SLACK_INVITE=''
SLACK_INVITE_TOKEN=''

# IMAP address for incoming HelloSign emails
WAIVER_EMAIL=''
WAIVER_PASSWORD=''
WAIVER_ADDRESS=''
WAIVER_PORT=''