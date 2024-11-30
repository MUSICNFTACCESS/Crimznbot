from flask import Flask, render_template, request, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a strong secret key
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# User storage (in-memory for simplicity, use a database for production)
users = {}

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    if user_id in users:
        return User(user_id)
    return None

@app.route('/')
def home():
    return 'Welcome to Beyond Borders Consulting! <a href="/login">Login</a>'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        if email in users and check_password_hash(users[email]['password'], password):
            user = User(email)
            login_user(user)
            return redirect(url_for('dashboard'))
        return 'Invalid credentials'
    return '''
        <form method="post">
            Email: <input type="text" name="email"><br>
            Password: <input type="password" name="password"><br>
            <input type="submit" value="Login">
        </form>
    '''

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = generate_password_hash(request.form['password'])
        users[email] = {'password': password}
        return 'User registered! <a href="/login">Login</a>'
    return '''
        <form method="post">
            Email: <input type="text" name="email"><br>
            Password: <input type="password" name="password"><br>
            <input type="submit" value="Signup">
        </form>
    '''

@app.route('/dashboard')
@login_required
def dashboard():
    return 'Welcome to your dashboard! <a href="/logout">Logout</a>'

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return 'You have been logged out! <a href="/">Home</a>'

if __name__ == '__main__':
    app.run(debug=True)
