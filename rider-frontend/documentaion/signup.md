# Rider Signup Process

This system is resposible for onboarding new riders. Colletion their information,
setting up a stripe connected account for payouts. 

- Collect name & email
- Validate email

- Collect Phone Number
- Validate phone number

- Profile picture 
- Mode of transport 

We then will direct to stripe onboarding

## Step 1
Create account with basic information, names, email & password. At this point
the rider has an account but still needs to complete signup. 

Signup status defults to 'phone_number'

Request
`/rider/create`
```json
{
    "first_name": "James",
    "last_name": "Tayloe",
    "email": "james.taylor@gmail.com",
    "password": "password"
}
```
Response
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyaWRlcklEIjoicmlkZXJfNDk2MzA1NGUtNzc1NC00M2Y2LWJkNjYtMGU0ZmU2ODQzMzFkIiwicm9sZXMiOlsicmlkZXIiXSwiaWF0IjoxNjcwMzY1NTE4LCJleHAiOjE2NzA5NzAzMTh9.2p_239fyHrOYqnh7Wxu7uowYomVmZqs5S1LMy5iayTQ"
}
```
Decoded JWT
```json
{
  "riderID": "rider_4963054e-7754-43f6-bd66-0e4fe684331d",
  "roles": [
    "rider"
  ],
  "iat": 1670365518,
  "exp": 1670970318
}
```

## Step 2

Curernt signup_status: `phone_number`
Update signup_status: `stripe`

Request the rider to be signed in. 

Collect riders phone number. This stage may in the future be followed by a 
phone number verfification stage.

Request
```json
{
    "phone_number": "+44000000000"
}
```
Response
`201 Created`

## Step 3
