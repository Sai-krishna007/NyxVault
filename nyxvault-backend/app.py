import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from database.db import db
from config.settings import Config
from routes import register_blueprints

def create_app(config_class=Config):
    # Resolve absolute path to the sibling frontend directory 'nyxvault'
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'nyxvault'))

    app = Flask(__name__,
                static_folder=frontend_dir,
                static_url_path='')

    app.config.from_object(config_class)

    # Initialize database
    db.init_app(app)

    # Database migration: ensure 'watermark' column exists in 'users' table
    with app.app_context():
        try:
            import sqlite3
            db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///nyxvault.db')
            if db_uri.startswith('sqlite:///'):
                db_path = db_uri.replace('sqlite:///', '')
                # Resolve relative to backend folder
                if not os.path.isabs(db_path):
                    db_path = os.path.join(os.path.dirname(__file__), db_path)
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("PRAGMA table_info(users)")
                columns = [c[1] for c in cursor.fetchall()]
                if 'watermark' not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN watermark BOOLEAN DEFAULT 0;")
                    conn.commit()
                if 'mfa_secret' not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(100) NULL;")
                    conn.commit()
                if 'mfa_enabled' not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT 0;")
                    conn.commit()
                if 'refresh_token' not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN refresh_token VARCHAR(255) NULL;")
                    conn.commit()

                # Ensure all users are on the Enterprise plan (pricing removed)
                cursor.execute("UPDATE users SET plan = 'Enterprise'")
                conn.commit()

                # Database migration for files table: ensure zero-knowledge columns exist
                cursor.execute("PRAGMA table_info(files)")
                file_columns = [c[1] for c in cursor.fetchall()]
                if 'is_zero_knowledge' not in file_columns:
                    cursor.execute("ALTER TABLE files ADD COLUMN is_zero_knowledge BOOLEAN DEFAULT 0 NOT NULL;")
                    conn.commit()
                if 'wrapped_key' not in file_columns:
                    cursor.execute("ALTER TABLE files ADD COLUMN wrapped_key TEXT NULL;")
                    conn.commit()
                
                # Create api_keys table if not exists
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS api_keys (
                        id VARCHAR(50) PRIMARY KEY,
                        user_id VARCHAR(50) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        prefix VARCHAR(50) NOT NULL,
                        key_hash VARCHAR(64) NOT NULL UNIQUE,
                        created_at VARCHAR(100) NOT NULL,
                        last_used_at VARCHAR(100),
                        status VARCHAR(50) NOT NULL DEFAULT 'active',
                        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                """)
                conn.commit()
                
                conn.close()
        except Exception:
            pass

    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Ensure upload directory exists inside backend directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register API blueprints
    register_blueprints(app)

    # Professional sharing link shortener route
    @app.route('/s/<token>', methods=['GET', 'POST'])
    def public_share_shortener(token):
        from routes.share_routes import access_shared_file
        return access_shared_file(token)

    # Serve SPA frontend files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app


if __name__ == '__main__':
    app = create_app()

    # Import and initialise SocketIO after app creation to avoid circular imports
    from services.socketio_service import init_socketio
    socketio = init_socketio(app)

    port = app.config.get('PORT', 3000)
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)
