# import psycopg2
# from urllib.parse import urlparse

# # Your DATABASE_URL
# DATABASE_URL = "postgresql://postgres:9223@nirob.signalsmind.com:5432/car_wash"

# # Parse the URL
# result = urlparse(DATABASE_URL)
# username = result.username
# password = result.password
# database = result.path[1:]  # remove leading '/'
# hostname = result.hostname
# port = result.port

# # Connect to the database
# try:
#     conn = psycopg2.connect(
#         dbname=database,
#         user=username,
#         password=password,
#         host=hostname,
#         port=port
#     )
#     cursor = conn.cursor()
#     print("✅ Successfully connected to the database!")

#     # Example: Fetch PostgreSQL version
#     cursor.execute("SELECT version();")
#     version = cursor.fetchone()
#     print("PostgreSQL version:", version)

#     # Close the connection
#     cursor.close()
#     conn.close()

# except Exception as e:
#     print("❌ Connection failed")
#     print(e)






# import jwt
# import requests
# import json

# # Provided token (for demonstration only—replace with a valid token in practice)
# token = "eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU3NTg3NDEwLCJqdGkiOiJmYmEwZDA3My00YzFiLTQ0NjEtYTlmYS01MzU5Yjc2OWRkZjAiLCJ1c2VyX3V1aWQiOiIxNjMzNWNlMS01ZTU2LTRmZWItYjRiYS1kNDYyYWQ4MGQ3N2IifQ.XG-_7tyZMSRpUxAMatRVhgS-_kVP-MVOXkrUkXelj2J149YNINeAjoZldQI-YsBEKZeHE22NowiwXeDmZ53RwQ"

# # Step 1: Decode the JWT to inspect its contents
# try:
#     if not hasattr(jwt, 'decode'):
#         raise AttributeError("The 'jwt' module does not have a 'decode' method. Please ensure 'pyjwt' is installed correctly.")
#     decoded_token = jwt.decode(token, options={"verify_signature": False})
#     print("Decoded Token Payload:", json.dumps(decoded_token, indent=2))
# except AttributeError as e:
#     print("Error:", e)
# except Exception as e:
#     print("Error decoding token:", e)

# # Step 2: Example API call to Calendly (e.g., get current user)
# api_url = "https://api.calendly.com/users/me"
# headers = {
#     "Authorization": f"Bearer {token}",
#     "Content-Type": "application/json"
# }

# try:
#     response = requests.get(api_url, headers=headers)
#     response.raise_for_status()
#     data = response.json()
#     print("API Response:", json.dumps(data, indent=2))
# except requests.exceptions.RequestException as e:
#     print("API call failed:", e)

# ----------------------------------------------------------------
# import requests
# import json

# # Your valid token
# token = "eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU3NTg3NDEwLCJqdGkiOiJmYmEwZDA3My00YzFiLTQ0NjEtYTlmYS01MzU5Yjc2OWRkZjAiLCJ1c2VyX3V1aWQiOiIxNjMzNWNlMS01ZTU2LTRmZWItYjRiYS1kNDYyYWQ4MGQ3N2IifQ.XG-_7tyZMSRpUxAMatRVhgS-_kVP-MVOXkrUkXelj2J149YNINeAjoZldQI-YsBEKZeHE22NowiwXeDmZ53RwQ"

# # API endpoint for scheduled events
# api_url = "https://api.calendly.com/scheduled_events"

# # Headers with authentication
# headers = {
#     "Authorization": f"Bearer {token}",
#     "Content-Type": "application/json"
# }

# # Optional query parameters
# params = {
#     "status": "active",
#     "user": "https://api.calendly.com/users/16335ce1-5e56-4feb-b4ba-d462ad80d77b",
#     "count": 10
# }

# try:
#     response = requests.get(api_url, headers=headers, params=params)
#     response.raise_for_status()
#     data = response.json()
    
#     print("Meeting Data:", json.dumps(data, indent=2))
    
#     if "collection" in data:
#         for event in data["collection"]:
#             start_time = event.get("start_time")
#             end_time = event.get("end_time")
#             event_name = event.get("name")
            
#             # Fetch invitee details for this event
#             event_uri = event.get("uri")
#             invitees_url = f"{event_uri}/invitees"
#             invitees_response = requests.get(invitees_url, headers=headers)
#             invitees_response.raise_for_status()
#             invitees_data = invitees_response.json()
            
#             invitee_name = "No invitee"
#             if "collection" in invitees_data and invitees_data["collection"]:
#                 invitee_name = invitees_data["collection"][0].get("name", "No invitee")
            
#             print(f"Meeting: {event_name}")
#             print(f"Time: {start_time} to {end_time}")
#             print(f"Invitee: {invitee_name}")
#             print("---")
#     else:
#         print("No meetings found or unexpected response structure.")

# except requests.exceptions.RequestException as e:
#     print("API call failed:", e)



import requests
import json

# Your valid token
token = "eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU3NTg3NDEwLCJqdGkiOiJmYmEwZDA3My00YzFiLTQ0NjEtYTlmYS01MzU5Yjc2OWRkZjAiLCJ1c2VyX3V1aWQiOiIxNjMzNWNlMS01ZTU2LTRmZWItYjRiYS1kNDYyYWQ4MGQ3N2IifQ.XG-_7tyZMSRpUxAMatRVhgS-_kVP-MVOXkrUkXelj2J149YNINeAjoZldQI-YsBEKZeHE22NowiwXeDmZ53RwQ"

# API endpoint for scheduled events
api_url = "https://api.calendly.com/scheduled_events"

# Headers with authentication
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Optional query parameters
params = {
    "status": "active",
    "user": "https://api.calendly.com/users/16335ce1-5e56-4feb-b4ba-d462ad80d77b",
    "count": 10
}

try:
    response = requests.get(api_url, headers=headers, params=params)
    response.raise_for_status()
    data = response.json()

    print("Meeting Data:", json.dumps(data, indent=2))
    
    if "collection" in data:
        for event in data["collection"]:
            start_time = event.get("start_time")
            end_time = event.get("end_time")
            event_name = event.get("name")
            
            # Fetch full event details
            event_uri = event.get("uri")
            event_details_response = requests.get(event_uri, headers=headers)
            event_details_response.raise_for_status()
            event_details = event_details_response.json()
            
            # Extract invitee details
            invitees_url = f"{event_uri}/invitees"
            invitees_response = requests.get(invitees_url, headers=headers)
            invitees_response.raise_for_status()
            invitees_data = invitees_response.json()
            invitee_name = "No invitee"
            if "collection" in invitees_data and invitees_data["collection"]:
                invitee_name = invitees_data["collection"][0].get("name", "No invitee")
                invitee_email = invitees_data["collection"][0].get("email")
            
            # Extract additional details
            location = event_details.get("location", {}).get("join_url", "No join URL")
            meeting_notes = event_details.get("meeting_notes_plain", "No notes")
            
            print(f"Meeting: {event_name}")
            print(f"Time: {start_time} to {end_time}")
            print(f"Invitee: {invitee_name}")
            if invitee_email:
                print(f"Invitee Email: {invitee_email}")
            print(f"Join URL: {location}")
            print(f"Notes: {meeting_notes}")
            print("---")
    else:
        print("No meetings found or unexpected response structure.")

except requests.exceptions.RequestException as e:
    print("API call failed:", e)