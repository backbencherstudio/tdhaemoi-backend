# import psycopg2
# from urllib.parse import urlparse

# # Base database URL
# DATABASE_URL = "postgresql://postgres:9223@nirob.signalsmind.com:5432/e_learning_platform"

# # Parse connection info
# parsed = urlparse(DATABASE_URL)
# user = parsed.username
# password = parsed.password
# host = parsed.hostname
# port = parsed.port

# conn = psycopg2.connect(
#     dbname="postgres",
#     user=user,
#     password=password,
#     host=host,
#     port=port
# )
# conn.autocommit = True
# cur = conn.cursor()


# for i in range(11, 11000):
#     db_name = f"prince_nirob_{i}"
#     try:
#         cur.execute(f"CREATE DATABASE {db_name};")
#         print(f"Database created: {db_name}")
#     except psycopg2.errors.DuplicateDatabase:
#         print(f"Database already exists: {db_name}")

# cur.close()
# conn.close()



# import psycopg2
# from urllib.parse import urlparse

# # Base database URL
# DATABASE_URL = "postgresql://postgres:9223@nirob.signalsmind.com:5432/e_learning_platform"

# # Parse connection info
# parsed = urlparse(DATABASE_URL)
# user = parsed.username
# password = parsed.password
# host = parsed.hostname
# port = parsed.port

# # Connect to the default database (not one you want to drop)
# conn = psycopg2.connect(
#     dbname="postgres",
#     user=user,
#     password=password,
#     host=host,
#     port=port
# )
# conn.autocommit = True
# cur = conn.cursor()

# # Drop databases prince_nirob_11 ... prince_nirob_10999
# for i in range(2, 11):
#     db_name = f"prince_nirob_{i}"
#     try:
#         cur.execute(f"DROP DATABASE {db_name};")
#         print(f"Database dropped: {db_name}")
#     except psycopg2.errors.InvalidCatalogName:
#         print(f"Database does not exist: {db_name}")
#     except Exception as e:
#         print(f"Error dropping {db_name}: {e}")

# cur.close()
# conn.close()
