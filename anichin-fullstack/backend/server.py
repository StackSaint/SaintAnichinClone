import logging
import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_pymongo import PyMongo
from dotenv import load_dotenv

# --- IMPORT ORIGINAL DONGHUA SCRAPER ---
from api import Main 

load_dotenv()

# --- CONFIGURATION ---
logging.basicConfig(level=logging.INFO, handlers=[logging.StreamHandler(sys.stdout)])
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Security & Database Config (Keep MongoDB!)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secret-key-123')
app.config['MONGO_URI'] = os.getenv('MONGO_URI') 
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-456')

CORS(app)
mongo = PyMongo(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# --- INITIALIZE ONLY DONGHUA SCRAPER ---
scraper = Main()

# Collections
users_collection = mongo.db.users
bookmarks_collection = mongo.db.bookmarks

# --- AUTH ROUTES (Unchanged) ---

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if users_collection.find_one({"username": data['username']}):
        return jsonify({"message": "Username already exists"}), 400
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    users_collection.insert_one({"username": data['username'], "password": hashed_password})
    return jsonify({"message": "User created successfully"}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = users_collection.find_one({"username": data.get('username')})
    if user and bcrypt.check_password_hash(user['password'], data.get('password')):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify(access_token=access_token, username=user['username']), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/user/bookmarks', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def handle_bookmarks():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        bookmarks = bookmarks_collection.find({"user_id": user_id})
        output = []
        for b in bookmarks:
            output.append({'slug': b['slug'], 'title': b['title'], 'thumbnail': b.get('thumbnail')})
        return jsonify(output), 200

    if request.method == 'POST':
        data = request.get_json()
        if bookmarks_collection.find_one({"user_id": user_id, "slug": data['slug']}):
            return jsonify({"message": "Already bookmarked"}), 409
        bookmarks_collection.insert_one({
            "user_id": user_id, "slug": data['slug'], "title": data['title'], "thumbnail": data.get('thumbnail')
        })
        return jsonify({"message": "Added to bookmarks"}), 201

    if request.method == 'DELETE':
        slug = request.args.get('slug')
        result = bookmarks_collection.delete_one({"user_id": user_id, "slug": slug})
        if result.deleted_count > 0: return jsonify({"message": "Removed"}), 200
        return jsonify({"message": "Not found"}), 404

# --- PUBLIC DONGHUA ROUTES ---

@app.route('/')
def read_root():
    page = request.args.get("page", 1)
    return jsonify(scraper.get_home(int(page)))

@app.route('/search/<query>')
def search(query):
    return jsonify(scraper.search(query))

@app.route('/anime/<slug>')
def get_info(slug):
    return jsonify(scraper.get_info(slug))

@app.route('/episode/<slug>')
def get_episode(slug):
    return jsonify(scraper.get_episode(slug))

@app.route('/video-source/<slug>')
def get_video(slug):
    return jsonify(scraper.get_video_source(slug))

@app.route('/genres')
def get_genres():
    return jsonify(scraper.genres())

@app.route('/genre/<slug>')
def get_genre_detail(slug):
    page = request.args.get("page", 1)
    return jsonify(scraper.genres(slug, int(page)))

if __name__ == "__main__":
    print("Starting Donghua Server (Original) on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)