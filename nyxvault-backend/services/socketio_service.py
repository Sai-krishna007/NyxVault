"""
socketio_service.py
====================
Shared Flask-SocketIO instance and event handlers for NyxVault.

Clients authenticate their WebSocket session by emitting `join_room`
with their JWT token immediately after connecting.  The server decodes
the token and places the socket in a private room keyed by user_id so
that alerts can be pushed to exactly the right user.
"""

from flask_socketio import SocketIO, join_room, leave_room, emit

# Single shared SocketIO instance – initialised in app.py with the Flask app
socketio = SocketIO()


def init_socketio(app):
    """Attach SocketIO to the Flask application."""
    socketio.init_app(
        app,
        cors_allowed_origins="*",
        async_mode='threading',
        logger=False,
        engineio_logger=False,
    )
    return socketio


# ---------------------------------------------------------------------------
# Helper called by alert_service to push events to a specific user room
# ---------------------------------------------------------------------------

def emit_to_user(user_id: str, event: str, data: dict):
    """Emit a SocketIO event to all sockets in the user's private room."""
    try:
        socketio.emit(event, data, room=user_id)
    except Exception:
        pass  # Never crash the calling request if WebSocket is unavailable


# ---------------------------------------------------------------------------
# SocketIO event handlers
# ---------------------------------------------------------------------------

@socketio.on('connect')
def on_connect():
    """Client connected – room assignment happens on 'join_room'."""
    pass


@socketio.on('disconnect')
def on_disconnect():
    pass


@socketio.on('join_room')
def on_join_room(data):
    """
    Client emits: { token: "<JWT>" }
    Server decodes the JWT, extracts user_id, and adds the socket to
    a private room so subsequent alerts are delivered only to this user.
    """
    try:
        from services.auth_service import decode_token
        token = data.get('token', '')
        payload = decode_token(token)
        if payload:
            user_id = payload.get('user_id')
            join_room(user_id)
            emit('room_joined', {'room': user_id})
    except Exception:
        pass
