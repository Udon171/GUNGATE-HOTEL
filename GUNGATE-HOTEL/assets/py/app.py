# Backend Python Code
# This code is a simple Flask application that manages hotel room bookings.
# It includes endpoints to check room availability, book rooms, and send email notifications upon booking.
from flask import Flask, request, jsonify
import sqlite3
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

# Initialize database


def init_db():
    conn = sqlite3.connect(
        'hotel.db'
    )
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY,
        type TEXT NOT NULL
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        checkin DATE,
        checkout DATE,
        customer_name TEXT,
        customer_email TEXT,
        FOREIGN KEY (room_id) REFERENCES rooms(id)
    )''')
    # Insert sample rooms if not exist
    c.execute(
        "INSERT OR IGNORE INTO rooms (id, type) VALUES "
        "(1, 'Standard'), (2, 'Deluxe'), (3, 'Suite')"
    )
    conn.commit()
    conn.close()


init_db()

# Fetch all booked dates for a specific room
@app.route('/booked_dates/<int:room_id>', methods=['GET'])
def get_booked_dates(room_id):
    conn = sqlite3.connect('hotel.db')
    c = conn.cursor()
    c.execute(
        '''SELECT checkin, checkout FROM bookings WHERE room_id = ?''', 
        (room_id,)
    )
    bookings = [{'checkin': row[0], 'checkout': row[1]} for row in c.fetchall()]
    conn.close()

    return jsonify({'booked_dates': bookings})

# Check room availability
@app.route('/check_availability', methods=['POST'])
def check_availability():
    data = request.get_json()  # Extract JSON data from the request
    checkin = data['checkin']
    checkout = data['checkout']
    
    conn = sqlite3.connect('hotel.db')
    c = conn.cursor()
    # Find rooms that are not booked for the selected dates
    c.execute('''SELECT r.id, r.type FROM rooms r
                WHERE r.id NOT IN (
                    SELECT b.room_id FROM bookings b
                    WHERE (b.checkin <= ? AND b.checkout >= ?)
                )''', (checkout, checkin))
    available_rooms = [{'id': row[0], 'type': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify({'available_rooms': available_rooms})

# Handle booking
@app.route('/book', methods=['POST'])
def book():
    data = request.get_json()
    checkin = data['checkin']
    checkout = data['checkout']
    room_id = data['room_id']
    customer_name = data['name']
    customer_email = data['email']

    # Validate dates
    try:
        checkin_date = datetime.strptime(checkin, '%Y-%m-%d')
        checkout_date = datetime.strptime(checkout, '%Y-%m-%d')
        if checkin_date >= checkout_date:
            return jsonify({'error': 'Check-out date must be after check-in date'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    # Check availability again 
    # to prevent race conditions
    conn = sqlite3.connect('hotel.db')
    c = conn.cursor()
    c.execute(
        '''
        SELECT id 
        FROM rooms 
        WHERE id = ? 
        AND id NOT IN (
            SELECT room_id 
            FROM bookings
            WHERE (checkin <= ? AND checkout >= ?)
        )
        ''', 
        (
            room_id, 
            checkout, 
            checkin
        )
    )
    if not c.fetchone():
        conn.close()
        return jsonify({'error': 'Room is no longer available'}), 400

    # Insert booking
    c.execute('''INSERT INTO bookings (room_id, checkin, checkout, customer_name, customer_email)
                VALUES (?, ?, ?, ?, ?)''', (room_id, checkin, checkout, customer_name, customer_email))
    conn.commit()
    conn.close()

    # Send email notification
    send_email(customer_name, customer_email, room_id, checkin, checkout)

    # Return success response
    return jsonify({'message': 'Booking successful! Redirecting to confirmation.html page.'})

# Send email notification
def send_email(customer_name, customer_email, room_id, checkin, checkout):
    sender = "bookings@gungate-hotel.com" # Replace with your email
    receiver = "hotel_bookings@gungate-hotel.com"  # Replace with hotel email
    password = "X353ngsJrl!5"  # Replace with your email password or app-specific password

    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = receiver
    msg['Subject'] = 'New Booking Confirmation'
    body = f"""New Booking Details:
    Customer Name: {customer_name}
    Customer Email: {customer_email}
    Room ID: {room_id}
    Check-In: {checkin}
    Check-Out: {checkout}"""
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)  # Use your SMTP server
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, receiver, msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Email sending failed: {e}")

if __name__ == '__main__':
    app.run(debug=True)
