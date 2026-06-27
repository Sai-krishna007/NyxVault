from flask import Blueprint

# Expose function to register all blueprints on the app
def register_blueprints(app):
    from .auth_routes import auth_bp
    from .stats_routes import stats_bp
    from .file_routes import file_bp
    from .share_routes import share_bp
    from .integrity_routes import integrity_bp
    from .alert_routes import alert_bp
    from .log_routes import log_bp
    from .admin_routes import admin_bp
    from .api_key_routes import api_key_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(file_bp, url_prefix='/api/files')
    app.register_blueprint(share_bp, url_prefix='/api/sharing')
    app.register_blueprint(integrity_bp, url_prefix='/api/integrity')
    app.register_blueprint(alert_bp, url_prefix='/api/alerts')
    app.register_blueprint(log_bp, url_prefix='/api/logs')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(api_key_bp, url_prefix='/api/keys')
