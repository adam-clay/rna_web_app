from fastapi import FastAPI
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict

app = FastAPI()

with open("SECRET.txt") as f:
    PASSWORD = f.read()

# CORS middleware (fast-api on 8000, react on 3000)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/filenames")
def get_filenames():
    conn = mysql.connector.connect(
        host='localhost',
        user='aclay',
        password=PASSWORD,
        database='rnaDatabaseDonut'
    )
    cursor = conn.cursor()

    cursor.execute("SELECT DISTINCT filename FROM rnaData")
    filenames = [row[0] for row in cursor.fetchall()]

    cursor.close()
    conn.close()

    return {"filenames": filenames}

@app.get("/data/{filename}")
def get_data(filename: str):
    conn = mysql.connector.connect(
        host='localhost',
        user='aclay',
        password=PASSWORD,
        database='rnaDatabaseDonut'
    )
    cursor = conn.cursor()

    cursor.execute("SELECT license_plate, counts FROM RNAData WHERE filename=%s", (filename,))
    data = cursor.fetchall()

    counted_data = defaultdict(int)
    unique_data = defaultdict(int)
    
    for license_plate, count in data:
        # hopefully these licencse plates are always the same
        prefix = license_plate.split("-")[0] 
        # considering counts
        counted_data[prefix] += count
        # only considering entries
        unique_data[prefix] += 1
 

    result = [[k,v] for k,v in counted_data.items()]
    unique_result = [[k, v] for k, v in unique_data.items()]

    cursor.close()
    conn.close()

    return {"data": result, "unique_data": unique_result}




