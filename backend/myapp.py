from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
import requests as http_requests
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True, 
    expose_headers=["Content-Type", "Authorization"], allow_headers=["Content-Type", "Authorization"])

@app.after_request
def add_security_headers(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
    return response

load_dotenv()

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15) 

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True)
    auth_provider = db.Column(db.String(20), default="local")
    
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    first_name = data.get("firstName", "").strip()
    last_name = data.get("lastName", "").strip()    
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not first_name or not last_name or not password or not email:
        return jsonify({"msg":"All fields are required"}), 400
    
    full_name = first_name + " " + last_name

    existing = Users.query.filter_by(email=email).first()
    if existing:
        return jsonify({"msg": "Email already exists..."}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = Users(user_name= full_name, email= email, password=hashed_password)
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Internal server error."}), 500


    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=15))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({"msg": "ok", "access_token": access_token, "refresh_token": refresh_token}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email= data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400
    
    user = Users.query.filter_by(email=email).first()
    

    if user and user.password and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify({"msg" : "ok", "access_token" : access_token, "refresh_token": refresh_token}), 200
    return jsonify({"msg": "Invalid email or password"}) , 400

@app.route("/auth/google", methods=["POST"])
def google_auth():
    token = request.json.get("token")
    action = request.json.get("action")

    if not token:
        return jsonify({"msg": "Google token missing"}), 400

    idinfo = None

    # If token looks like an ID token (JWT with dots), try verifying as id_token
    if "." in token:
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                GOOGLE_CLIENT_ID
            )
        except ValueError as e:
            idinfo = None

    # If not an ID token or verification failed, try using token as an access token
    if not idinfo:
        try:
            resp = http_requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5,
            )
            if resp.status_code != 200:
                return jsonify({"msg": "Invalid Google Token"}), 401
            idinfo = resp.json()
        except Exception as e:
            return jsonify({"msg": "Invalid Google Token"}), 401
    
    email = idinfo["email"]
    name = idinfo.get("name", "")

    if not email:
        return jsonify({"msg": "Email not found in Google token"}), 400

    user = Users.query.filter_by(email=email).first()

    if action == "login":
        if not user:
            return jsonify({"msg": "User not found. Please sign up first."}), 404
        
    elif action == "signup":
        if user:
            return jsonify({"msg": "User already exists. Please log in."}), 400

        if not user:
            user = Users(
                user_name=name,
                email = email,
                password = None,
                auth_provider="google"
            )
            try:
                db.session.add(user)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({"msg": "Internal server error"}), 500
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200



@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_jwt_token():
    user_id = get_jwt_identity()
    new_access = create_access_token(identity=str(user_id), expires_delta=timedelta(minutes=15))
    return jsonify({"access_token": new_access}), 200

@app.route("/me", methods=["GET", "POST"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)

    if not user:
        return jsonify({"msg":"User not found"}), 404
    
    return jsonify({
        "name" : user.user_name,
        "auth_provider": user.auth_provider
    }), 200


@app.route("/changepassword", methods=["POST"])
@jwt_required()
def change_user_password():
    user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)

    if not user:
        return jsonify({"msg":"User not found"}), 404
    
    data = request.json
    old_pwd = data.get("old_password", "")
    new_pwd = data.get("new_password", "")
    
    if not old_pwd or not new_pwd:
        return jsonify({"msg": "Both passwords are required"}), 400
    
    if not bcrypt.check_password_hash(user.password, old_pwd):
        return jsonify({"msg": "Previous password is incorrect. Enter the correct one"}), 401
    
    if bcrypt.check_password_hash(user.password, new_pwd):
        return jsonify({"msg": "New password must be different"}), 400
    
    user.password= bcrypt.generate_password_hash(new_pwd).decode("utf-8")
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "internal server error" }), 500

    return jsonify({"msg": "Password updated successfully"}), 200

@app.route("/changeusername", methods=["POST"])
@jwt_required()
def change_user_name():
    user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)

    if not user:
        return jsonify({"msg":"User not found"}), 404
    
    data = request.json
    updated_user_name = data.get("user_name", "").strip()

    if not updated_user_name:
        return jsonify({"msg": "Name is required"}), 400
    
    user.user_name = updated_user_name
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Internal Server Error."}), 500

    return jsonify({"msg": "Name changed successfully."}), 200

@app.route("/deleteaccount", methods=["DELETE"])
@jwt_required()
def delete_user_account():
    user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.json
    user_email = data.get("user_email", "").strip()
    user_password = data.get("user_password", "")

    if not user_email:
        return jsonify({"msg": "Email and password are required. Please type correct to proceed."}), 400
    
    if user_email != user.email:
        return jsonify({"msg": "Email is incorrect."}), 400
    
    if user.auth_provider == "local":
        if not user_password:
            return jsonify({"msg": "Password is required for local accounts."}), 400
        if not bcrypt.check_password_hash(user.password, user_password):
            return jsonify({"msg": "Password is incorrect. Please type correct to proceed."}), 400
    
    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Internal server error."}), 500

    return jsonify({"msg": "Account deleted successfully"}), 200
    

# Helpful JWT error handlers for debugging and clearer client messages
@jwt.unauthorized_loader
def custom_unauthorized_response():
    return jsonify({"msg": "Missing or invalid Authorization header"}), 401

@jwt.invalid_token_loader
def custom_invalid_token_response():
    return jsonify({"msg": "Invalid token"}), 422

@jwt.expired_token_loader
def custom_expired_token_response():
    return jsonify({"msg": "Token has expired"}), 401


if __name__ == "__main__":
    # with app.app_context():
    #     db.create_all()
    #     print("db created!")
    app.run()  