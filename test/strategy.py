
import oandapyV20
import oandapyV20.endpoints.accounts as accounts
import json


api_key = ''
account_id = ''

client = oandapyV20.API(access_token=api_key)

r = accounts.AccountDetails(account_id)
client.request(r)
print(json.dumps(r.response, indent=2))

